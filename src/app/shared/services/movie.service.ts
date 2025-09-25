import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class MovieService {

  aflistMovies: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {}

  getAll() {
    this.aflistMovies = this.db.list('/movies', movie => movie.orderByChild('key'));
    return this.aflistMovies
    .snapshotChanges()
    .pipe(map(changes => changes
    .map(c => ({ key: c.payload.key, ...c.payload.val() }))));
  }

  create(movie) {
    return this.db.list('/movies').push(movie);
  }

  update(movieId, movie) {
    return this.db.object('/movies/' + movieId).update(movie);
  }

  delete(movieId) {
    return this.db.object('/movies/' + movieId).remove();
  }
  
}