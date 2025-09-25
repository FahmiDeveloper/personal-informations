import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { DeviceDetectorService } from 'ngx-device-detector';

import { AuthService } from 'src/app/shared/services/auth.service';
import { UsersListService } from 'src/app/shared/services/list-users.service';

import { FirebaseUserModel } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit{

  allUsers: FirebaseUserModel[] = [];
  loginForm: FormGroup;
  errorMessage = '';

  isMobile: boolean;
  hide = true;

  constructor(
    public authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private deviceService: DeviceDetectorService,
    public usersListService: UsersListService
  ) {}

  ngOnInit() {
    this.validateForm();
    this.isMobile = this.deviceService.isMobile();
    this.getAllUsers();
  }

  validateForm() {
    this.loginForm = this.fb.group({
      email: ['', Validators.required ],
      password: ['',Validators.required]
    });
  }

  getAllUsers() {
    this.usersListService
    .getAll()
    .subscribe((users: FirebaseUserModel[]) => {
      this.allUsers = users;
    });
  }

  tryLogin(value){
    this.authService.doLogin(value)
    .then(res => {
      this.onSuccess();
      this.putCurrentUserConnected(value.email);
    }, err => {
      this.errorMessage = err.message;
    })
  }

  putCurrentUserConnected(email: string) {
    let connectedUserFromList: FirebaseUserModel;
    connectedUserFromList = this.allUsers.find(user => user.email == email);
    connectedUserFromList.isConnected = true;
    this.usersListService.update(connectedUserFromList.key, connectedUserFromList);
  }

  onSuccess(){
    this.router.navigate(['/home']);
    this.authService.isConnected.next(true);
  }
  
}