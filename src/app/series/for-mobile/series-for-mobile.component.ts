import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import * as moment from 'moment';

import { SerieDetailsWithSeasonsMobileComponent } from './serie-details-with-seasons-mobile/serie-details-with-seasons-mobile.component';
import { SerieFormMobileComponent } from './serie-form-mobile/serie-form-mobile.component';

import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { SerieService } from 'src/app/shared/services/serie.service';
import { UsersListService } from '../../shared/services/list-users.service';

import { Serie, StatusSeries } from 'src/app/shared/models/serie.model';

@Component({
  selector: 'series-for-mobile',
  templateUrl: './series-for-mobile.component.html',
  styleUrls: ['./series-for-mobile.scss']
})

export class SeriesForMobileComponent implements OnInit, OnDestroy {

  seriesList: Serie[] = [];
  seriesListCopie: Serie[] = [];
  allSeries: Serie[] = [];
  listSeasonsByParentSerieKey: Serie[] = [];

  p = 1;

  serieName = '';
  statusId: number;
  sortByDesc = true;
  optionSelected: number;
  nbrSeriesToCheckToday = 0;
  nbrSeriesNotChecked = 0;
  showSeriesNotChecked = false;

  subscriptionForGetAllSeries: Subscription;
  subscriptionForGetAllSeriesForSelect: Subscription;
  subscriptionForGetAllSeriesNotChecked: Subscription;

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
    this.getAllSeries();
    this.getAllSeriesForSelect();
    this.getAllSeriesNotChecked();
  }

  getAllSeries() {
    this.subscriptionForGetAllSeries = this.serieService
      .getAll()
      .subscribe(series => {
        this.seriesListCopie = series.sort((n1, n2) => n2.numRefSerie - n1.numRefSerie);
        this.allSeries = series;

        if (this.serieName) {
          this.seriesList = series.filter(serie => (serie.nameSerie.toLowerCase().includes(this.serieName.toLowerCase())) && (serie.isFirst == true));
          this.seriesList = this.seriesList.sort((n1, n2) => n2.numRefSerie - n1.numRefSerie);
        }

        else if (this.statusId) {

          if (this.showSeriesNotChecked) this.showSeriesNotChecked = false;

          if (this.statusId == 1) {
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
          }

          else {
            if (this.optionSelected) this.optionSelected = null;
            this.seriesList = series.filter(serie => serie.statusId == this.statusId);
          }

          this.seriesList = this.statusId == 1 || this.statusId == 3 ? this.seriesList.sort((n1, n2) => n2.numRefSerie - n1.numRefSerie) : this.seriesList.sort((n1, n2) => n1.numRefSerie - n2.numRefSerie);
        }

        else if (this.showSeriesNotChecked) {
          this.seriesList = series.filter(serie => serie.statusId == 1 && serie.checkDate && serie.checkDate < moment().format('YYYY-MM-DD'));
          this.seriesList = this.seriesList.sort((n1, n2) => n2.numRefSerie - n1.numRefSerie);
        }

        else this.seriesList = series.filter(serie => serie.isFirst == true).sort((n1, n2) => n2.numRefSerie - n1.numRefSerie);

      });
  }

  getAllSeriesForSelect() {
    this.subscriptionForGetAllSeriesForSelect = this.serieService
      .getAll()
      .subscribe((series: Serie[]) => {
        this.nbrSeriesToCheckToday = series.filter(serie => serie.statusId == 1 && serie.checkDate && serie.checkDate == moment().format('YYYY-MM-DD') &&
          (!serie.currentEpisode || (serie.currentEpisode && !serie.totalEpisodes) || (serie.currentEpisode && serie.currentEpisode && serie.currentEpisode < serie.totalEpisodes))).length;
        this.cdRef.detectChanges();
      })
  }

  getAllSeriesNotChecked() {
    this.subscriptionForGetAllSeriesNotChecked = this.serieService
      .getAll()
      .subscribe((series: Serie[]) => {
        this.nbrSeriesNotChecked = series.filter(serie => serie.statusId == 1 && serie.checkDate && serie.checkDate < moment().format('YYYY-MM-DD')).length;
        this.cdRef.detectChanges();
      })
  }

  OnPageChange(elem: HTMLElement) {
    elem.scrollIntoView();
  }

  showDetailsSerie(serieSelected: Serie) {
    this.listSeasonsByParentSerieKey = this.allSeries
      .filter(serie => (serie.key == serieSelected.key) || (serie.parentSerieKey == serieSelected.key))
      .sort((n1, n2) => n1.priority - n2.priority);

    const dialogRef = this.dialogService.open(SerieDetailsWithSeasonsMobileComponent, {
      width: '98vw',
      height: '75vh',
      maxWidth: '100vw'
    });
    dialogRef.componentInstance.serie = serieSelected;
    dialogRef.componentInstance.allSeries = this.allSeries;
    dialogRef.componentInstance.listSeasonsByParentSerieKey = this.listSeasonsByParentSerieKey;
  }

  newSerie() {
    const dialogRef = this.dialogService.open(SerieFormMobileComponent, {
      width: '98vw',
      height: '75vh',
      maxWidth: '100vw',
      data: { movie: {} }
    });
    dialogRef.componentInstance.arraySeries = this.seriesListCopie;
    dialogRef.componentInstance.allSeries = this.allSeries;
  }

  editSerie(serie?: Serie) {
    const dialogRef = this.dialogService.open(SerieFormMobileComponent, {
      width: '98vw',
      height: '75vh',
      maxWidth: '100vw'
    });
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

  viewNote(serieNote: string) {
    Swal.fire({
      text: serieNote,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Close'
    });
  }

  ngOnDestroy() {
    this.subscriptionForGetAllSeries.unsubscribe();
    this.subscriptionForGetAllSeriesForSelect.unsubscribe();
    this.subscriptionForGetAllSeriesNotChecked.unsubscribe();
  }
}