import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { PasswordFormForTabletComponent } from './password-form-for-tablet/password-form-for-tablet.component';

import { PasswordService } from 'src/app/shared/services/password.service';

import { Password } from 'src/app/shared/models/password.model';

@Component({
  selector: 'passwords-for-tablet',
  templateUrl: './passwords-for-tablet.component.html',
  styleUrls: ['./passwords-for-tablet.scss']
})

export class PasswordsForTabletComponent implements OnInit, OnDestroy {

  passwordsList: Password[] = [];
  passwordsListCopie: Password[] = [];

  p = 1;

  content = '';
  orientation = '';

  subscriptionForGetAllPassword: Subscription;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  
  constructor(
    public passwordService: PasswordService,
    public dialogService: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
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
           
    });
  }

  OnPageChange(){
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  newPassword() {
    let config: MatDialogConfig = {panelClass: "dialog-responsive"}
    const dialogRef = this.dialogService.open(PasswordFormForTabletComponent, config);

    dialogRef.componentInstance.arrayPasswords = this.passwordsListCopie;
  }

  editPassword(password?: Password) {
    let config: MatDialogConfig = {panelClass: "dialog-responsive"}
    const dialogRef = this.dialogService.open(PasswordFormForTabletComponent, config);
    
    dialogRef.componentInstance.password = password;
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

  followLink(path: string) {
    window.open(path);
  }

  showSnackbarTopPosition() {
    this.snackBar.open('Text copied', 'Done', {
      duration: 2000,
      verticalPosition: "bottom", // Allowed values are  'top' | 'bottom'
      horizontalPosition: "center" // Allowed values are 'start' | 'center' | 'end' | 'left' | 'right'
    });
  }

  ngOnDestroy() {
    this.subscriptionForGetAllPassword.unsubscribe();
  }

}