import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class PasswordService {

  aflistPassword: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {}

  getAll() {
    this.aflistPassword = this.db.list('/password', password => password.orderByChild('key'));
    return this.aflistPassword
    .snapshotChanges()
    .pipe(map(changes => changes
    .map(c => ({ key: c.payload.key, ...c.payload.val() }))));
  }

  create(password) {
    return this.db.list('/password').push(password);
  }

  update(passwordId, password) {
    return this.db.object('/password/' + passwordId).update(password);
  }

  delete(passwordId) {
    return this.db.object('/password/' + passwordId).remove();
  }
  
}