export const ZAKAT_POPUP_CONTENT = {
  summary: {
    title: 'Summary',
    body: [
      'This worksheet is designed to calculate Zakat on wealth as of the valuation date.',
      'Enter values for gold, silver, cash, investments, property, and liabilities in the calculator form.',
      'The sheet then computes total assets, net assets, and Zakat payable at the selected rate once the nisab threshold is met.'
    ]
  },
  instructions: {
    title: 'Instructions',
    body: [
      'Dear Brothers & Sisters,',
      'Alhamdulillah, the month of Ramadhan has been bestowed upon us by Allah.  ZAKAT is one of the five fundamental pillars of Islam, mandatory on all muslims who are of eligible wealth.  Zakat is due from and payable by a person on his wealth (and not his income), which has remained with him/her for one Islamic year.',
      'It is difficult to calculate the completion of one year on each item of wealth, because purchase dates may vary.  To overcome this difficulty, a practical method is to fix a date (e.g. 1st of Ramadhan), compute your total wealth on that date and calculate Zakat, thereon.',
      'The attached spreadsheet is a humble attempt at making the calculation process simple and consolidated, for all brothers and sisters who are fortunate to be worthy of paying Zakat.  If there are any errors, its purely due to my incomprehension and may be brought to my notice immdtly by email at ajameel@yahoo.com.  Please remember me in your supplications and may Allah give us all the rewards of both worlds. Aameen.',
      'Yours Brother in Islam,  Arif Jameel.',
      'Details of Each Section to be used in conjunction with the Calculation Spreadsheet.',
      'Zakat on Pure Gold and Gold Jewellery: Zakat should be calculated at 2.5% of the market value as on the date of valuation (In our case we consider 1st of Ramadhan).  Most Ulema favour the Market Value prevailing as on the date of Calculation and not the purchase price.',
      'A Reduction of 2% from the weight of Jewellery can be allowed towards studded stones jewellery & 25% from the weight of KUNDAN Jewellery.'
    ]
  }
};

// Section-specific popups
export const ZAKAT_SECTION_POPUPS: { [key: string]: { title: string; body: string[] } } = {
  gold: {
    title: 'Zakat on Pure Gold and Gold Jewellery',
    body: [
      'Zakat should be calculated at 2.5% of the market value as on the date of valuation (In our case we consider 1st of Ramadhan).',
      'Most Ulema favour the Market Value prevailing as on the date of Calculation and not the purchase price.',
      'A Reduction of 2% from the weight of Jewellery can be allowed towards studded stones jewellery & 25% from the weight of KUNDAN Jewellery.'
    ]
  },
  precious: {
    title: 'Zakat on Precious and Semi-Precious Stones',
    body: [
      'There is some contention on whether these are to be considered for valuation. In my humble opinion if they have a value, then they calculate towards your wealth, and it is on the wealth that Zakat is mandatory.',
      'One may calculate the saleable value of items at hand on the date of Zakat calculation.'
    ]
  },
  silver: {
    title: 'Zakat on Silver.',
    body: [
      'Zakat is to be paid on silver in pure form or jewellery, utensils, decorative items and all household items including crockery, cutlery made of silver at 2.5% of the prevailing market rates.'
    ]
  },
  cash: {
    title: 'Zakat on Cash and Bank Balances',
    body: [
      'Zakat should be paid at 2.5% on all cash balance and bank balances in your savings, current or FD accounts. The amount technically should be in the bank for one year. Usually it happens that the balance keeps on changing as per personal requirements.',
      'You may make your best judgement and the best way is to pay on the remaining amount on the day of calculation.'
    ]
  },
  loans: {
    title: 'Zakat on Loans Given, Funds, etc',
    body: [
      'Zakat is payable by you on loans you have given to your friends and relatives. It should be treated as cash in hand. You may deduct loans payable by you to arrive at the nett present value of your wealth.',
      'Zakat is payable on all Govt Bonds, Public Sector Bond, paid-up Insurance premiums, your paid-up portion of Provident Funds, Govt Bills receivables, etc.'
    ]
  },
  landed: {
    title: 'Zakat on Landed Property',
    body: [
      'Zakat is not payable on personal residential house even if you have more than one and meant for residential purpose only. Also Zakat is not applicable on property given on rent irrespective of how many. However Zakat is payable on the rental income.',
      'However if your intention of holding properties is to sell at a future date for a profit or as an investment, then Zakat is payable on the Market Value. Also, if your intention of holding properties changes in the current year, i.e. from self use to business then you need to pay Zakat on that Property Value.'
    ]
  },
  business: {
    title: 'Zakat on Business',
    body: [
      'No matter what business you are into, you have got to pay Zakat on all stock-in-trade. The stock must be valued at its landed cost price.',
      'If you have any bills receivable then you need to add the same towards calculations. Deduct amounts due to your suppliers and loans on stock on the date of calculation.'
    ]
  },
  partnership: {
    title: 'Zakat on Partnership Firms',
    body: [
      'Zakat can be paid either by the firm or separately by the owners. If the firm is not paying, and the partner wants to calculate his share, he should take the amount standing to his capital and loan account as per the last balance sheet.',
      'Add his estimated share of profit till the date Zakat is calculated. This can only be estimated as it is difficult to calculate the exact profit or loss between an accounting year.'
    ]
  },
  agricultural: {
    title: 'Zakat on Agricultural Product',
    body: [
      'Zakat is payable on agricultural produce at the prescribed rate and should be calculated on the produce after harvest, taking into account the value and any relevant deductions as per your local fiqh guidance.'
    ]
  },
  livestock: {
    title: 'Zakat on Livestock',
    body: [
      'Zakat on livestock is based on the number and type of animals owned and should be calculated according to the relevant nisab thresholds and rates.'
    ]
  }
};
