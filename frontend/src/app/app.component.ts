import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { StockService } from './stock.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  activeTab = 'home';
  user: { name?: string; email?: string; loggedIn: boolean } = { loggedIn: false };
  ticker = '';
  stockResult: any = null;
  stockError = '';
  loadingStock = false;

  constructor(private auth: AuthService, private stockService: StockService) {}

  ngOnInit() {
    this.auth.auth$.subscribe(state => {
      this.user = state;
    });

    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      const name = params.get('name') || 'Google User';
      const email = params.get('email') || '';
      this.auth.setUser({ name, email });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  selectTab(tab: string) {
    this.activeTab = tab;
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
