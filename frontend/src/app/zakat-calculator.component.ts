import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ZAKAT_POPUP_CONTENT, ZAKAT_SECTION_POPUPS } from './zakat-popup-content';

@Component({
  selector: 'app-zakat-calculator',
  templateUrl: './zakat-calculator.component.html',
  styleUrls: ['./zakat-calculator.component.css']
})
export class ZakatCalculatorComponent {
  @ViewChild('popupCard') popupCardRef?: ElementRef<HTMLElement>;
  popupType: string | null = null;
  popupContent = ZAKAT_POPUP_CONTENT;
  popupSections = ZAKAT_SECTION_POPUPS;
  gold24Weight = 0;
  gold24PricePerGram = 0;
  gold22Weight = 0;
  gold22PricePerGram = 0;
  gold18Weight = 0;
  gold18PricePerGram = 0;
  otherGold = 0;
  preciousStones = 0;
  silverWeight = 0;
  silverPricePerGram = 0;
  cashInHand = 0;
  cashInSavings = 0;
  cashInCurrent = 0;
  cashInFixedDeposits = 0;
  loansReceivable = 0;
  govtBonds = 0;
  providentFund = 0;
  insurancePremiums = 0;
  sharesAndDividends = 0;
  securityDeposits = 0;
  privateInvestments = 0;
  otherWealth = 0;
  landedProperty = 0;
  businessStockValue = 0;
  businessReceivables = 0;
  businessPayables = 0;
  partnershipCapital = 0;
  partnershipProfitShare = 0;
  agriculturalProduce = 0;
  livestockValue = 0;
  generalLiabilitiesFriends = 0;
  generalLiabilitiesBanks = 0;
  generalLiabilitiesTax = 0;
  otherLiabilities = 0;
  nisab = 0;
  zakatRate = 2.5;

  result: {
    totalAssets: number;
    netAssets: number;
    zakatDue: number;
    isEligible: boolean;
    shortfall: number;
  } | null = null;

  calculateZakat() {
    const totalAssets = this.gold24Estimated
      + this.gold22Estimated
      + this.gold18Estimated
      + this.getNumber(this.otherGold)
      + this.getNumber(this.preciousStones)
      + this.silverEstimated
      + this.getNumber(this.cashInHand)
      + this.getNumber(this.cashInSavings)
      + this.getNumber(this.cashInCurrent)
      + this.getNumber(this.cashInFixedDeposits)
      + this.getNumber(this.loansReceivable)
      + this.getNumber(this.govtBonds)
      + this.getNumber(this.providentFund)
      + this.getNumber(this.insurancePremiums)
      + this.getNumber(this.sharesAndDividends)
      + this.getNumber(this.securityDeposits)
      + this.getNumber(this.privateInvestments)
      + this.getNumber(this.otherWealth)
      + this.getNumber(this.landedProperty)
      + this.getNumber(this.businessStockValue)
      + this.getNumber(this.businessReceivables)
      - this.getNumber(this.businessPayables)
      + this.getNumber(this.partnershipCapital)
      + this.getNumber(this.partnershipProfitShare)
      + this.getNumber(this.agriculturalProduce)
      + this.getNumber(this.livestockValue);

    const totalLiabilities = this.getNumber(this.generalLiabilitiesFriends)
      + this.getNumber(this.generalLiabilitiesBanks)
      + this.getNumber(this.generalLiabilitiesTax)
      + this.getNumber(this.otherLiabilities);

    const netAssets = totalAssets - totalLiabilities;
    const nisabAmount = this.getNumber(this.nisab);
    const isEligible = netAssets >= nisabAmount && nisabAmount > 0;
    const zakatDue = isEligible ? netAssets * (this.zakatRate / 100) : 0;
    const shortfall = nisabAmount > 0 ? Math.max(0, nisabAmount - netAssets) : 0;

    this.result = {
      totalAssets,
      netAssets,
      zakatDue,
      isEligible,
      shortfall
    };
  }

  get totalGeneralLiabilities(): number {
    return this.getNumber(this.generalLiabilitiesFriends)
      + this.getNumber(this.generalLiabilitiesBanks)
      + this.getNumber(this.generalLiabilitiesTax)
      + this.getNumber(this.otherLiabilities);
  }

  private getNumber(value: number | string | null | undefined): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  get gold24Estimated(): number {
    return this.gold24Weight * this.gold24PricePerGram;
  }

  get gold22Estimated(): number {
    return this.gold22Weight * this.gold22PricePerGram;
  }

  get gold18Estimated(): number {
    return this.gold18Weight * this.gold18PricePerGram;
  }

  get silverEstimated(): number {
    return this.silverWeight * this.silverPricePerGram;
  }

  get activePopup(): { title: string; body: string[] } | null {
    if (!this.popupType) {
      return null;
    }

    return this.popupSections[this.popupType] ?? this.popupContent[this.popupType] ?? null;
  }

  openPopup(type: string) {
    this.popupType = type;
    setTimeout(() => this.focusPopup(), 0);
  }

  closePopup() {
    this.popupType = null;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (!this.popupType) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closePopup();
    }

    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  private focusPopup() {
    const popup = this.popupCardRef?.nativeElement;
    const firstFocusable = popup?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    firstFocusable?.focus();
  }

  private trapFocus(event: KeyboardEvent) {
    const popup = this.popupCardRef?.nativeElement;
    if (!popup) {
      return;
    }

    const focusable = popup.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value);
  }
}
