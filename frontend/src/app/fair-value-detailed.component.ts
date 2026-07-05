import { Component } from '@angular/core';
import { StockService } from './stock.service';

@Component({
  selector: 'app-fair-value-detailed',
  templateUrl: './fair-value-detailed.component.html',
  styleUrls: ['./fair-value-detailed.component.css']
})
export class FairValueDetailedComponent {
  ticker = '';
  stockResult: any = null;
  stockError = '';
  loadingStock = false;

  constructor(private stockService: StockService) {}

  lookupStock() {
    const input = this.ticker.trim().toUpperCase();
    if (!input) {
      this.stockError = 'Enter a ticker symbol first.';
      return;
    }

    this.ticker = input;
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

  formatNumber(value: any, digits = 2): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return 'N/A';
    }
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(Number(value));
  }

  formatCurrency(value: any): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return 'N/A';
    }
    return `$${this.formatNumber(value, 2)}`;
  }

  formatPercent(value: any, digits = 1): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return 'N/A';
    }
    return `${this.formatNumber(value, digits)}%`;
  }

  premiumDiscount(): string {
    const price = Number(this.stockResult?.price);
    const intrinsic = Number(this.stockResult?.intrinsicValue);
    if (price > 0 && intrinsic > 0) {
      return `${this.formatNumber(((price - intrinsic) / intrinsic) * 100, 1)}%`;
    }
    return 'N/A';
  }
}
