import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { ExpirationFormForDesktopComponent } from './expiration-form-for-desktop/expiration-form-for-desktop.component';

import { ExpirationService } from 'src/app/shared/services/expiration.service';

import { Expiration } from 'src/app/shared/models/expiration.model';

@Component({
  selector: 'expirations-for-desktop',
  templateUrl: './expirations-for-desktop.component.html',
  styleUrls: ['./expirations-for-desktop.scss']
})

export class ExpirationsForDesktopComponent implements OnInit, OnDestroy {

  expirationsList: Expiration[] = [];
  expirationsListCopie: Expiration[] = [];

  p = 1;

  content = '';
  innerWidth: any;

  menuTopLeftPosition =  {x: '0', y: '0'} 

  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger: MatMenuTrigger; 

  subscriptionForGetAllExpirations: Subscription;
    
  constructor(
    public expirationService: ExpirationService,
    public dialogService: MatDialog
  ) {}

  ngOnInit() {
    this.innerWidth = window.innerWidth;
    this.getAllExpirations();
  }

  getAllExpirations() {
    this.subscriptionForGetAllExpirations = this.expirationService
    .getAll()
    .subscribe((expirations: Expiration[]) => {

      this.expirationsListCopie = expirations.sort((n1, n2) => n2.numRefExpiration - n1.numRefExpiration);

      if (this.content) {
        this.expirationsList = expirations.filter(expiration => expiration.contentName.toLowerCase().includes(this.content.toLowerCase()));
        this.expirationsList = this.expirationsList.sort((n1, n2) => new Date(n1.dateExpiration).getTime() - new Date(n2.dateExpiration).getTime());
      }

      else {
        this.expirationsList = expirations.sort((n1, n2) => new Date(n1.dateExpiration).getTime() - new Date(n2.dateExpiration).getTime());
      }

      this.expirationsList.forEach(expiration => {
        this.calculateDateDiff(expiration);
        this.calculateRestDays(expiration);
      })
           
    });
  }

  OnPageChange(){
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  calculateDateDiff(expiration: Expiration) {
    const start = new Date(expiration.dateStart);
    const end = new Date(expiration.dateExpiration);

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    // Adjust if negative
    if (days < 0) {
      months--;
      // Get days in the previous month
      const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += previousMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    expiration.duration = `${years}Y ${months}M ${days}D`;
  }

  calculateRestDays(expiration: Expiration) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // set to 00:00:00

    const expDate = new Date(expiration.dateExpiration);
    const expirationDate = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate()); // 00:00:00

    const diffMs = expirationDate.getTime() - today.getTime(); // difference in ms
    const diffInDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const absDays = Math.abs(diffInDays);
    const years = Math.floor(absDays / 365);
    const months = Math.floor((absDays % 365) / 30);
    const days = (absDays % 365) % 30;

    expiration.restdays = `${years}Y ${months}M ${days}D`;

    if (diffInDays <= 0) {
      expiration.isExpired = true;
      expiration.soonToExpire = false;
    } else if (diffInDays <= 3) {
      expiration.isExpired = false;
      expiration.soonToExpire = true;
    } else {
      expiration.isExpired = false;
      expiration.soonToExpire = false;
    }
  }

  newExpiration() {
    let config: MatDialogConfig = {panelClass: "dialog-responsive"}
    const dialogRef = this.dialogService.open(ExpirationFormForDesktopComponent, config);

    dialogRef.componentInstance.arrayExpirations = this.expirationsListCopie;
  }

  editExpiration(expiration?: Expiration) {
    let config: MatDialogConfig = {panelClass: "dialog-responsive"}
    const dialogRef = this.dialogService.open(ExpirationFormForDesktopComponent, config);
    
    dialogRef.componentInstance.expiration = expiration;
  }

  deleteExpiration(expirationKey) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this expiration!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.expirationService.delete(expirationKey);
        Swal.fire(
          'Expiration has been deleted successfully',
          '',
          'success'
        )
      }
    })
  }

  onRightClick(event: MouseEvent, expiration: Expiration) { 
    // preventDefault avoids to show the visualization of the right-click menu of the browser 
    event.preventDefault(); 

    // we record the mouse position in our object 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 

    // we open the menu 
    // we pass to the menu the information about our object 
    this.matMenuTrigger.menuData = {expiration: expiration};

    // we open the menu 
    this.matMenuTrigger.openMenu(); 
  }

  ngOnDestroy() {
    this.subscriptionForGetAllExpirations.unsubscribe();
  }

}