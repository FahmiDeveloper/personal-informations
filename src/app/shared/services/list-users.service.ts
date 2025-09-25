import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';

import { map } from 'rxjs/operators';

import { FirebaseUserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})

export class UsersListService {

  afUsersList: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {}

  getAll() {
    this.afUsersList = this.db.list('/users-list', UsersList => UsersList.orderByChild('key'));
    return this.afUsersList
    .snapshotChanges()
    .pipe(map(changes => changes
    .map(c => ({ key: c.payload.key, ...c.payload.val() }))));
  }

  create(user) {
    return this.db.list('/users-list').push(user);
  }

  update(userId, user) {
    return this.db.object('/users-list/' + userId).update(user);
  }

  delete(userId) {
    return this.db.object('/users-list/' + userId).remove();
  }

  get(uid: string): AngularFireObject<FirebaseUserModel> {
    return this.db.object('/users-list/' + uid);
  }
  
}