import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class MedicationService {

  aflistMedications: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {}

  getAll() {
    this.aflistMedications = this.db.list('/medications', clocking => clocking.orderByChild('key'));
    return this.aflistMedications
    .snapshotChanges()
    .pipe(map(changes => changes
    .map(c => ({ key: c.payload.key, ...c.payload.val() }))));
  }

  create(medication) {
    return this.db.list('/medications').push(medication);
  }

  update(medicationId, medication) {
    return this.db.object('/medications/' + medicationId).update(medication);
  }

  delete(medicationId) {
    return this.db.object('/medications/' + medicationId).remove();
  }
  
}