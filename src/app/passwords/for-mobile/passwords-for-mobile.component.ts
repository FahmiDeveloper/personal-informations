import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { PasswordFormForMobileComponent } from './password-form-for-mobile/password-form-for-mobile.component';

import { PasswordService } from 'src/app/shared/services/password.service';

import { Password } from 'src/app/shared/models/password.model';

@Component({
  selector: 'passwords-for-mobile',
  templateUrl: './passwords-for-mobile.component.html',
  styleUrls: ['./passwords-for-mobile.scss']
})

export class PasswordsForMobileComponent implements OnInit, OnDestroy {

  passwordsList: Password[] = [];
  pagedList: Password[]= [];
  passwordsListCopie: Password[] = [];

  content = '';
  
  length = 0;
  pageSize = 6;
  pageSizeOptions: number[] = [6];

  subscriptionForGetAllPassword: Subscription;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  
  constructor(
    public passwordService: PasswordService,
    public dialogService: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.getAllPasswords();
  }

  getAllPasswords() {
    this.subscriptionForGetAllPassword = this.passwordService
    .getAll()
    .subscribe((passwords: Password[]) => {

      this.passwordsListCopie = passwords.sort((n1, n2) => n2.numRefPassword - n1.numRefPassword);

      if (this.content) {
        this.passwordsList = passwords.filter(password => password.contentName.toLowerCase().includes(this.content.toLowerCase()));
        this.passwordsList = this.passwordsList.sort((n1, n2) => n2.numRefPassword - n1.numRefPassword);
      }  
      else {
        this.passwordsList = passwords.sort((n1, n2) => n2.numRefPassword - n1.numRefPassword);
      }

      this.pagedList = this.passwordsList.slice(0, 6);
      this.length = this.passwordsList.length;
           
    });
  }

  OnPageChange(elem: HTMLElement){
    elem.scrollIntoView();
  }

  newPassword() {
    const dialogRef = this.dialogService.open(PasswordFormForMobileComponent, {
      width: '98vw',
      height:'71vh',
      maxWidth: '100vw', 
      data: {movie: {}}
    });
    dialogRef.componentInstance.arrayPasswords = this.passwordsListCopie;
  }

  editPassword(password?: Password) {
    const dialogRef = this.dialogService.open(PasswordFormForMobileComponent, {
      width: '98vw',
      height:'70vh',
      maxWidth: '100vw'
    });
    dialogRef.componentInstance.password = password;
    dialogRef.componentInstance.pagedList = this.pagedList;

    dialogRef.afterClosed().subscribe(res => {
      this.pagedList = res;
    });
  }

  deletePassword(passwordKey) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this password!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.passwordService.delete(passwordKey);
        Swal.fire(
          'Password has been deleted successfully',
          '',
          'success'
        )
      }
    })
  }

  copyCoordinate(coordinate: string){
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = coordinate;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.showSnackbarTopPosition();
  }

  showSnackbarTopPosition() {
    this.snackBar.open('Text copied', 'Done', {
      duration: 2000,
      verticalPosition: "bottom", // Allowed values are  'top' | 'bottom'
      horizontalPosition: "center" // Allowed values are 'start' | 'center' | 'end' | 'left' | 'right'
    });
  }

  followLink(path: string) {
    window.open(path);
  }

  ngOnDestroy() {
    this.subscriptionForGetAllPassword.unsubscribe();
  }
  
}