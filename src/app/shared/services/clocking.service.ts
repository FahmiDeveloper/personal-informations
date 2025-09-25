import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class ClockingService {

  aflistClocking: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {}

  getAll() {
    this.aflistClocking = this.db.list('/clocking', clocking => clocking.orderByChild('key'));
    return this.aflistClocking
    .snapshotChanges()
    .pipe(map(changes => changes
    .map(c => ({ key: c.payload.key, ...c.payload.val() }))));
  }

  create(clocking) {
    return this.db.list('/clocking').push(clocking);
  }

  update(clockingId, clocking) {
    return this.db.object('/clocking/' + clockingId).update(clocking);
  }

  delete(clockingId) {
    return this.db.object('/clocking/' + clockingId).remove();
  }
  
}