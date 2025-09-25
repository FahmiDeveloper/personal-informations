import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';

import { map } from 'rxjs/operators';

import { Debt } from '../models/debt.model';

@Injectable({
  providedIn: 'root'
})

export class DebtService {

  aflistDebts: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {}

  getAll() {
    this.aflistDebts = this.db.list('/debts', debt => debt.orderByChild('key'));
    return this.aflistDebts
    .snapshotChanges()
    .pipe(map(changes => changes
    .map(c => ({ key: c.payload.key, ...c.payload.val() }))));
  }

  create(debt) {
    return this.db.list('/debts').push(debt);
  }

  update(debtId, debt) {
    return this.db.object('/debts/' + debtId).update(debt);
  }

  delete(debtId) {
    return this.db.object('/debts/' + debtId).remove();
  }

  getDebtId(debtId: string): AngularFireObject<Debt> {
    return this.db.object('/debts/' + debtId);
  }

}