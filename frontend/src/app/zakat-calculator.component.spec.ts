import { ZakatCalculatorComponent } from './zakat-calculator.component';

declare function describe(name: string, spec: () => void): void;
declare function it(name: string, spec: () => void): void;
declare function expect(actual: unknown): {
  toBeTruthy(): void;
  toBeCloseTo(expected: number, precision?: number): void;
};

describe('ZakatCalculatorComponent Autofill', () => {
  function fillAllTabsWith100(component: ZakatCalculatorComponent): void {
    component.gold24Weight = 100;
    component.gold24PricePerGram = 100;
    component.gold22Weight = 100;
    component.gold22PricePerGram = 100;
    component.gold18Weight = 100;
    component.gold18PricePerGram = 100;
    component.otherGold = 100;

    component.preciousStones = 100;

    component.silverWeight = 100;
    component.silverPricePerGram = 100;

    component.cashInHand = 100;
    component.cashInSavings = 100;
    component.cashInCurrent = 100;
    component.cashInFixedDeposits = 100;

    component.loansReceivable = 100;
    component.govtBonds = 100;
    component.providentFund = 100;
    component.insurancePremiums = 100;
    component.sharesAndDividends = 100;
    component.securityDeposits = 100;
    component.privateInvestments = 100;
    component.otherWealth = 100;

    component.landedProperty = 100;

    component.businessSaleableStock = 100;
    component.businessDamagedStock = 100;
    component.businessReceivables = 100;
    component.businessPayables = 100;
    component.businessBadDebts = 100;

    component.partnershipCapital = 100;
    component.partnershipLoansAdvanced = 100;
    component.partnershipWithdrawals = 100;
    component.partnershipProfitShare = 100;

    component.agriculturalProduce = 100;
    component.agriculturalArtificialIrrigationProduce = 100;
    component.agriculturalMixedIrrigationProduce = 100;

    component.livestockValue = 100;

    component.generalLiabilitiesFriends = 100;
    component.generalLiabilitiesBanks = 100;
    component.generalLiabilitiesTax = 100;

    component.nisab = 100;
    component.zakatRate = 2.5;
  }

  it('should auto-fill 100 on every tab and produce total zakath payable due 1061.75', () => {
    const component = new ZakatCalculatorComponent();

    fillAllTabsWith100(component);
    component.calculateZakat();

    expect(component.result).toBeTruthy();
    expect(component.result?.zakatDue).toBeCloseTo(1061.75, 2);
  });
});
