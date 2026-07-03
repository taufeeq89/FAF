import os
import requests
from dotenv import load_dotenv

load_dotenv()
FMP_KEY = os.getenv('FMP_API_KEY', '')
FMP_V3_BASE = os.getenv('FMP_V3_BASE', 'https://financialmodelingprep.com/api/v3')
FMP_STABLE_BASE = os.getenv('FMP_STABLE_BASE', 'https://financialmodelingprep.com/api/v3')


def call_api(base_url, path, params=None):
    params = params.copy() if params else {}
    if FMP_KEY:
        params['apikey'] = FMP_KEY
    url = f"{base_url}/{path}"
    resp = requests.get(url, params=params, timeout=15)
    resp.raise_for_status()
    return resp.json()


def fmp_v3(path, params=None):
    return call_api(FMP_V3_BASE, path, params)


def fmp_stable(path, params=None):
    return call_api(FMP_STABLE_BASE, path, params)


def try_endpoints(endpoints):
    errors = []
    for func, path, *extras in endpoints:
        params = extras[0] if extras else None
        try:
            return func(path, params), None
        except Exception as exc:
            errors.append(str(exc))
    return None, '; '.join(errors)


def fetch_yfinance_eps(ticker):
    import yfinance as yf
    yf_ticker = yf.Ticker(ticker)
    info = yf_ticker.info
    eps = info.get('trailingEps') or info.get('forwardEps') or info.get('eps')
    if eps is None:
        raise ValueError('No EPS available from yfinance')
    return round(float(eps), 2), 'yfinance EPS fallback'
