import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class SubjectNotesService {

  aflistSubjectNotes: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {}

  getAll() {
    this.aflistSubjectNotes = this.db.list('/SubjectNotes', subjectNotes => subjectNotes.orderByChild('key'));
    return this.aflistSubjectNotes
    .snapshotChanges()
    .pipe(map(changes => changes
    .map(c => ({ key: c.payload.key, ...c.payload.val() }))));
  }

  create(subjectNote) {
    return this.db.list('/SubjectNotes').push(subjectNote);
  }

  update(subjectNoteId, subjectNote) {
    return this.db.object('/SubjectNotes/' + subjectNoteId).update(subjectNote);
  }

  delete(subjectNoteId) {
    return this.db.object('/SubjectNotes/' + subjectNoteId).remove();
  }
  
}