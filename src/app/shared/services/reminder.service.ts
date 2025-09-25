import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class ReminderService {

  aflistReminder: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {}

  getAll() {
    this.aflistReminder = this.db.list('/reminder', reminder => reminder.orderByChild('key'));
    return this.aflistReminder
    .snapshotChanges()
    .pipe(map(changes => changes
    .map(c => ({ key: c.payload.key, ...c.payload.val() }))));
  }

  create(reminder) {
    return this.db.list('/reminder').push(reminder);
  }

  update(reminderId, reminder) {
    return this.db.object('/reminder/' + reminderId).update(reminder);
  }

  delete(reminderId) {
    return this.db.object('/reminder/' + reminderId).remove();
  }
  
}