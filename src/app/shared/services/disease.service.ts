import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class DiseaseService {

  aflistDiseases: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {}

  getAll() {
    this.aflistDiseases = this.db.list('/diseases', clocking => clocking.orderByChild('key'));
    return this.aflistDiseases
    .snapshotChanges()
    .pipe(map(changes => changes
    .map(c => ({ key: c.payload.key, ...c.payload.val() }))));
  }

  create(disease) {
    return this.db.list('/diseases').push(disease);
  }

  update(diseaseId, disease) {
    return this.db.object('/diseases/' + diseaseId).update(disease);
  }

  delete(diseaseId) {
    return this.db.object('/diseases/' + diseaseId).remove();
  }
  
}