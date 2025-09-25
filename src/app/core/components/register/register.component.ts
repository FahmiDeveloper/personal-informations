import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { DeviceDetectorService } from 'ngx-device-detector';
import { Subscription } from 'rxjs';

import { AuthService } from 'src/app/shared/services/auth.service';
import { UsersListService } from 'src/app/shared/services/list-users.service';

import { FirebaseUserModel } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit, OnDestroy {

  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  fieldRequired = 'This field is required';

  isMobile: boolean;
  hide = true;

  user: FirebaseUserModel = new FirebaseUserModel();

  subscriptionForGetAllUsers: Subscription;
  lastNumRefUser: number;
  usersList: FirebaseUserModel[] = [];
  allUsersForUpdateConnectedUserStatus: FirebaseUserModel[] = [];

  constructor(
    public authService: AuthService,
    private router: Router,
    public usersListService: UsersListService,
    private fb: FormBuilder,
    private deviceService: DeviceDetectorService
  ) {}

  ngOnInit() {
    this.validateForm();
    this.isMobile = this.deviceService.isMobile();
    this.getUsersList();
  }

  validateForm() {
    let emailregex: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.registerForm = this.fb.group({
    'username': new FormControl(null,[Validators.required]),
    'email': new FormControl(null,[Validators.required, Validators.pattern(emailregex)]),
    'password': new FormControl(null, [Validators.required, this.checkPassword]),
   });
  }

  getUsersList(){
    this.subscriptionForGetAllUsers = this.usersListService
    .getAll()
    .subscribe((users: FirebaseUserModel[]) => {
      this.allUsersForUpdateConnectedUserStatus = users;
      this.usersList = users.sort((n1, n2) => n2.numRefUser - n1.numRefUser);
      if (this.usersList[0] &&this.usersList[0].numRefUser) this.lastNumRefUser = this.usersList[0].numRefUser + 1;      
      else this.lastNumRefUser = 1;
    });
  }

  checkPassword(control) {
    let enteredPassword = control.value
    let passwordCheck = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})/;
    return (!passwordCheck.test(enteredPassword) && enteredPassword) ? { 'requirements': true } : null;
  }

  emaiErrors() {
    return this.registerForm.get('email').hasError('required') ? 'This field is required' :
      this.registerForm.get('email').hasError('pattern') ? 'Not a valid emailaddress' :''
  }

  getErrorPassword() {
    return this.registerForm.get('password').hasError('required') ? 'This field is required (The password must be at least six characters, one uppercase letter and one number)' :
      this.registerForm.get('password').hasError('requirements') ? 'Password needs to be at least six characters, one uppercase letter and one number' : '';
  }

  checkValidation(input: string){
    const validation = this.registerForm.get(input).invalid && (this.registerForm.get(input).dirty || this.registerForm.get(input).touched)
    return validation;
  }

  tryRegister(value){
    this.user.email = value.email;
    this.user.name = value.username;
    this.user.password = value.password;
    this.user.numRefUser = this.lastNumRefUser;

    this.usersListService.create(this.user);

    this.authService.doRegister(value)
    .then(res => {
      this.errorMessage = "";
      this.successMessage = "Your account has been created";
      this.onSuccess();
      this.putRegistredUserConnected(value.email);
    }, err => {
      console.log(err);
      this.errorMessage = err.message;
      this.successMessage = "";
    })
  }

  onSuccess(){
    this.router.navigate(['/home']);
    this.authService.isConnected.next(true);
  }

  putRegistredUserConnected(email: string) {
    let connectedUserFromList: FirebaseUserModel;
    connectedUserFromList = this.allUsersForUpdateConnectedUserStatus.find(user => user.email == email);
    connectedUserFromList.isConnected = true;
    this.usersListService.update(connectedUserFromList.key, connectedUserFromList);
  }

  ngOnDestroy() {
    this.subscriptionForGetAllUsers.unsubscribe();
  }
  
}
