import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class SubjectDocumentsService {

  aflistSubjectsDocuments: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {}

  getAll() {
    this.aflistSubjectsDocuments = this.db.list('/SubjectDocuments', clocking => clocking.orderByChild('key'));
    return this.aflistSubjectsDocuments
    .snapshotChanges()
    .pipe(map(changes => changes
    .map(c => ({ key: c.payload.key, ...c.payload.val() }))));
  }

  create(subjectDocuments) {
    return this.db.list('/SubjectDocuments').push(subjectDocuments);
  }

  update(subjectDocumentsId, subjectDocuments) {
    return this.db.object('/SubjectDocuments/' + subjectDocumentsId).update(subjectDocuments);
  }

  delete(subjectDocumentsId) {
    return this.db.object('/SubjectDocuments/' + subjectDocumentsId).remove();
  }
  
}