import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuTrigger } from '@angular/material/menu';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import * as moment from 'moment';

import { SerieSeasonsForTabletComponent } from './serie-seasons-for-tablet/serie-seasons-for-tablet.component';
import { SerieFormForTabletComponent } from './serie-form-for-tablet/serie-form-for-tablet.component';

import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { SerieService } from 'src/app/shared/services/serie.service';
import { UsersListService } from '../../shared/services/list-users.service';

import { Serie, StatusSeries } from 'src/app/shared/models/serie.model';

@Component({
  selector: 'series-for-tablet',
  templateUrl: './series-for-tablet.component.html',
  styleUrls: ['./series-for-tablet.scss']
})

export class SeriesForTabletComponent implements OnInit, OnDestroy {

  seriesList: Serie[] = [];
  seriesListCopie: Serie[] = [];
  allSeries: Serie[] = [];
  listSeasonsByParentSerieKey: Serie[] = [];
  duplicatedSeriesList: Serie[] = [];
  p = 1;
  serieName = '';
  statusId: number;
  optionSelected: number;
  dislike = false;
  nbrSeriesToCheckToday = 0;
  nbrSeriesNotChecked = 0;
  nbrDuplicatedSeries = 0;
  showSeriesNotChecked = false;
  showDuplicatedSeries = false;
  orientation = '';
  itemsPerPage: number;
  loading = true;

  menuTopLeftPosition = { x: '0', y: '0' }

  @ViewChild('menuTrigger') matMenuTrigger!: MatMenuTrigger;

  subForGetAllSeries: Subscription;
  subForGetAllSeriesForSelect: Subscription;
  subForGetAllSeriesNotChecked: Subscription;
  subForGetAllDuplicatedSeries: Subscription;

  statusSeries: StatusSeries[] = [
    { id: 1, status: 'On hold' },
    { id: 2, status: 'Not yet downloaded' },
    { id: 3, status: 'Watched' },
    { id: 4, status: 'Downloaded but not yet watched' },
    { id: 5, status: 'Will be looked for' }
  ];

  constructor(
    private serieService: SerieService,
    public userService: UserService,
    public usersListService: UsersListService,
    public authService: AuthService,
    public dialogService: MatDialog,
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (window.innerHeight > window.innerWidth) {
      this.orientation = 'Portrait';
    } else {
      this.orientation = 'Landscape';
    }

    this.itemsPerPage = this.orientation == 'Portrait' ? 9 : 10;

    window.matchMedia("(orientation: portrait)").addEventListener("change", e => {
      const portrait = e.matches;

      if (portrait) {
        this.orientation = 'Portrait';
      } else {
        this.orientation = 'Landscape';
      }

      this.itemsPerPage = this.orientation == 'Portrait' ? 9 : 10;
    });
    this.loading = true;
    this.getAllSeries();
    this.getAllSeriesForSelect();
    this.getAllSeriesNotChecked();
    this.getAllDuplicatedSeries();
  }

  getAllSeries() {
    this.subForGetAllSeries = this.serieService
      .getAll()
      .subscribe((series: Serie[]) => {
        this.seriesListCopie = series.sort((n1, n2) => n2.numRefSerie - n1.numRefSerie);
        this.allSeries = series;

        if (this.serieName) {
          this.seriesList = series.filter(serie => (serie.nameSerie.toLowerCase().includes(this.serieName.toLowerCase())) && (serie.isFirst == true));
          this.seriesList = this.seriesList.sort((n1, n2) => n2.numRefSerie - n1.numRefSerie);
        }

        else if (this.statusId) {
          if (this.showSeriesNotChecked) this.showSeriesNotChecked = false;
          if (this.statusId == 1) {
            if (this.dislike) this.dislike = false;
            if (this.optionSelected) {
              if (this.optionSelected == 1) {
                this.seriesList = series.filter(serie => serie.statusId == this.statusId && !serie.checkDate);
              }
              else {
                this.seriesList = series.filter(serie => serie.statusId == this.statusId && serie.checkDate && serie.checkDate == moment().format('YYYY-MM-DD') &&
                  (!serie.currentEpisode || (serie.currentEpisode && !serie.totalEpisodes) || (serie.currentEpisode && serie.totalEpisodes && serie.currentEpisode < serie.totalEpisodes)));
              }
            }
            else {
              this.seriesList = series.filter(serie => serie.statusId == this.statusId);
            }
            this.seriesList = this.seriesList.sort((n1, n2) => n2.numRefSerie - n1.numRefSerie);
          }
          else {
            if (this.optionSelected) this.optionSelected = null;
            if (this.statusId == 3) {
              if (this.dislike) {
                this.seriesList = series.filter(serie => serie.statusId == this.statusId && serie.notLiked == true);
              }
              else {
                this.seriesList = series.filter(serie => serie.statusId == this.statusId);
              }
            }
            else {
              if (this.dislike) this.dislike = false;
              this.seriesList = series.filter(serie => serie.statusId == this.statusId);
            }
            this.seriesList = this.statusId == 3 ? this.seriesList.sort((n1, n2) => n2.numRefSerie - n1.numRefSerie) : this.seriesList.sort((n1, n2) => n1.numRefSerie - n2.numRefSerie);
          }
        }

        else if (this.showSeriesNotChecked) {
          this.seriesList = series.filter(serie => serie.statusId == 1 && serie.checkDate && serie.checkDate < moment().format('YYYY-MM-DD'));
          this.seriesList = this.seriesList.sort((n1, n2) => n2.numRefSerie - n1.numRefSerie);
        }

        else this.seriesList = series.filter(serie => serie.isFirst == true).sort((n1, n2) => n2.numRefSerie - n1.numRefSerie);
        this.loading = false;
      });
  }

  getAllSeriesForSelect() {
    this.subForGetAllSeriesForSelect = this.serieService
      .getAll()
      .subscribe((series: Serie[]) => {
        this.nbrSeriesToCheckToday = series.filter(serie => serie.statusId == 1 && serie.checkDate && serie.checkDate == moment().format('YYYY-MM-DD') &&
          (!serie.currentEpisode || (serie.currentEpisode && !serie.totalEpisodes) || (serie.currentEpisode && serie.currentEpisode && serie.currentEpisode < serie.totalEpisodes))).length;
        this.cdRef.detectChanges();
      })
  }

  getAllSeriesNotChecked() {
    this.subForGetAllSeriesNotChecked = this.serieService
      .getAll()
      .subscribe((series: Serie[]) => {
        this.nbrSeriesNotChecked = series.filter(serie => serie.statusId == 1 && serie.checkDate && serie.checkDate < moment().format('YYYY-MM-DD')).length;
        this.cdRef.detectChanges();
      })
  }

  getAllDuplicatedSeries() {
    this.seriesList = [];
    this.duplicatedSeriesList = [];
    this.nbrDuplicatedSeries = 0;

    this.subForGetAllDuplicatedSeries = this.serieService.getAll().subscribe((series: Serie[]) => {
      const defaultSeries = series.filter(s => s.isFirst);
      const duplicatedResult = this.getDuplicatedSeries(defaultSeries);

      this.duplicatedSeriesList = duplicatedResult.list;
      this.nbrDuplicatedSeries = duplicatedResult.count;

      this.updateSeriesList();
      this.cdRef.detectChanges();
    });
  }

  getDuplicatedSeries(series: Serie[]): { list: Serie[]; count: number } {
    const serieMap = new Map<string, Serie[]>();
    const result: Serie[] = [];
    let duplicationCount = 0;

    series.forEach(serie => {
      const key = serie.nameSerie?.trim();

      if (!key) {
        return;
      }

      const list = serieMap.get(key) || [];
      list.push(serie);
      serieMap.set(key, list);
    });

    serieMap.forEach(list => {
      if (list.length > 1) {
        duplicationCount++;     // ✅ one duplicated serie
        result.push(...list);   // duplicates grouped together
      }
    });

    return { list: result, count: duplicationCount };
  }

  onDuplicatedToggle() {
    this.updateSeriesList();
  }

  updateSeriesList() {
    if (this.showDuplicatedSeries) {
      this.seriesList = this.duplicatedSeriesList;
      this.seriesList = this.seriesList.sort((a, b) => {
        const nameCompare = a.nameSerie.localeCompare(b.nameSerie);

        if (nameCompare !== 0) return nameCompare; // group by name first

        return b.numRefSerie - a.numRefSerie; // then sort inside group
      });
    } else {
      this.getAllSeries();
    }
  }

  OnPageChange() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  showDetailsSerie(serieSelected: Serie) {
    this.listSeasonsByParentSerieKey = this.allSeries
      .filter(serie => (serie.key == serieSelected.key) || (serie.parentSerieKey == serieSelected.key))
      .sort((n1, n2) => n1.priority - n2.priority);

    const dialogRef = this.dialogService.open(SerieSeasonsForTabletComponent, { width: '1150px' });
    dialogRef.componentInstance.serie = serieSelected;
    dialogRef.componentInstance.allSeries = this.allSeries;
    dialogRef.componentInstance.listSeasonsByParentSerieKey = this.listSeasonsByParentSerieKey;
  }

  newSerie() {
    const dialogRef = this.dialogService.open(SerieFormForTabletComponent, { width: '500px', data: { movie: {} } });
    dialogRef.componentInstance.arraySeries = this.seriesListCopie;
    dialogRef.componentInstance.allSeries = this.allSeries;
  }

  editSerie(serie?: Serie) {
    const dialogRef = this.dialogService.open(SerieFormForTabletComponent, { width: '500px' });
    dialogRef.componentInstance.serie = serie;
    dialogRef.componentInstance.allSeries = this.allSeries;
  }

  deleteSerie(serieKey: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this serie!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.serieService.delete(serieKey);
        Swal.fire(
          'Serie has been deleted successfully',
          '',
          'success'
        )
      }
    })
  }

  followLink(path: string) {
    window.open(path);
  }

  copyText(text: string) {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = text;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.showSnackbarTopPosition();
  }

  showSnackbarTopPosition() {
    this.snackBar.open('Text copied', 'Done', {
      duration: 2000,
      verticalPosition: "bottom", // Allowed values are  'top' | 'bottom'
      horizontalPosition: "center" // Allowed values are 'start' | 'center' | 'end' | 'left' | 'right'
    });
  }

  openMenuTrigger(event: MouseEvent, serie: Serie) {
    // preventDefault avoids to show the visualization of the right-click menu of the browser 
    event.preventDefault();

    // we record the mouse position in our object 
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';

    // we open the menu 
    // we pass to the menu the information about our object 
    this.matMenuTrigger.menuData = { serie: serie };

    // we open the menu 
    this.matMenuTrigger.openMenu();
  }

  ngOnDestroy() {
    this.subForGetAllSeries.unsubscribe();
    this.subForGetAllSeriesForSelect.unsubscribe();
    this.subForGetAllSeriesNotChecked.unsubscribe();
    this.subForGetAllDuplicatedSeries.unsubscribe();
  }

}