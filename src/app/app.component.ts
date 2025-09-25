import { Component } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dailycheck';
  public aufgaben: Observable<any>[] = [];

  constructor(afDb: AngularFireDatabase) {
    const itemsRef: AngularFireList<any> = afDb.list('Aufgaben');
    itemsRef.valueChanges().subscribe(
      x=> {this.aufgaben = x}
    );
  }
}
