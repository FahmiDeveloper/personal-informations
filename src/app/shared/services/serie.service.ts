import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

import { map, take } from 'rxjs/operators';

import { Serie } from '../models/serie.model';

@Injectable({
  providedIn: 'root'
})

export class SerieService {

  aflistSeries: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {}

  getAll() {
    this.aflistSeries = this.db.list('/series', serie => serie.orderByChild('key'));
    return this.aflistSeries
    .snapshotChanges()
    .pipe(map(changes => changes
    .map(c => ({ key: c.payload.key, ...c.payload.val() }))));
  }

  create(serie) {
    return this.db.list('/series').push(serie);
  }

  update(serieId, serie) {
    return this.db.object('/series/' + serieId).update(serie);
  }

  delete(serieId) {
    return this.db.object('/series/' + serieId).remove();
  }

  getTodaySeriesCount(date: string) {
    return this.db.list<Serie>('/series', ref =>
      ref.orderByChild('checkDate').equalTo(date)
    )
    .valueChanges()
    .pipe(
      take(1),
      map(series =>
        series.filter(serie => serie.statusId === 1 && serie.checkDate && serie.checkDate === date &&
        (!serie.currentEpisode || (serie.currentEpisode && !serie.totalEpisodes) || (serie.currentEpisode && serie.totalEpisodes && serie.currentEpisode < serie.totalEpisodes))).length
      )
    );
  }

  getNotCheckedSeriesCount(date: string) {
    return this.db.list<Serie>('/series', ref =>
      ref.orderByChild('checkDate').endAt(date)
    )
    .valueChanges()
    .pipe(
      take(1),
      map(series =>
        series.filter(serie => serie.statusId === 1 && serie.checkDate && serie.checkDate < date).length // ⬅ exclude today
      )
    );
  }

}