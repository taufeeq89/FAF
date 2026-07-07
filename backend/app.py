import os
from datetime import datetime
from urllib.parse import urlencode

from flask import Flask, jsonify, render_template, redirect, request
from flask_cors import CORS
import requests
import yfinance as yf
from dotenv import load_dotenv
from pymongo import MongoClient

# Import modules from our segregated ecosystem files
from services import fmp_v3, fmp_stable, try_endpoints, fetch_yfinance_eps
from models import get_terminal_growth, run_dcf_engine

app = Flask(__name__)
CORS(app)

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
app.secret_key = os.getenv("FLASK_SECRET_KEY", "change-me")

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:5001/api/auth/callback")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:4200")

mongo_client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
mongo_db = mongo_client[os.getenv("MONGO_DB", "faf_db")]
zakat_collection = mongo_db[os.getenv("MONGO_COLLECTION", "zakat_calculations")]


@app.route("/api/auth/google")
def auth_google():
    if (not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET
            or GOOGLE_CLIENT_SECRET == "your-google-client-secret"):
        return jsonify({"error": "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env"}), 500

    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode({
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
    })
    return jsonify({"authUrl": auth_url})


@app.route("/api/auth/callback")
def auth_google_callback():
    code = request.args.get("code")
    if not code:
        return jsonify({"error": "Missing authorization code"}), 400

    try:
        token_response = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            timeout=20,
        )
        token_response.raise_for_status()
        access_token = token_response.json().get("access_token")
        if not access_token:
            raise ValueError("token_missing")

        profile_response = requests.get(
            "https://openidconnect.googleapis.com/v1/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=20,
        )
        profile_response.raise_for_status()
        profile = profile_response.json()
    except requests.HTTPError:
        return redirect(f"{FRONTEND_URL}/?auth=error&reason=oauth_unauthorized")
    except Exception:
        return redirect(f"{FRONTEND_URL}/?auth=error&reason=oauth_failed")

    redirect_params = urlencode({
        "auth": "success",
        "name": profile.get("name", ""),
        "email": profile.get("email", ""),
    })
    return redirect(f"{FRONTEND_URL}/?{redirect_params}")


@app.route("/api/auth/logout", methods=["POST"])
def auth_logout():
    return jsonify({"message": "logged out"})

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/stock/<ticker>")
def stock_data(ticker):
    ticker = ticker.upper().strip()
    result = {}
    errors = []

    profile_data, err = try_endpoints([
        (fmp_v3, f"profile/{ticker}"),
        (fmp_stable, f"profile/{ticker}"),
    ])
    
    if profile_data:
        p = profile_data[0] if isinstance(profile_data, list) else profile_data
        p_price = round(float(p.get("price", 0) or 0), 2)
        p_pe = round(float(p.get("pe", 0) or 0), 2)
        p_beta = round(float(p.get("beta", 1.0) or 1.0), 2)

        result.update({
            "companyName": p.get("companyName", ticker),
            "ticker": p.get("symbol", ticker),
            "exchange": p.get("exchangeShortName", p.get("exchange", "")),
            "sector": p.get("sector", "Healthcare"),
            "industry": p.get("industry", "Medical Devices"),
            "mktCap": p.get("mktCap", 0),
            "beta": p_beta,
            "price": p_price,
            "priceSource": "FMP /profile — primary core data",
            "peRatio": p_pe,
        })
    else:
        errors.append(f"FMP Profile blocked (403/Restricted Tier). Deploying yfinance recovery framework. Original error: {err}")
        try:
            yf_ticker = yf.Ticker(ticker)
            yf_info = yf_ticker.info
            
            p_price = round(float(yf_info.get("currentPrice") or yf_info.get("regularMarketPrice") or 0), 2)
            p_pe = round(float(yf_info.get("trailingPE") or yf_info.get("forwardPE") or 0), 2)
            p_beta = round(float(yf_info.get("beta") or 1.0), 2)

            result.update({
                "companyName": yf_info.get("longName", ticker),
                "ticker": ticker,
                "exchange": yf_info.get("exchange", "NYSE"),
                "sector": yf_info.get("sector", "Healthcare"),
                "industry": yf_info.get("industry", "Medical Devices"),
                "mktCap": yf_info.get("marketCap", 0),
                "beta": p_beta if p_beta > 0 else 1.0,
                "price": p_price,
                "priceSource": "yfinance — profile scraping data engine backup",
                "peRatio": p_pe,
            })
        except Exception as yf_prof_err:
            return jsonify({"error": f"Profile execution completely locked. Failed FMP and yfinance options: {yf_prof_err}"}), 404

    p_price = result["price"]
    p_pe = result["peRatio"]

    try:
        q_data, _ = try_endpoints([
            (fmp_v3, f"quote/{ticker}"),
            (fmp_stable, f"quote/{ticker}"),
        ])
        if q_data:
            q = q_data[0] if isinstance(q_data, list) else q_data
            if q.get("price"):
                result["price"] = round(float(q["price"]), 2)
                result["priceSource"] = f"FMP /quote — live tracking (as of {datetime.now().strftime('%H:%M:%S')})"
    except Exception as e:
        errors.append(f"Quote module fallback skipped: {e}")

    try:
        inc, _ = try_endpoints([
            (fmp_v3, f"income-statement/{ticker}", {"limit": 1}),
            (fmp_stable, f"income-statement/{ticker}", {"limit": 1}),
        ])
        if inc:
            row = inc[0] if isinstance(inc, list) else inc
            eps_val = row.get("epsdiluted") or row.get("eps")
            if eps_val is None:
                raise ValueError("EPS elements missing from FMP statement data")
            result["eps"] = round(float(eps_val), 2)
            result["epsSource"] = f"FMP /income-statement — diluted EPS"
        else:
            raise ValueError("FMP tier restriction blocked statement")
    except Exception as e:
        errors.append(f"Income statement FMP failed: {e}")
        try:
            eps_val, source_label = fetch_yfinance_eps(ticker)
            result["eps"] = eps_val
            result["epsSource"] = source_label
        except Exception as yf_err:
            errors.append(f"yfinance Fallback failed: {yf_err}")
            if p_pe > 0 and p_price > 0:
                result["eps"] = round(p_price / p_pe, 2)
                result["epsSource"] = f"Calculated Profile Proxy (Price ${p_price} / P/E {p_pe})"
            else:
                result["eps"] = 0.0

    try:
        est, _ = try_endpoints([
            (fmp_v3, f"analyst-estimates/{ticker}", {"limit": 6}),
            (fmp_stable, f"analyst-estimates/{ticker}", {"limit": 6}),
        ])
        current_eps = result.get("eps", 0)
        growth_calculated = False

        if est and current_eps > 0:
            rows = est if isinstance(est, list) else [est]
            today_str = datetime.today().strftime("%Y-%m-%d")
            future = [r for r in rows if r.get("date") and r["date"] > today_str]
            future.sort(key=lambda x: x["date"])
            
            if future:
                target_index = min(2, len(future) - 1)
                target_estimate = future[target_index].get("estimatedEpsAvg")
                if target_estimate and target_estimate > 0:
                    years_forward = target_index + 1
                    implied = (pow(target_estimate / current_eps, 1 / years_forward) - 1) * 100
                    result["growthRate"] = round(min(max(implied, 1.0), 50.0), 1)
                    result["growthSource"] = f"FMP /analyst-estimates — implied {years_forward}-yr EPS CAGR"
                    growth_calculated = True

        if not growth_calculated:
            raise ValueError("Insufficient coordinates")
    except Exception as e:
        errors.append(f"Growth estimates: {e}")
        sector_growth_defaults = {"Technology": 12.0, "Healthcare": 8.5, "Consumer Cyclical": 9.0, "Financial Services": 5.5}
        result["growthRate"] = sector_growth_defaults.get(result.get("sector"), 6.5)
        result["growthSource"] = f"Sector tracking proxy baseline default for {result.get('sector', 'General')}"

    try:
        km, _ = try_endpoints([
            (fmp_v3, f"key-metrics/{ticker}", {"limit": 1}),
            (fmp_stable, f"key-metrics/{ticker}", {"limit": 1}),
        ])
        if km:
            row = km[0] if isinstance(km, list) else km
            roic = float(row.get("roic") or 0)
            if roic > 0:
                wacc = round(min(max(roic * 100 * 0.65 + 3.5, 7.0), 16.0), 1)
                result["wacc"] = wacc
                result["waccSource"] = f"FMP /key-metrics — inferred via ROIC {round(roic*100,1)}%"
            else:
                raise ValueError("ROIC calculation out of bounds")
        else:
            raise ValueError("Premium data restricted")
    except Exception as e:
        errors.append(f"Key-metrics/WACC fallback applied: {e}")
        wacc = round(min(max(3.5 + result["beta"] * 5.5, 7.0), 15.0), 1)
        result["wacc"] = wacc
        result["waccSource"] = f"CAPM Alternative: 3.5% Risk-Free Rate + β({result['beta']}) × 5.5% Equity Risk Premium"

    try:
        rat, _ = try_endpoints([
            (fmp_v3, f"ratios/{ticker}", {"limit": 4}),
            (fmp_stable, f"ratios/{ticker}", {"limit": 4}),
        ])
        if rat:
            rows = rat if isinstance(rat, list) else [rat]
            pe_vals = [float(r.get("priceEarningsRatio") or 0) for r in rows if 4.0 < float(r.get("priceEarningsRatio") or 0) < 120.0]
            if pe_vals:
                result["exitPE"] = round(sum(pe_vals) / len(pe_vals), 1)
                result["exitPESource"] = f"FMP /ratios — {len(pe_vals)}-yr historical average trailing P/E"
            else:
                raise ValueError("Out of bounds lookups")
        else:
            raise ValueError("Premium tier locked")
    except Exception as e:
        errors.append(f"Ratios/PE Multiples fallback applied: {e}")
        if p_pe > 4.0:
            result["exitPE"] = p_pe
            result["exitPESource"] = "FMP / profile (or yfinance metadata proxy) current trailing P/E ratio"
        else:
            result["exitPE"] = 16.5
            result["exitPESource"] = "Market baseline valuation multi conservative choice"

    sector = result.get("sector", "")
    result["terminalGrowth"] = get_terminal_growth(sector)
    result["terminalSource"] = f"Long-run macro economic GDP proxy expansion track for {sector or 'unclassified'} sector operations"

    run_dcf_engine(result, errors)

    result["warnings"] = errors
    return jsonify(result)


@app.route("/api/zakat", methods=["POST"])
def save_zakat_calculation():
    payload = request.get_json(silent=True) or {}
    inputs = payload.get("inputs", {})
    result = payload.get("result", {})
    user = payload.get("user", {})

    if not isinstance(inputs, dict) or not isinstance(result, dict) or not isinstance(user, dict):
        return jsonify({"error": "inputs, result and user must be objects"}), 400

    user_email = str(user.get("email", "")).strip().lower()
    if not user_email:
        return jsonify({"error": "logged in user email is required"}), 400

    document = {
        "type": "zakat-calculation",
        "createdAt": datetime.utcnow(),
        "user": {
            "name": str(user.get("name", "")).strip(),
            "email": user_email,
        },
        "inputs": inputs,
        "result": result,
    }

    inserted = zakat_collection.insert_one(document)
    return jsonify({"message": "saved", "id": str(inserted.inserted_id)}), 201


@app.route("/api/zakat/history", methods=["GET"])
def get_zakat_history():
    email = request.args.get("email", "").strip().lower()
    if not email:
        return jsonify({"error": "email is required"}), 400

    cursor = (zakat_collection
              .find({"type": "zakat-calculation", "user.email": email})
              .sort("createdAt", -1)
              .limit(100))

    items = []
    for doc in cursor:
        items.append({
            "id": str(doc.get("_id")),
            "createdAt": doc.get("createdAt").isoformat() if doc.get("createdAt") else "",
            "user": doc.get("user", {}),
            "result": doc.get("result", {}),
            "inputs": doc.get("inputs", {}),
        })

    return jsonify({"items": items})

if __name__ == "__main__":
    print("\n Modular Hybrid Backend Server Online — Listening on Port 5001")
    app.run(debug=True, port=5001)
