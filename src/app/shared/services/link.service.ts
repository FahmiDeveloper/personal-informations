import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class LinkService {

  aflistLinks: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {}

  getAll() {
    this.aflistLinks = this.db.list('/links', link => link.orderByChild('key'));
    return this.aflistLinks
    .snapshotChanges()
    .pipe(map(changes => changes
    .map(c => ({ key: c.payload.key, ...c.payload.val() }))));
  }

  create(link) {
    return this.db.list('/links').push(link);
  }

  update(linkId, link) {
    return this.db.object('/links/' + linkId).update(link);
  }

  delete(linkId) {
    return this.db.object('/links/' + linkId).remove();
  }
  
}