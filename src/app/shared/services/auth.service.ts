import { Injectable } from "@angular/core";
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute } from "@angular/router";

import 'rxjs/add/operator/toPromise';
import { BehaviorSubject } from "rxjs";

import firebase from 'firebase';

import { UserService } from "./user.service";

@Injectable({ providedIn: 'root' })

export class AuthService {

  isConnected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
   public afAuth: AngularFireAuth,
   public userService:UserService,
   private route: ActivatedRoute
 ){ this.userService.isAuthentificated().then(res=>this.isConnected.next(res));}

  doRegister(value){
    return new Promise<any>((resolve, reject) => {
      firebase.auth().createUserWithEmailAndPassword(value.email, value.password)
      .then(res => {
        resolve(res);
      }, err => reject(err))
    })
  }

  doLogin(value){
    return new Promise<any>((resolve, reject) => {
      let returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/home';
      localStorage.setItem('returnUrl',returnUrl);
      firebase.auth().signInWithEmailAndPassword(value.email, value.password)
      .then(res => {
        resolve(res);
      }, err => reject(err))
    })
  }

  doLogout(){
    return new Promise<void>((resolve, reject) => {
      if(firebase.auth().currentUser){
        this.afAuth.signOut();
        resolve();
      }
      else{
        reject();
      }
    });
  }
  
}