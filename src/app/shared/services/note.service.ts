import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class NoteService {

  aflistNotes: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {}

  getAll() {
    this.aflistNotes = this.db.list('/notes', clocking => clocking.orderByChild('key'));
    return this.aflistNotes
    .snapshotChanges()
    .pipe(map(changes => changes
    .map(c => ({ key: c.payload.key, ...c.payload.val() }))));
  }

  create(note) {
    return this.db.list('/notes').push(note);
  }

  update(noteId, note) {
    return this.db.object('/notes/' + noteId).update(note);
  }

  delete(noteId) {
    return this.db.object('/notes/' + noteId).remove();
  }
  
}