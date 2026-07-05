import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ZAKAT_POPUP_CONTENT, ZAKAT_SECTION_POPUPS } from './zakat-popup-content';
import jsPDF from 'jspdf';
import Papa from 'papaparse';

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
  businessSaleableStock = 0;
  businessDamagedStock = 0;
  businessReceivables = 0;
  businessPayables = 0;
  businessBadDebts = 0;
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
      + this.businessTotalStockValue
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
    const isEligible = nisabAmount > 0 ? netAssets >= nisabAmount : netAssets > 0;
    const zakatDue = isEligible && netAssets > 0 ? netAssets * (this.zakatRate / 100) : 0;
    const shortfall = nisabAmount > 0 ? Math.max(0, nisabAmount - netAssets) : 0;

    this.result = {
      totalAssets,
      netAssets,
      zakatDue,
      isEligible,
      shortfall
    };
  }

  onValueChange() {
    this.calculateZakat();
  }

  get totalGeneralLiabilities(): number {
    return this.getNumber(this.generalLiabilitiesFriends)
      + this.getNumber(this.generalLiabilitiesBanks)
      + this.getNumber(this.generalLiabilitiesTax)
      + this.getNumber(this.otherLiabilities);
  }

  get businessTotalStockValue(): number {
    return this.getNumber(this.businessSaleableStock)
      + this.getNumber(this.businessDamagedStock)
      + this.getNumber(this.businessReceivables)
      - this.getNumber(this.businessPayables)
      - this.getNumber(this.businessBadDebts);
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

  get goldSectionTotal(): number {
    return this.gold24Estimated + this.gold22Estimated + this.gold18Estimated + this.getNumber(this.otherGold);
  }

  get goldSectionZakat(): number {
    return this.goldSectionTotal * 0.025;
  }

  get preciousStonesZakat(): number {
    return this.getNumber(this.preciousStones) * 0.025;
  }

  get silverSectionZakat(): number {
    return this.silverEstimated * 0.025;
  }

  get cashSectionTotal(): number {
    return this.getNumber(this.cashInHand) + this.getNumber(this.cashInSavings) + this.getNumber(this.cashInCurrent) + this.getNumber(this.cashInFixedDeposits);
  }

  get cashSectionZakat(): number {
    return this.cashSectionTotal * 0.025;
  }

  get investmentsSectionTotal(): number {
    return this.getNumber(this.loansReceivable) + this.getNumber(this.govtBonds) + this.getNumber(this.providentFund) + this.getNumber(this.insurancePremiums) + this.getNumber(this.sharesAndDividends) + this.getNumber(this.securityDeposits) + this.getNumber(this.privateInvestments) + this.getNumber(this.otherWealth);
  }

  get investmentsSectionZakat(): number {
    return this.investmentsSectionTotal * 0.025;
  }

  get landedPropertyZakat(): number {
    return this.getNumber(this.landedProperty) * 0.025;
  }

  get businessZakat(): number {
    return this.businessTotalStockValue * 0.025;
  }

  get partnershipNetWorth(): number {
    return this.getNumber(this.partnershipCapital) + this.getNumber(this.partnershipProfitShare) - this.getNumber(this.businessPayables);
  }

  get partnershipZakat(): number {
    return this.partnershipNetWorth * 0.025;
  }

  get livestockZakat(): number {
    return this.getNumber(this.livestockValue) / 40;
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

  exportToCSV() {
    if (!this.result) {
      alert('Please fill in the form to calculate zakat first');
      return;
    }

    const data = {
      'Zakat Calculation Report': '',
      'Date': new Date().toLocaleDateString(),
      '': '',
      'ASSETS BREAKDOWN': '',
      'Gold (24, 22, 18 Carat + Other)': this.formatCurrency(this.goldSectionTotal),
      'Precious Stones': this.formatCurrency(this.getNumber(this.preciousStones)),
      'Silver': this.formatCurrency(this.silverEstimated),
      'Cash (Hand + Bank Accounts)': this.formatCurrency(this.cashSectionTotal),
      'Investments': this.formatCurrency(this.investmentsSectionTotal),
      'Landed Property': this.formatCurrency(this.getNumber(this.landedProperty)),
      'Business Stock': this.formatCurrency(this.businessTotalStockValue),
      'Partnership': this.formatCurrency(this.partnershipNetWorth),
      'Agricultural Produce': this.formatCurrency(this.getNumber(this.agriculturalProduce)),
      'Livestock': this.formatCurrency(this.getNumber(this.livestockValue)),
      '': '',
      'LIABILITIES': '',
      'Friends/Relatives': this.formatCurrency(this.getNumber(this.generalLiabilitiesFriends)),
      'Banks/Institutions': this.formatCurrency(this.getNumber(this.generalLiabilitiesBanks)),
      'Tax': this.formatCurrency(this.getNumber(this.generalLiabilitiesTax)),
      'Other Liabilities': this.formatCurrency(this.getNumber(this.otherLiabilities)),
      '': '',
      'ZAKAT CALCULATION': '',
      'Total Assets': this.formatCurrency(this.result.totalAssets),
      'Total Liabilities': this.formatCurrency(this.totalGeneralLiabilities),
      'Net Assets': this.formatCurrency(this.result.netAssets),
      'Nisab': this.formatCurrency(this.getNumber(this.nisab)),
      'Zakat Rate (%)': this.zakatRate,
      'Eligible for Zakat': this.result.isEligible ? 'Yes' : 'No',
      'Zakat Due': this.formatCurrency(this.result.zakatDue),
      'Shortfall (if not eligible)': this.formatCurrency(this.result.shortfall)
    };

    const csvData = Object.entries(data).map(([key, value]) => [key, value]);
    const csv = Papa.unparse(csvData);
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Zakat_Report_${new Date().getTime()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  exportToPDF() {
    if (!this.result) {
      alert('Please fill in the form to calculate zakat first');
      return;
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 15;

    const addHeading = (text: string, fontSize: number = 14) => {
      pdf.setFontSize(fontSize);
      pdf.setTextColor(29, 78, 216);
      pdf.text(text, 10, yPosition);
      yPosition += 8;
    };

    const addRow = (label: string, value: string, fontSize: number = 10) => {
      pdf.setFontSize(fontSize);
      pdf.setTextColor(0, 0, 0);
      pdf.text(label, 10, yPosition);
      pdf.text(value, 160, yPosition, { align: 'right' });
      yPosition += 6;
      
      if (yPosition > pageHeight - 10) {
        pdf.addPage();
        yPosition = 15;
      }
    };

    // Title
    addHeading('Zakat Calculator Report', 16);
    addRow('Date', new Date().toLocaleDateString());
    yPosition += 2;

    // Assets
    addHeading('ASSETS BREAKDOWN', 12);
    addRow('Gold (24, 22, 18 Carat + Other)', this.formatCurrency(this.goldSectionTotal));
    addRow('Precious Stones', this.formatCurrency(this.getNumber(this.preciousStones)));
    addRow('Silver', this.formatCurrency(this.silverEstimated));
    addRow('Cash (Hand + Bank Accounts)', this.formatCurrency(this.cashSectionTotal));
    addRow('Investments', this.formatCurrency(this.investmentsSectionTotal));
    addRow('Landed Property', this.formatCurrency(this.getNumber(this.landedProperty)));
    addRow('Business Stock', this.formatCurrency(this.businessTotalStockValue));
    addRow('Partnership', this.formatCurrency(this.partnershipNetWorth));
    addRow('Agricultural Produce', this.formatCurrency(this.getNumber(this.agriculturalProduce)));
    addRow('Livestock', this.formatCurrency(this.getNumber(this.livestockValue)));
    yPosition += 2;

    // Liabilities
    addHeading('LIABILITIES', 12);
    addRow('Friends/Relatives', this.formatCurrency(this.getNumber(this.generalLiabilitiesFriends)));
    addRow('Banks/Institutions', this.formatCurrency(this.getNumber(this.generalLiabilitiesBanks)));
    addRow('Tax', this.formatCurrency(this.getNumber(this.generalLiabilitiesTax)));
    addRow('Other Liabilities', this.formatCurrency(this.getNumber(this.otherLiabilities)));
    yPosition += 2;

    // Summary
    addHeading('ZAKAT CALCULATION SUMMARY', 12);
    pdf.setFontSize(11);
    pdf.setTextColor(29, 78, 216);
    pdf.text('Total Assets', 10, yPosition);
    pdf.text(this.formatCurrency(this.result.totalAssets), 160, yPosition, { align: 'right' });
    yPosition += 6;
    
    pdf.text('Total Liabilities', 10, yPosition);
    pdf.text(this.formatCurrency(this.totalGeneralLiabilities), 160, yPosition, { align: 'right' });
    yPosition += 6;
    
    pdf.setTextColor(185, 28, 28);
    pdf.setFontSize(12);
    pdf.text('Net Assets', 10, yPosition);
    pdf.text(this.formatCurrency(this.result.netAssets), 160, yPosition, { align: 'right' });
    yPosition += 8;

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    addRow('Nisab', this.formatCurrency(this.getNumber(this.nisab)));
    addRow('Zakat Rate (%)', this.zakatRate.toString());
    addRow('Eligible for Zakat', this.result.isEligible ? 'Yes' : 'No');
    yPosition += 2;

    pdf.setFontSize(12);
    pdf.setTextColor(185, 28, 28);
    pdf.text('ZAKAT DUE', 10, yPosition);
    pdf.text(this.formatCurrency(this.result.zakatDue), 160, yPosition, { align: 'right' });
    
    if (!this.result.isEligible && this.result.shortfall > 0) {
      yPosition += 8;
      pdf.setTextColor(59, 130, 246);
      pdf.setFontSize(10);
      pdf.text('Shortfall to Nisab', 10, yPosition);
      pdf.text(this.formatCurrency(this.result.shortfall), 160, yPosition, { align: 'right' });
    }

    pdf.save(`Zakat_Report_${new Date().getTime()}.pdf`);
  }
}
