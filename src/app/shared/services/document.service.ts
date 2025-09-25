import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class DocumentService {

  aflistDocuments: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {}

  getAll() {
    this.aflistDocuments = this.db.list('/Documents', clocking => clocking.orderByChild('key'));
    return this.aflistDocuments
    .snapshotChanges()
    .pipe(map(changes => changes
    .map(c => ({ key: c.payload.key, ...c.payload.val() }))));
  }

  create(document) {
    return this.db.list('/Documents').push(document);
  }

  update(documentId, document) {
    return this.db.object('/Documents/' + documentId).update(document);
  }

  delete(documentId) {
    return this.db.object('/Documents/' + documentId).remove();
  }
  
}