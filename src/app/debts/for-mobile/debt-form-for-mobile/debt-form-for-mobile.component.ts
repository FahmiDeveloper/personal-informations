import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import * as moment from 'moment';
import Swal from 'sweetalert2';

import { DebtService } from 'src/app/shared/services/debt.service';

import { Debt, EnvelopesList, PlacesMoney, Unit } from 'src/app/shared/models/debt.model';

@Component({
  selector: 'debt-form-for-mobile',
  templateUrl: './debt-form-for-mobile.component.html',
  styleUrls: ['./debt-form-for-mobile.scss']
})

export class DebtFormForMobileComponent implements OnInit {

  debt: Debt = new Debt();
  defaultDebts: Debt[];
  dataSource: Debt[];

  selectedUnit: string;
  modalRef: any;

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

  units: Unit[] = [
    {unitName: ''},
    {unitName: 'DT'},
    {unitName: 'DT.'},
    {unitName: 'Mill'}
  ];

  formControl = new FormControl('', [Validators.required]);

  constructor(
    private debtService: DebtService,
    public dialogRef: MatDialogRef<DebtFormForMobileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Debt[]
  ) {}

  ngOnInit() {
    if (!this.debt.key) {
      this.debt.isRestMoney = true;
      this.debt.debtForPay = false;
      this.debt.debtToGet = false;
      this.debt.date = moment().format('YYYY-MM-DD');
    }
    if (this.debt.key) {
      this.data = this.dataSource;
    }
  }

  save() {
    if (this.debt.placeId == 5) {
      if (this.debt.toPayThisMonth == undefined) this.debt.toPayThisMonth = false;
      if (this.debt.toPayNextMonth == undefined) this.debt.toPayNextMonth = false;
      if (this.debt.notToPayForNow == undefined) this.debt.notToPayForNow = false;

      if (this.debt.toGetThisMonth == undefined) this.debt.toGetThisMonth = false;
      if (this.debt.toGetNextMonth == undefined) this.debt.toGetNextMonth = false;
      if (this.debt.notToGetForNow == undefined) this.debt.notToGetForNow = false;
    }

    if (this.debt.key) {
      this.debtService.update(this.debt.key, this.debt);
      Swal.fire(
        'Debt data has been updated successfully',
        '',
        'success'
      )
    } else {
      if (this.defaultDebts.sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0].numRefDebt) this.debt.numRefDebt = this.defaultDebts[0].numRefDebt + 1;
      this.debtService.create(this.debt);
      Swal.fire(
      'New Debt added successfully',
      '',
      'success'
      )
    }
    this.close();
  }

  checkAddRestMoney() {
    if (!this.debt.key && this.debt.isRestMoney == true) {
      this.debt.debtForPay = false;
      this.debt.debtToGet = false;
    }
    if (this.debt.placeId) {
      this.debt.placeId = null;
    }
  }

  checkDebtForPay() {
    if (!this.debt.key && this.debt.debtForPay == true) {
      this.debt.debtToGet = false;
      this.debt.isRestMoney = false;
      this.debt.debtor = "Fahmi";
      this.debt.placeId = 5;
    }
    if (this.debt.creditor) {
      this.debt.creditor = '';
    }
  }

  checkDebtToGet() {
    if (!this.debt.key && this.debt.debtToGet == true) {
      this.debt.debtForPay = false;
      this.debt.isRestMoney = false;
      this.debt.creditor = "Fahmi";
      this.debt.placeId = 5;
    }
    if (this.debt.debtor) {
      this.debt.debtor = '';
    }
  }

  checkToPayThisMonth() {
    if(this.debt.toPayThisMonth == true) {
      this.debt.toPayNextMonth = false;
      this.debt.notToPayForNow = false;
    }
  }

  checkToPayNextMonth() {
    if(this.debt.toPayNextMonth == true) {
      this.debt.toPayThisMonth = false;
      this.debt.notToPayForNow = false;
    }
  }

  checkNotToPayForNow() {
    if(this.debt.notToPayForNow == true) {
      this.debt.toPayThisMonth = false;
      this.debt.toPayNextMonth = false;
    }
  }

  checkToGetThisMonth() {
    if(this.debt.toGetThisMonth == true) {
      this.debt.toGetNextMonth = false;
      this.debt.notToGetForNow = false;
    }
  }

  checkToGetNextMonth() {
    if(this.debt.toGetNextMonth == true) {
      this.debt.toGetThisMonth = false;
      this.debt.notToGetForNow = false;
    }
  }

  checkNotToGetForNow() {
    if(this.debt.notToGetForNow == true) {
      this.debt.toGetThisMonth = false;
      this.debt.toGetNextMonth = false;
    }
  }

  onSelectUnit() {
    if (this.debt.isRestMoney) this.debt.restMoney = this.debt.restMoney + this.selectedUnit;
    else this.debt.financialDebt = this.debt.financialDebt + this.selectedUnit;
  }

  getErrorMessage() {
    return this.formControl.hasError('required') ? 'Required field' :'';
  }

  close() {
    this.dialogRef.close(this.data);
  }

}