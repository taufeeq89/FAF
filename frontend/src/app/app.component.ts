import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { StockService } from './stock.service';
import { ZakatRecordStateService } from './zakat-record-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  activeTab = 'home';
  user: { name?: string; email?: string; loggedIn: boolean } = { loggedIn: false };
  authError = '';
  zakatRecords: any[] = [];
  loadingZakatRecords = false;
  zakatRecordsError = '';
  ticker = '';
  stockResult: any = null;
  stockError = '';
  loadingStock = false;

  constructor(
    private auth: AuthService,
    private stockService: StockService,
    private zakatRecordState: ZakatRecordStateService
  ) {}

  ngOnInit() {
    this.auth.auth$.subscribe(state => {
      this.user = state;
      if (state.loggedIn && state.email) {
        this.loadZakatHistory(state.email);
      } else {
        this.zakatRecords = [];
        this.zakatRecordsError = '';
      }
    });

    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      const name = params.get('name') || 'Google User';
      const email = params.get('email') || '';
      this.auth.setUser({ name, email });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('auth') === 'error') {
      const reason = params.get('reason') || 'oauth_failed';
      this.authError = reason === 'oauth_unauthorized'
        ? 'Google sign-in failed: invalid client secret or redirect URI mismatch in Google Cloud.'
        : 'Google sign-in failed. Please check backend OAuth configuration.';
      this.auth.clearUser();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  selectTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'profile' && this.user.loggedIn && this.user.email) {
      this.loadZakatHistory(this.user.email);
    }
  }

  login() {
    this.auth.login().subscribe(response => {
      window.location.href = response.authUrl;
    });
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.auth.clearUser();
      this.activeTab = 'home';
    });
  }

  loadZakatHistory(email: string) {
    this.loadingZakatRecords = true;
    this.zakatRecordsError = '';
    this.stockService.getZakatHistory(email).subscribe(
      data => {
        this.zakatRecords = Array.isArray(data?.items) ? data.items : [];
        this.loadingZakatRecords = false;
      },
      () => {
        this.zakatRecords = [];
        this.loadingZakatRecords = false;
        this.zakatRecordsError = 'Could not load saved Zakat records.';
      }
    );
  }

  editRecordInZakatForm(record: any) {
    this.zakatRecordState.setEditingRecord(record);
    this.activeTab = 'zakat';
  }

  lookupStock() {
    if (!this.ticker.trim()) {
      this.stockError = 'Enter a ticker symbol first.';
      return;
    }

    this.loadingStock = true;
    this.stockResult = null;
    this.stockError = '';

    this.stockService.getStock(this.ticker).subscribe(
      data => {
        this.stockResult = data;
        this.loadingStock = false;
      },
      error => {
        this.stockError = error.error?.error || 'Cannot fetch stock data.';
        this.loadingStock = false;
      }
    );
  }
}
