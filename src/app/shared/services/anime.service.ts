import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

import { map, take } from 'rxjs/operators';

import { Anime } from '../models/anime.model';

@Injectable({
  providedIn: 'root'
})

export class AnimeService {

  aflistAnimes: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {}

  getAll() {
    this.aflistAnimes = this.db.list('/animes', anime => anime.orderByChild('key'));
    return this.aflistAnimes
    .snapshotChanges()
    .pipe(map(changes => changes
    .map(c => ({ key: c.payload.key, ...c.payload.val() }))));
  }

  create(anime) {
    return this.db.list('/animes').push(anime);
  }

  update(animeId, anime) {
    return this.db.object('/animes/' + animeId).update(anime);
  }

  delete(animeId) {
    return this.db.object('/animes/' + animeId).remove();
  }

  getTodayAnimesCount(date: string) {
    return this.db.list<Anime>('/animes', ref =>
      ref.orderByChild('checkDate').equalTo(date)
    )
    .valueChanges()
    .pipe(
      take(1),
      map(animes =>
        animes.filter(anime => anime.statusId === 1 && anime.checkDate && anime.checkDate === date &&
        (!anime.currentEpisode || (anime.currentEpisode && !anime.totalEpisodes) || (anime.currentEpisode && anime.totalEpisodes && anime.currentEpisode < anime.totalEpisodes))).length
      )
    );
  }

  getNotCheckedAnimesCount(date: string) {
    return this.db.list<Anime>('/animes', ref =>
      ref.orderByChild('checkDate').endAt(date)
    )
    .valueChanges()
    .pipe(
      take(1),
      map(animes =>
        animes.filter(anime => anime.statusId === 1 && anime.checkDate && anime.checkDate < date).length // ⬅ exclude today
      )
    );
  }

}