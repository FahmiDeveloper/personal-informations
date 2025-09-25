export class Debt {

  key: string;
  date: string;
  time: string;
  debtor: string;
  creditor: string;
  financialDebt:string;
  note: string;
  placeId: number;
  restMoney: string;
  place: string;
  isRestMoney: boolean;
  numRefDebt: number;
  envelopeId: number;

  // used in debts module
  debtForPay: boolean;
  financialInDebtWithConvert:string;
  financialInDebtInModalWithConvert:string;
  toPayThisMonth: boolean;
  toPayNextMonth: boolean;
  notToPayForNow: boolean;
  firstPartComposedFinancialInDebt:string;
  secondPartComposedFinancialInDebt:string;
  financialInDebtWithConvertByCreditor:string;
  firstPartComposedFinancialInDebtByCreditor:string;
  secondPartComposedFinancialInDebtByCreditor:string;

  // used in debts module
  debtToGet: boolean;
  financialOutDebtWithConvert:string; 
  financialOutDebtInModalWithConvert:string;  
  toGetThisMonth: boolean;
  toGetNextMonth: boolean;
  notToGetForNow: boolean;
  firstPartComposedFinancialOutDebt:string;
  secondPartComposedFinancialOutDebt:string;
  financialOutDebtWithConvertByDebtor:string;
  firstPartComposedFinancialOutDebtByDebtor:string;
  secondPartComposedFinancialOutDebtByDebtor:string;

  // used to Pay statistics in home
  debtWithConvertToPayThisMonth:string;
  firstPartComposedDebtWithConvertToPayThisMonth:string;
  secondPartComposedDebtWithConvertToPayThisMonth:string;

  debtWithConvertToPayNextMonth:string;
  firstPartComposedDebtWithConvertToPayNextMonth:string;
  secondPartComposedDebtWithConvertToPayNextMonth:string;

  debtWithConvertNotToPayForNow:string;
  firstPartComposedDebtWithConvertNotToPayForNow:string;
  secondPartComposedDebtWithConvertNotToPayForNow:string;


  // used to get statistics in home
  debtWithConvertToGetThisMonth:string;
  firstPartComposedDebtWithConvertToGetThisMonth:string;
  secondPartComposedDebtWithConvertToGetThisMonth:string;

  debtWithConvertToGetNextMonth:string;
  firstPartComposedDebtWithConvertToGetNextMonth:string;
  secondPartComposedDebtWithConvertToGetNextMonth:string;

  debtWithConvertNotToGetForNow:string;
  firstPartComposedDebtWithConvertNotToGetForNow:string;
  secondPartComposedDebtWithConvertNotToGetForNow:string;


  constructor(){
    this.date = '';
    this.time = '';
    this.debtor = '';
    this.creditor = '';
    this.financialDebt = null;
    this.note = '';
    this.placeId = null;
    this.restMoney = '';
    this.place = '';
  }
  
}

export interface PlacesMoney {
  id: number,
  place: string
}

export interface StatusOutDebts {
  id: number,
  status: string
}

export interface StatusInDebts{
  id: number,
  status: string
}

export interface Unit {
  unitName: string
}

export interface EnvelopesList {
  id: number,
  envelopeFor: string
}