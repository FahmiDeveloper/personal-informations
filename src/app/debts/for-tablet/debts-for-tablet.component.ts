import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { DebtFormForTabletComponent } from './debt-form-for-tablet/debt-form-for-tablet.component';

import { AuthService } from '../../shared/services/auth.service';
import { DebtService } from '../../shared/services/debt.service';
import { UserService } from '../../shared/services/user.service';
import { UsersListService } from '../../shared/services/list-users.service';

import { Debt, EnvelopesList, PlacesMoney, StatusInDebts, StatusOutDebts } from '../../shared/models/debt.model';

@Component({
  selector: 'debts-for-tablet',
  templateUrl: './debts-for-tablet.component.html',
  styleUrls: ['./debts-for-tablet.scss']
})

export class DebtsForTabletComponent implements OnInit, OnDestroy {

  debtsList: Debt[] = [];
  debtsListCopie: Debt[] = [];
  filteredDebtsByPlaceAndDebtForPay: Debt[] = [];
  filteredDebtsByPlaceAndDebtToGet: Debt[] = [];

  p = 1;
  
  creditors: string[] = [];
  creditorName = '';
  debtors: string[] = [];
  debtorName = '';
  sortByDesc = true;
  isLoading: boolean;
  restInPocket = '';
  restInWallet = '';
  restInBox = '';
  restInPosteAccount = '';
  placeId: number;
  envelopeId: number;
  getInDebt = false;
  getOutDebt = false;
  statusOutDebtId: number;
  statusInDebtId: number;
  innerWidth: any;
  orientation = '';
  restInEnvTaxi = '';
  restInEnvInternet = '';
  restInEnvWaterElec = '';
  restInEnvBeinSports = '';
  restInEnvHomeLoc = '';
  restInEnvHomeSupp = '';
  
  //in debt attributes
  totalInDebts = '';
  defaultTotalInDebts: number;
  customTotalInDebts: number;
  totalInDebtsByCreditor: string;
  customTotalInDebtsByCreditor: number;
  defaultTotalInDebtsByCreditor: number;

   //out debt attributes
  totalOutDebts = '';
  defaultTotalOutDebts: number;
  customTotalOutDebts: number;
  totalOutDebtsByDebtor: string;
  defaultTotalOutDebtsByDebtor: number;
  customTotalOutDebtsByDebtor: number;

  modalRefLodaing: any;

  menuTopLeftPosition =  {x: '0', y: '0'} 

  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger: MatMenuTrigger; 

  subscriptionForGetAllDebts: Subscription;

  placesMoney: PlacesMoney[] = [
    {id: 1, place: 'Pocket'},
    {id: 2, place: 'Wallet'},
    {id: 3, place: 'Envelopes'}, 
    {id: 4, place: 'Box'},
    {id: 5, place: 'Debt'},
    {id: 6, place: 'Poste account'}
  ];

  envelopesList: EnvelopesList[] = [
    {id: 1, envelopeFor: 'Taxi'},
    {id: 2, envelopeFor: 'Internet'},
    {id: 3, envelopeFor: 'Water/Elec'}, 
    {id: 4, envelopeFor: 'Bein sports'},
    {id: 5, envelopeFor: 'Home Location'},
    {id: 6, envelopeFor: 'Home Supplies'}
  ];

  statusInDebts: StatusInDebts[] = [
    {id: 1, status: 'Pay this month'},
    {id: 2, status: 'Pay next month'},
    {id: 3, status: 'Pay will be delayed'}
  ];

  statusOutDebts: StatusOutDebts[] = [
    {id: 1, status: 'Get this month'},
    {id: 2, status: 'Get next month'},
    {id: 3, status: 'Get will be delayed'}
  ];

  constructor(
    private debtService: DebtService, 
    public userService: UserService,
    public usersListService: UsersListService,
    public authService: AuthService,
    public dialogService: MatDialog
  ) {}

  ngOnInit() {
    this.innerWidth = window.innerWidth;
    if(window.innerHeight > window.innerWidth){
      this.orientation = 'Portrait';    
    } else {
      this.orientation = 'Landscape';
    }

    window.matchMedia("(orientation: portrait)").addEventListener("change", e => {
      const portrait = e.matches;
  
      if (portrait) {
        this.orientation = 'Portrait';
      } else {
        this.orientation = 'Landscape';
      }
    });
    this.getAllDebts();
  }

  getAllDebts() {
    this.subscriptionForGetAllDebts = this.debtService
    .getAll()
    .subscribe(debts => {
      this.debtsListCopie = debts.sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      if (this.placeId) {
        if (this.placeId == 3) {
          if (this.envelopeId) {
            this.debtsList = debts.filter(debt => debt.placeId == 3 && debt.envelopeId == this.envelopeId).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
            this.getRestMoneyForeachEnvelope();
          }
          else {
            this.debtsList = debts.filter(debt => debt.placeId == 3).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
          }
        } else if (this.placeId == 5) {
          this.debtsList = debts.filter(debt => debt.placeId == 5).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
          if (this.getInDebt == true) this.showInDebt();
          if (this.getOutDebt == true) this.showOutDebt();
        } else {
          this.debtsList = debts.filter(debt => debt.placeId == this.placeId).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
        }
        this.getRestMoneyForeachPlace();
      } else this.debtsList = debts.sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      this.getPlaceDebt();
    });
  }

  OnPageChange(){
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  showInDebt() {
    if (this.getInDebt == true) {
      this.getOutDebt = false;
      this.statusOutDebtId = null;
      this.creditors = [];
      this.debtorName = '';
      this.getTotalIntDebts();

      this.debtsList = this.debtsListCopie
      .filter(debt => (debt.placeId == this.placeId) && (debt.debtForPay == true))
      .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);

      this.filteredDebtsByPlaceAndDebtForPay = this.debtsListCopie
      .filter(debt => (debt.placeId == this.placeId) && (debt.debtForPay == true))
      .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);

      if (this.statusInDebtId) this.getTotalInDebtsByStatus();
      if (this.creditorName) this.getTotalInDebtsByCreditor();
      this.filteredDebtsByPlaceAndDebtForPay.forEach(element => {
        if (!this.creditors.includes(element.creditor)) {
          this.creditors.push(element.creditor);
        }
      })
    }
  }

  showOutDebt() {
    if (this.getOutDebt == true) {
      this.getInDebt = false;
      this.statusInDebtId = null;
      this.debtors = [];
      this.creditorName = '';
      this.getTotalOutDebts();

      this.debtsList = this.debtsListCopie
      .filter(debt => (debt.placeId == this.placeId) && (debt.debtToGet == true))
      .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);

      this.filteredDebtsByPlaceAndDebtToGet = this.debtsListCopie
      .filter(debt => (debt.placeId == this.placeId) && (debt.debtToGet == true))
      .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);

      if (this.statusOutDebtId) this.getTotalOutDebtsByStatus();
      if (this.debtorName) this.getTotalOutDebtsByDebtor();
      this.filteredDebtsByPlaceAndDebtToGet.forEach(element => {
        if (!this.debtors.includes(element.debtor)) {
          this.debtors.push(element.debtor);
        }
      })
    }
  }

  getRestMoneyForeachPlace() {
    let debtForRestInPocket = this.debtsListCopie.filter(debt => debt.placeId == 1).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInWallet = this.debtsListCopie.filter(debt => debt.placeId == 2).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInBox = this.debtsListCopie.filter(debt => debt.placeId == 4).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInPosteAccount = this.debtsListCopie.filter(debt => debt.placeId == 6).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];

    this.restInPocket = debtForRestInPocket ? debtForRestInPocket.restMoney : '0DT';
    this.restInWallet = debtForRestInWallet ? debtForRestInWallet.restMoney : '0DT';
    this.restInBox = debtForRestInBox ? debtForRestInBox.restMoney : '0DT';
    this.restInPosteAccount = debtForRestInPosteAccount ? debtForRestInPosteAccount.restMoney : '0DT';
  }

  getRestMoneyForeachEnvelope() {
    let debtForRestInEnvTaxi = this.debtsListCopie.filter(debt => debt.placeId == 3 && debt.envelopeId == 1).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInEnvInternet = this.debtsListCopie.filter(debt => debt.placeId == 3 && debt.envelopeId == 2).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInEnvWaterElec = this.debtsListCopie.filter(debt => debt.placeId == 3 && debt.envelopeId == 3).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInEnvBeinSports = this.debtsListCopie.filter(debt => debt.placeId == 3 && debt.envelopeId == 4).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInEnvHomeLoc = this.debtsListCopie.filter(debt => debt.placeId == 3 && debt.envelopeId == 5).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInEnvHomeSupp = this.debtsListCopie.filter(debt => debt.placeId == 3 && debt.envelopeId == 6).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];

    this.restInEnvTaxi = debtForRestInEnvTaxi ? debtForRestInEnvTaxi.restMoney : '0DT';
    this.restInEnvInternet = debtForRestInEnvInternet ? debtForRestInEnvInternet.restMoney : '0DT';
    this.restInEnvWaterElec = debtForRestInEnvWaterElec ? debtForRestInEnvWaterElec.restMoney : '0DT';
    this.restInEnvBeinSports = debtForRestInEnvBeinSports ? debtForRestInEnvBeinSports.restMoney : '0DT';
    this.restInEnvHomeLoc = debtForRestInEnvHomeLoc ? debtForRestInEnvHomeLoc.restMoney : '0DT';
    this.restInEnvHomeSupp = debtForRestInEnvHomeSupp ? debtForRestInEnvHomeSupp.restMoney : '0DT';
  }

  getPlaceDebt() {
    this.debtsList.forEach(element=>{
      this.placesMoney.forEach(placeMoney => {
        if (placeMoney.id == element.placeId) {
          element.place = placeMoney.place;
        }
      })
    })
  }

  newDebt() {
    const dialogRef = this.dialogService.open(DebtFormForTabletComponent, {width: '800px', data: {movie: {}}});
    dialogRef.componentInstance.defaultDebts = this.debtsListCopie; 
  }

  editDebt(debt?: Debt) {
    const dialogRef = this.dialogService.open(DebtFormForTabletComponent, {width: '800px'});
    dialogRef.componentInstance.debt = debt;
    dialogRef.componentInstance.dataSource = this.debtsList;
  }

  showRest(contentRestMoneyForeachPlace) {
    this.dialogService.open(contentRestMoneyForeachPlace, {width: '400px'});
    this.getRestMoneyForeachPlace();
  }

  showRestEnvelope(contentRestMoneyForeachEnve) {
    this.dialogService.open(contentRestMoneyForeachEnve, {width: '400px'});
    this.getRestMoneyForeachEnvelope();
  }

  getTotalIntDebts() { 
    this.defaultTotalInDebts = 0;
    this.customTotalInDebts = 0;
    this.totalInDebts = "";
    this.creditors = [];

    this.debtsListCopie.filter(debt => debt.debtForPay == true).forEach(element => {
      if (element.financialDebt.indexOf("DT") !== -1) {
        element.financialInDebtWithConvert = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("DT"));
        element.financialInDebtWithConvert = element.financialInDebtWithConvert + '000';
      }
      if (element.financialDebt.indexOf("Mill") !== -1) {
        element.financialInDebtWithConvert = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("Mill"));
      }
      if (element.financialDebt.includes(".")){
        const composedFinancialDebt = element.financialDebt.split('.');
        if (composedFinancialDebt[0].indexOf("DT") !== -1) {
          element.firstPartComposedFinancialInDebt = composedFinancialDebt[0].substring(0, composedFinancialDebt[0].lastIndexOf("DT"));
          element.firstPartComposedFinancialInDebt = element.firstPartComposedFinancialInDebt + '000';
        }
        if (composedFinancialDebt[1].indexOf("Mill") !== -1) {
          element.secondPartComposedFinancialInDebt = composedFinancialDebt[1].substring(0, composedFinancialDebt[1].lastIndexOf("Mill"));
        }
        element.financialInDebtWithConvert = String(Number(element.firstPartComposedFinancialInDebt)+Number(element.secondPartComposedFinancialInDebt));
      }

      this.defaultTotalInDebts += Number(element.financialInDebtWithConvert);
      if (this.defaultTotalInDebts.toString().length > 4) {

        this.customTotalInDebts = this.defaultTotalInDebts / 1000;

        if (String(this.customTotalInDebts).includes(".")){
          const customTotalInDebts = String(this.customTotalInDebts).split('.');
          if (customTotalInDebts[1].length == 1) this.totalInDebts = customTotalInDebts[0] + "DT." + customTotalInDebts[1] + "00Mill";
          else if (customTotalInDebts[1].length == 2) this.totalInDebts = customTotalInDebts[0] + "DT." + customTotalInDebts[1] + "0Mill";
          else this.totalInDebts = customTotalInDebts[0] + "DT." + customTotalInDebts[1] + "Mill";
        } else {
          this.totalInDebts = String(this.customTotalInDebts) + "DT";
        }
      } else {
        this.totalInDebts = this.defaultTotalInDebts + "Mill";
      }

      if (!this.creditors.includes(element.creditor)) {
        this.creditors.push(element.creditor);
      }
    });
  }

  getTotalInDebtsByStatus() {
    this.defaultTotalInDebtsByCreditor = 0;
    this.customTotalInDebtsByCreditor = 0;
    this.totalInDebtsByCreditor = "";

    if (this.creditorName) {
      if (this.statusInDebtId == 1) {
        this.debtsList = this.filteredDebtsByPlaceAndDebtForPay
        .filter(debt => (debt.toPayThisMonth == true) && (debt.creditor == this.creditorName))
        .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      } 
      else if (this.statusInDebtId == 2) {
        this.debtsList = this.filteredDebtsByPlaceAndDebtForPay
        .filter(debt => (debt.toPayNextMonth == true) && (debt.creditor == this.creditorName))
        .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      } 
      else {
        this.debtsList = this.filteredDebtsByPlaceAndDebtForPay
        .filter(debt => (debt.notToPayForNow == true) && (debt.creditor == this.creditorName))
        .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      }
    } else {
      if (this.statusInDebtId == 1) {
        this.debtsList = this.filteredDebtsByPlaceAndDebtForPay
        .filter(debt => (debt.toPayThisMonth == true))
        .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      } 
      else if (this.statusInDebtId == 2) {
        this.debtsList = this.filteredDebtsByPlaceAndDebtForPay
        .filter(debt => (debt.toPayNextMonth == true))
        .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      }
        else {
        this.debtsList = this.filteredDebtsByPlaceAndDebtForPay
        .filter(debt => (debt.notToPayForNow == true))
        .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      }   
    }

    this.debtsList.forEach(element => {

      if (element.financialDebt.indexOf("DT") !== -1) {
        element.financialInDebtWithConvertByCreditor = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("DT"));
        element.financialInDebtWithConvertByCreditor = element.financialInDebtWithConvertByCreditor + '000';
      }
      if (element.financialDebt.indexOf("Mill") !== -1) {
        element.financialInDebtWithConvertByCreditor = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("Mill"));
      }
      if (element.financialDebt.includes(".")){
        const composedFinancialDebtByCreditor = element.financialDebt.split('.');
        if (composedFinancialDebtByCreditor[0].indexOf("DT") !== -1) {
          element.firstPartComposedFinancialInDebtByCreditor = composedFinancialDebtByCreditor[0].substring(0, composedFinancialDebtByCreditor[0].lastIndexOf("DT"));
          element.firstPartComposedFinancialInDebtByCreditor = element.firstPartComposedFinancialInDebtByCreditor + '000';
        }
        if (composedFinancialDebtByCreditor[1].indexOf("Mill") !== -1) {
          element.secondPartComposedFinancialInDebtByCreditor = composedFinancialDebtByCreditor[1].substring(0, composedFinancialDebtByCreditor[1].lastIndexOf("Mill"));
        }
        element.financialInDebtWithConvertByCreditor = String(Number(element.firstPartComposedFinancialInDebtByCreditor)+Number(element.secondPartComposedFinancialInDebtByCreditor));
      }

      this.defaultTotalInDebtsByCreditor += Number(element.financialInDebtWithConvertByCreditor);
      if (this.defaultTotalInDebtsByCreditor.toString().length > 4) {

        this.customTotalInDebtsByCreditor = this.defaultTotalInDebtsByCreditor / 1000;

        if (String(this.customTotalInDebtsByCreditor).includes(".")){
          const customTotalInDebtsByCreditor = String(this.customTotalInDebtsByCreditor).split('.');
          if (customTotalInDebtsByCreditor[1].length == 1) this.totalInDebtsByCreditor = customTotalInDebtsByCreditor[0] + "DT." + customTotalInDebtsByCreditor[1] + "00Mill";
          else if (customTotalInDebtsByCreditor[1].length == 2) this.totalInDebtsByCreditor = customTotalInDebtsByCreditor[0] + "DT." + customTotalInDebtsByCreditor[1] + "0Mill";
          else this.totalInDebtsByCreditor = customTotalInDebtsByCreditor[0] + "DT." + customTotalInDebtsByCreditor[1] + "Mill";
        } else {
          this.totalInDebtsByCreditor = String(this.customTotalInDebtsByCreditor) + "DT";
        }
      } else {
        this.totalInDebtsByCreditor = this.defaultTotalInDebtsByCreditor + "Mill";
      }
    });
  }

  getTotalInDebtsByCreditor() {
    this.defaultTotalInDebtsByCreditor = 0;
    this.customTotalInDebtsByCreditor = 0;
    this.totalInDebtsByCreditor = "";

    if (this.statusInDebtId) {
      if (this.statusInDebtId == 1) {
        this.debtsList = this.filteredDebtsByPlaceAndDebtForPay
        .filter(debt => (debt.creditor == this.creditorName) && (debt.toPayThisMonth == true))
        .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      } 
      else if (this.statusInDebtId == 2) {
        this.debtsList = this.filteredDebtsByPlaceAndDebtForPay
        .filter(debt => (debt.creditor == this.creditorName) && (debt.toPayNextMonth == true))
        .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      } 
      else {
        this.debtsList = this.filteredDebtsByPlaceAndDebtForPay
        .filter(debt => (debt.creditor == this.creditorName) && (debt.notToPayForNow == true))
        .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      }   
    } else this.debtsList = this.filteredDebtsByPlaceAndDebtForPay
    .filter(debt => (debt.creditor == this.creditorName))
    .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);

    this.debtsList.forEach(element => {

      if (element.financialDebt.indexOf("DT") !== -1) {
        element.financialInDebtWithConvertByCreditor = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("DT"));
        element.financialInDebtWithConvertByCreditor = element.financialInDebtWithConvertByCreditor + '000';
      }
      if (element.financialDebt.indexOf("Mill") !== -1) {
        element.financialInDebtWithConvertByCreditor = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("Mill"));
      }
      if (element.financialDebt.includes(".")){
        const composedFinancialDebtByCreditor = element.financialDebt.split('.');
        if (composedFinancialDebtByCreditor[0].indexOf("DT") !== -1) {
          element.firstPartComposedFinancialInDebtByCreditor = composedFinancialDebtByCreditor[0].substring(0, composedFinancialDebtByCreditor[0].lastIndexOf("DT"));
          element.firstPartComposedFinancialInDebtByCreditor = element.firstPartComposedFinancialInDebtByCreditor + '000';
        }
        if (composedFinancialDebtByCreditor[1].indexOf("Mill") !== -1) {
          element.secondPartComposedFinancialInDebtByCreditor = composedFinancialDebtByCreditor[1].substring(0, composedFinancialDebtByCreditor[1].lastIndexOf("Mill"));
        }
        element.financialInDebtWithConvertByCreditor = String(Number(element.firstPartComposedFinancialInDebtByCreditor)+Number(element.secondPartComposedFinancialInDebtByCreditor));
      }

      this.defaultTotalInDebtsByCreditor += Number(element.financialInDebtWithConvertByCreditor);
      if (this.defaultTotalInDebtsByCreditor.toString().length > 4) {

        this.customTotalInDebtsByCreditor = this.defaultTotalInDebtsByCreditor / 1000;

        if (String(this.customTotalInDebtsByCreditor).includes(".")){
          const customTotalInDebtsByCreditor = String(this.customTotalInDebtsByCreditor).split('.');
          if (customTotalInDebtsByCreditor[1].length == 1) this.totalInDebtsByCreditor = customTotalInDebtsByCreditor[0] + "DT." + customTotalInDebtsByCreditor[1] + "00Mill";
          else if (customTotalInDebtsByCreditor[1].length == 2) this.totalInDebtsByCreditor = customTotalInDebtsByCreditor[0] + "DT." + customTotalInDebtsByCreditor[1] + "0Mill";
          else this.totalInDebtsByCreditor = customTotalInDebtsByCreditor[0] + "DT." + customTotalInDebtsByCreditor[1] + "Mill";
        } else {
          this.totalInDebtsByCreditor = String(this.customTotalInDebtsByCreditor) + "DT";
        }
      } else {
        this.totalInDebtsByCreditor = this.defaultTotalInDebtsByCreditor + "Mill";
      }
    });
  }

  getTotalOutDebts() {
    this.defaultTotalOutDebts = 0;
    this.customTotalOutDebts = 0;
    this.totalOutDebts = "";
    this.debtors = [];

    this.debtsListCopie.filter(debt => debt.debtToGet == true).forEach(element => {
      if (element.financialDebt.indexOf("DT") !== -1) {
        element.financialOutDebtWithConvert = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("DT"));
        element.financialOutDebtWithConvert = element.financialOutDebtWithConvert + '000';
      }
      if (element.financialDebt.indexOf("Mill") !== -1) {
        element.financialOutDebtWithConvert = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("Mill"));
      }

      if (element.financialDebt.includes(".")){
        const composedFinancialDebt = element.financialDebt.split('.');
        if (composedFinancialDebt[0].indexOf("DT") !== -1) {
          element.firstPartComposedFinancialOutDebt = composedFinancialDebt[0].substring(0, composedFinancialDebt[0].lastIndexOf("DT"));
          element.firstPartComposedFinancialOutDebt = element.firstPartComposedFinancialOutDebt + '000';
        }
        if (composedFinancialDebt[1].indexOf("Mill") !== -1) {
          element.secondPartComposedFinancialOutDebt = composedFinancialDebt[1].substring(0, composedFinancialDebt[1].lastIndexOf("Mill"));
        }
        element.financialOutDebtWithConvert = String(Number(element.firstPartComposedFinancialOutDebt)+Number(element.secondPartComposedFinancialOutDebt));
      }

      this.defaultTotalOutDebts += Number(element.financialOutDebtWithConvert);

      if (this.defaultTotalOutDebts.toString().length > 4) {

        this.customTotalOutDebts = this.defaultTotalOutDebts / 1000;
        if (String(this.customTotalOutDebts).includes(".")){
          const customTotalOutDebts = String(this.customTotalOutDebts).split('.');
          if (customTotalOutDebts[1].length == 1) this.totalOutDebts = customTotalOutDebts[0] + "DT." + customTotalOutDebts[1] + "00Mill";
          else if (customTotalOutDebts[1].length == 2) this.totalOutDebts = customTotalOutDebts[0] + "DT." + customTotalOutDebts[1] + "0Mill";
          else this.totalOutDebts = customTotalOutDebts[0] + "DT." + customTotalOutDebts[1] + "Mill";
        } else {
          this.totalOutDebts = String(this.customTotalOutDebts) + "DT";
        }
      } else {
        this.totalOutDebts = this.defaultTotalOutDebts + "Mill";
      }

      if (!this.debtors.includes(element.debtor)) {
        this.debtors.push(element.debtor);
      }
    });   
  }

  getTotalOutDebtsByStatus() {
    this.defaultTotalOutDebtsByDebtor = 0;
    this.customTotalOutDebtsByDebtor = 0;
    this.totalOutDebtsByDebtor = "";

    if (this.debtorName) {
      if (this.statusOutDebtId == 1) {
        this.debtsList = this.filteredDebtsByPlaceAndDebtToGet
        .filter(debt => (debt.toGetThisMonth == true) && (debt.debtor == this.debtorName))
        .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      } 
      else if (this.statusOutDebtId == 2) {
        this.debtsList = this.filteredDebtsByPlaceAndDebtToGet
        .filter(debt => (debt.toGetNextMonth == true) && (debt.debtor == this.debtorName))
        .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      } 
      else {
        this.debtsList = this.filteredDebtsByPlaceAndDebtToGet
        .filter(debt => (debt.notToGetForNow == true) && (debt.debtor == this.debtorName))
        .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      }
    } else {
      if (this.statusOutDebtId == 1) {
        this.debtsList = this.filteredDebtsByPlaceAndDebtToGet
        .filter(debt => (debt.toGetThisMonth == true))
        .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      } 
      else if (this.statusOutDebtId == 2) {
        this.debtsList = this.filteredDebtsByPlaceAndDebtToGet
        .filter(debt => (debt.toGetNextMonth == true))
        .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      } else {
        this.debtsList = this.filteredDebtsByPlaceAndDebtToGet
        .filter(debt => (debt.notToGetForNow == true))
        .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      }
      this.debtsList.forEach(res => {
        if (!this.debtors.includes(res.debtor)) {
          this.debtors.push(res.debtor);
        }
      })
    }

    this.debtsList.forEach(element => {
      if (element.financialDebt.indexOf("DT") !== -1) {
        element.financialOutDebtWithConvertByDebtor = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("DT"));
        element.financialOutDebtWithConvertByDebtor = element.financialOutDebtWithConvertByDebtor + '000';
      }
      if (element.financialDebt.indexOf("Mill") !== -1) {
        element.financialOutDebtWithConvertByDebtor = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("Mill"));
      }

      if (element.financialDebt.includes(".")){
        const composedFinancialDebtByDebtor = element.financialDebt.split('.');
        if (composedFinancialDebtByDebtor[0].indexOf("DT") !== -1) {
          element.firstPartComposedFinancialOutDebtByDebtor = composedFinancialDebtByDebtor[0].substring(0, composedFinancialDebtByDebtor[0].lastIndexOf("DT"));
          element.firstPartComposedFinancialOutDebtByDebtor = element.firstPartComposedFinancialOutDebtByDebtor + '000';
        }
        if (composedFinancialDebtByDebtor[1].indexOf("Mill") !== -1) {
          element.secondPartComposedFinancialOutDebtByDebtor = composedFinancialDebtByDebtor[1].substring(0, composedFinancialDebtByDebtor[1].lastIndexOf("Mill"));
        }
        element.financialOutDebtWithConvertByDebtor = String(Number(element.firstPartComposedFinancialOutDebtByDebtor)+Number(element.secondPartComposedFinancialOutDebtByDebtor));
      }

      this.defaultTotalOutDebtsByDebtor += Number(element.financialOutDebtWithConvertByDebtor);

      if (this.defaultTotalOutDebtsByDebtor.toString().length > 4) {

        this.customTotalOutDebtsByDebtor = this.defaultTotalOutDebtsByDebtor / 1000;
        if (String(this.customTotalOutDebtsByDebtor).includes(".")){
          const customTotalOutDebtsByDebtor = String(this.customTotalOutDebtsByDebtor).split('.');
          if (customTotalOutDebtsByDebtor[1].length == 1) this.totalOutDebtsByDebtor = customTotalOutDebtsByDebtor[0] + "DT." + customTotalOutDebtsByDebtor[1] + "00Mill";
          else if (customTotalOutDebtsByDebtor[1].length == 2) this.totalOutDebtsByDebtor = customTotalOutDebtsByDebtor[0] + "DT." + customTotalOutDebtsByDebtor[1] + "0Mill";
          else this.totalOutDebtsByDebtor = customTotalOutDebtsByDebtor[0] + "DT." + customTotalOutDebtsByDebtor[1] + "Mill";
        } else {
          this.totalOutDebtsByDebtor = String(this.customTotalOutDebtsByDebtor) + "DT";
        }
      } else {
        this.totalOutDebtsByDebtor = this.defaultTotalOutDebtsByDebtor + "Mill";
      }
    });
  }

  getTotalOutDebtsByDebtor() {
    this.defaultTotalOutDebtsByDebtor = 0;
    this.customTotalOutDebtsByDebtor = 0;
    this.totalOutDebtsByDebtor = "";

    if (this.statusOutDebtId) {
      if (this.statusOutDebtId == 1) {
        this.debtsList = this.filteredDebtsByPlaceAndDebtToGet
        .filter(debt => (debt.debtor == this.debtorName) && (debt.toGetThisMonth == true))
        .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      } 
      else if (this.statusOutDebtId == 2) {
        this.debtsList = this.filteredDebtsByPlaceAndDebtToGet
        .filter(debt => (debt.debtor == this.debtorName) && (debt.toGetNextMonth == true))
        .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      } 
      else {
        this.debtsList = this.filteredDebtsByPlaceAndDebtToGet
        .filter(debt => (debt.debtor == this.debtorName) && (debt.notToGetForNow == true))
        .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
      }
    } else this.debtsList = this.filteredDebtsByPlaceAndDebtToGet
    .filter(debt => (debt.debtor == this.debtorName))
    .sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);

    this.debtsList.forEach(element => {
      if (element.financialDebt.indexOf("DT") !== -1) {
        element.financialOutDebtWithConvertByDebtor = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("DT"));
        element.financialOutDebtWithConvertByDebtor = element.financialOutDebtWithConvertByDebtor + '000';
      }
      if (element.financialDebt.indexOf("Mill") !== -1) {
        element.financialOutDebtWithConvertByDebtor = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("Mill"));
      }

      if (element.financialDebt.includes(".")){
        const composedFinancialDebtByDebtor = element.financialDebt.split('.');
        if (composedFinancialDebtByDebtor[0].indexOf("DT") !== -1) {
          element.firstPartComposedFinancialOutDebtByDebtor = composedFinancialDebtByDebtor[0].substring(0, composedFinancialDebtByDebtor[0].lastIndexOf("DT"));
          element.firstPartComposedFinancialOutDebtByDebtor = element.firstPartComposedFinancialOutDebtByDebtor + '000';
        }
        if (composedFinancialDebtByDebtor[1].indexOf("Mill") !== -1) {
          element.secondPartComposedFinancialOutDebtByDebtor = composedFinancialDebtByDebtor[1].substring(0, composedFinancialDebtByDebtor[1].lastIndexOf("Mill"));
        }
        element.financialOutDebtWithConvertByDebtor = String(Number(element.firstPartComposedFinancialOutDebtByDebtor)+Number(element.secondPartComposedFinancialOutDebtByDebtor));
      }

      this.defaultTotalOutDebtsByDebtor += Number(element.financialOutDebtWithConvertByDebtor);

      if (this.defaultTotalOutDebtsByDebtor.toString().length > 4) {

        this.customTotalOutDebtsByDebtor = this.defaultTotalOutDebtsByDebtor / 1000;
        if (String(this.customTotalOutDebtsByDebtor).includes(".")){
          const customTotalOutDebtsByDebtor = String(this.customTotalOutDebtsByDebtor).split('.');
          if (customTotalOutDebtsByDebtor[1].length == 1) this.totalOutDebtsByDebtor = customTotalOutDebtsByDebtor[0] + "DT." + customTotalOutDebtsByDebtor[1] + "00Mill";
          else if (customTotalOutDebtsByDebtor[1].length == 2) this.totalOutDebtsByDebtor = customTotalOutDebtsByDebtor[0] + "DT." + customTotalOutDebtsByDebtor[1] + "0Mill";
          else this.totalOutDebtsByDebtor = customTotalOutDebtsByDebtor[0] + "DT." + customTotalOutDebtsByDebtor[1] + "Mill";
        } else {
          this.totalOutDebtsByDebtor = String(this.customTotalOutDebtsByDebtor) + "DT";
        }
      } else {
        this.totalOutDebtsByDebtor = this.defaultTotalOutDebtsByDebtor + "Mill";
      }
    });
  }

  deleteAllByPlace(contentLoading) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete all this debts!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.modalRefLodaing = this.dialogService.open(contentLoading, {
          width: '20vw',
          height:'20vw',
          maxWidth: '100vw'
        });
        this.isLoading = true;

        this.debtsListCopie.filter(debt => debt.placeId == this.placeId).forEach(element => {
          this.debtService.delete(element.key);
        });
        setTimeout(() => {
          this.isLoading = false;
          this.modalRefLodaing.close();

          Swal.fire(
            'Debts has been deleted successfully',
            '',
            'success'
          ).then((res) => {
            if (res.value) {
              this.getAllDebts();
            }
          })
        }, 5000);
      }
    })
  }

  sortByRefDebtDesc() { 
    this.debtsList = this.debtsList.sort((n1, n2) => n2.numRefDebt - n1.numRefDebt);
    this.sortByDesc = true;
  }

  sortByRefDebtAsc() {
    this.debtsList = this.debtsList.sort((n1, n2) => n1.numRefDebt - n2.numRefDebt);
    this.sortByDesc = false;
  }

  deleteDebt(debtKey) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this debt!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.debtService.delete(debtKey);
        Swal.fire(
          'Debt has been deleted successfully',
          '',
          'success'
        )
      }
    })
  }

  viewNote(debtNote: string) {
    Swal.fire({
      text: debtNote,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Close'
    });
  }

  viewStatus(debt: Debt) {
    let debtStatus: string;
    if (debt.toPayThisMonth) {debtStatus = 'Pay this month';}
    else if (debt.toPayNextMonth) {debtStatus = 'Pay Next month';}
    else if (debt.notToPayForNow) {debtStatus = 'Pay will be delayed';}
    else if (debt.toGetThisMonth) {debtStatus = 'Get this month';}
    else if (debt.toGetNextMonth) {debtStatus = 'Get Next month';}
    else {debtStatus = 'Get will be delayed';}

    Swal.fire({
      text: debtStatus,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Close'
    });
  }

  ngOnDestroy() {
    this.subscriptionForGetAllDebts.unsubscribe();
  }  
}
