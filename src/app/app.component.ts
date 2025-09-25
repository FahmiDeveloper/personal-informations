import { Component } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dailycheck';
  public aufgaben: Observable<any>[] = [];
  email = '';
  password = '';
  user: firebase.User | null = null;

  constructor(afDb: AngularFireDatabase, private afAuth: AngularFireAuth) {
    const itemsRef: AngularFireList<any> = afDb.list('Aufgaben');
    itemsRef.valueChanges().subscribe(
      x=> {this.aufgaben = x}
    );

    this.afAuth.authState.subscribe(user => {
      this.user = user;
    });
  }

  async register() {
    try {
      const credential = await this.afAuth.createUserWithEmailAndPassword(this.email, this.password);
      console.log('Registered:', credential.user);
    } catch (error: any) {
      console.error('Registration error:', error.message);
    }
  }

  async login() {
    try {
      const credential = await this.afAuth.signInWithEmailAndPassword(this.email, this.password);
      console.log('Logged in:', credential.user);
    } catch (error: any) {
      console.error('Login error:', error.message);
    }
  }

  async logout() {
    await this.afAuth.signOut();
    console.log('User logged out');
  }
}
