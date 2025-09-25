import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class NotificationService {

  aflistNotification: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {}

  getAll() {
    this.aflistNotification = this.db.list('/notification', notification => notification.orderByChild('key'));
    return this.aflistNotification
    .snapshotChanges()
    .pipe(map(changes => changes
    .map(c => ({ key: c.payload.key, ...c.payload.val() }))));
  }

  create(notification) {
    return this.db.list('/notification').push(notification);
  }

  update(notificationId, notification) {
    return this.db.object('/notification/' + notificationId).update(notification);
  }

  delete(notificationId) {
    return this.db.object('/notification/' + notificationId).remove();
  }
  
}