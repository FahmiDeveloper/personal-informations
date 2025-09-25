import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class ExpirationService {

  aflistExpiration: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {}

  getAll() {
    this.aflistExpiration = this.db.list('/expiration', expiration => expiration.orderByChild('key'));
    return this.aflistExpiration
    .snapshotChanges()
    .pipe(map(changes => changes
    .map(c => ({ key: c.payload.key, ...c.payload.val() }))));
  }

  create(expiration) {
    return this.db.list('/expiration').push(expiration);
  }

  update(expirationId, expiration) {
    return this.db.object('/expiration/' + expirationId).update(expiration);
  }

  delete(expirationId) {
    return this.db.object('/expiration/' + expirationId).remove();
  }
  
}