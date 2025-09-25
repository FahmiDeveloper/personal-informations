import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';

import Swal from 'sweetalert2';

import { SerieService } from 'src/app/shared/services/serie.service';

import { Serie, StatusSeries } from 'src/app/shared/models/serie.model';

@Component({
  selector: 'serie-form-desktop',
  templateUrl: './serie-form-desktop.component.html',
  styleUrls: ['./serie-form-desktop.scss'],
  providers: [DatePipe]
})

export class SerieFormDesktopComponent implements OnInit {

  arraySeries: Serie[];
  seasonSeriesList: Serie[] = [];
  allSeries: Serie[];

  serie: Serie = new Serie();

  parentSerieName: string;

  basePath = '/PicturesSeries';
  progressValue = new BehaviorSubject<number | null>(null);
  selectedFile: File | null = null;

  formControl = new FormControl('', [Validators.required]);

  statusSeries: StatusSeries[] = [
    { id: 1, status: 'On hold' },
    { id: 2, status: 'Not yet downloaded' },
    { id: 3, status: 'Watched' },
    { id: 4, status: 'Downloaded but not yet watched' },
    { id: 5, status: 'Will be looked for' }
  ];

  constructor(
    private serieService: SerieService,
    public dialogRef: MatDialogRef<SerieFormDesktopComponent>,
    public dialogService: MatDialog,
    private firestore: AngularFirestore,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.seasonSeriesList = this.allSeries
      .filter(serie => serie.isFirst == true && serie.season && serie.season == 1)
      .sort((n1, n2) => n2.numRefSerie - n1.numRefSerie);

    if (this.serie.key) {
      if (this.seasonSeriesList.find(serie => serie.key == this.serie.parentSerieKey)) {
        this.parentSerieName = this.seasonSeriesList.find(serie => serie.key == this.serie.parentSerieKey).nameSerie;
      }
    }
  }

  filterByParentName(event: Event): void {
    const input = event.target as HTMLInputElement;
    const serieName = input.value;

    if (serieName) {
      this.seasonSeriesList = this.allSeries
        .filter(serie =>
          serie.nameSerie.toLowerCase().includes(serieName.toLowerCase()) &&
          serie.isFirst === true &&
          serie.season &&
          serie.season === 1
        )
        .sort((n1, n2) => n2.numRefSerie - n1.numRefSerie);
    } else {
      this.seasonSeriesList = this.allSeries
        .filter(serie =>
          serie.isFirst === true &&
          serie.season &&
          serie.season === 1
        )
        .sort((n1, n2) => n2.numRefSerie - n1.numRefSerie);
    }
  }

  getParentSerieKey(serieKey: string) {
    if (this.seasonSeriesList.find(serie => serie.key == serieKey)) {
      this.parentSerieName = this.seasonSeriesList.find(serie => serie.key == serieKey).nameSerie;
    }
    this.serie.parentSerieKey = serieKey;
  }

  save() {
    if (!this.serie.notLiked || this.serie.statusId !== 3) { this.serie.notLiked = false; }
    if (this.serie.key) {
      this.serieService.update(this.serie.key, this.serie);
      Swal.fire(
        'Serie data has been updated successfully',
        '',
        'success'
      )
    } else {
      if (this.arraySeries[0].numRefSerie) this.serie.numRefSerie = this.arraySeries[0].numRefSerie + 1;
      if (!this.serie.isFirst) this.serie.isFirst = false;

      this.serieService.create(this.serie);
      Swal.fire(
        'New Serie added successfully',
        '',
        'success'
      )
    }
    this.close();
  }

  onFileChanged(event: any) {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {
      if (this.selectedFile.size > 1024 * 1024) {
        Swal.fire(
          'File too large for Firestore. Max 1 MB!',
          '',
          'warning'
        )
        return;
      }

      // Start simulated progress
      this.progressValue.next(0);
      let progress = 0;
      const interval = setInterval(() => {
        if (progress < 90) {
          progress += 10;
          this.progressValue.next(progress);
        }
      }, 100);

      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const fileData = e.target.result.split(',')[1]; // get Base64 part
        try {
          await this.firestore.collection('PicturesSeries').add({
            name: this.selectedFile.name,
            content: fileData,
            type: this.selectedFile?.type,
            uploadedAt: this.datePipe.transform(new Date(), 'dd/MM/yyyy HH:mm'),
            url: `data:${this.selectedFile?.type};base64,${fileData}`
          });
          this.progressValue.next(100);
          clearInterval(interval);
          this.serie.imageUrl = `data:${this.selectedFile?.type};base64,${fileData}`;
          Swal.fire(
            'Picture has been uploaded successfully!',
            '',
            'success'
          )
        } catch (err) {
          console.error(err);
          clearInterval(interval);
          this.progressValue.next(null);
          alert('Error uploading file!');
        }
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.serie.imageUrl = '';
    }
  }

  getErrorMessage() {
    return this.formControl.hasError('required') ? 'Required field' : '';
  }

  close() {
    this.dialogRef.close();
  }

}