import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';

import Swal from 'sweetalert2';

import { AnimeService } from 'src/app/shared/services/anime.service';

import { Anime, StatusAnimes } from 'src/app/shared/models/anime.model';

@Component({
  selector: 'anime-form-mobile',
  templateUrl: './anime-form-mobile.component.html',
  styleUrls: ['./anime-form-mobile.scss'],
  providers: [DatePipe]
})

export class AnimeFormMobileComponent implements OnInit {

  arrayAnimes: Anime[] = [];
  seasonAnimesListJap: Anime[] = [];
  seasonAnimesListEng: Anime[] = [];
  allAnimes: Anime[] = [];

  anime: Anime = new Anime();

  parentAnimeNameJap = '';
  parentAnimeNameEng = '';

  basePath = '/PicturesAnimes';
  progressValue = new BehaviorSubject<number | null>(null);
  selectedFile: File | null = null;

  formControl = new FormControl('', [Validators.required]);

  statusAnimes: StatusAnimes[] = [
    { id: 1, status: 'On hold' },
    { id: 2, status: 'Not yet downloaded' },
    { id: 3, status: 'Watched' },
    { id: 4, status: 'Downloaded but not yet watched' },
    { id: 5, status: 'Will be looked for' }
  ];

  constructor(
    private animeService: AnimeService,
    public dialogRef: MatDialogRef<AnimeFormMobileComponent>,
    public dialogService: MatDialog,
    private firestore: AngularFirestore,
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: Anime[]
  ) { }

  ngOnInit() {
    this.seasonAnimesListJap = this.allAnimes.filter(anime => anime.priority && anime.priority == 1 && anime.nameAnime !== '-').sort((n1, n2) => n2.numRefAnime - n1.numRefAnime);
    this.seasonAnimesListEng = this.allAnimes.filter(anime => anime.priority && anime.priority == 1 && anime.nameAnime == '-' && anime.nameAnimeEng !== '-').sort((n1, n2) => n2.numRefAnime - n1.numRefAnime);

    if (this.anime.key) {
      if (this.seasonAnimesListJap.find(anime => anime.key == this.anime.parentAnimeKey)) {
        this.parentAnimeNameJap = this.seasonAnimesListJap.find(anime => anime.key == this.anime.parentAnimeKey).nameAnime;
      }
      if (this.seasonAnimesListEng.find(anime => anime.key == this.anime.parentAnimeKey)) {
        this.parentAnimeNameEng = this.seasonAnimesListEng.find(anime => anime.key == this.anime.parentAnimeKey).nameAnimeEng;
      }
    }
  }

  filterByParentNameJap(event: Event) {
    const input = event.target as HTMLInputElement;
    const animeName = input.value;

    if (animeName) {
      this.seasonAnimesListJap = this.allAnimes
        .filter(anime =>
          anime.nameAnime.toLowerCase().includes(animeName.toLowerCase()) &&
          anime.priority &&
          anime.priority == 1 &&
          anime.nameAnime !== '-'
        )
        .sort((n1, n2) => n2.numRefAnime - n1.numRefAnime);
    } else {
      this.seasonAnimesListJap = this.allAnimes
        .filter(anime =>
          anime.priority &&
          anime.priority == 1 &&
          anime.nameAnime !== '-'
        )
        .sort((n1, n2) => n2.numRefAnime - n1.numRefAnime);
    }
  }

  filterByParentNameEng(event: Event) {
    const input = event.target as HTMLInputElement;
    const animeName = input.value;

    if (animeName) {
      this.seasonAnimesListEng = this.allAnimes
        .filter(anime =>
          anime.nameAnimeEng.toLowerCase().includes(animeName.toLowerCase()) &&
          anime.priority &&
          anime.priority == 1 &&
          anime.nameAnime === '-' &&
          anime.nameAnimeEng !== '-'
        )
        .sort((n1, n2) => n2.numRefAnime - n1.numRefAnime);
    } else {
      this.seasonAnimesListEng = this.allAnimes
        .filter(anime =>
          anime.priority &&
          anime.priority == 1 &&
          anime.nameAnime === '-' &&
          anime.nameAnimeEng !== '-'
        )
        .sort((n1, n2) => n2.numRefAnime - n1.numRefAnime);
    }
  }

  getParentAnimeKeyJap(animeKey: string) {
    if (this.seasonAnimesListJap.find(anime => anime.key == animeKey)) {
      this.parentAnimeNameJap = this.seasonAnimesListJap.find(anime => anime.key == animeKey).nameAnime;
    }
    this.anime.parentAnimeKey = animeKey;
  }

  getParentAnimeKeyEng(animeKey: string) {
    if (this.seasonAnimesListEng.find(anime => anime.key == animeKey)) {
      this.parentAnimeNameEng = this.seasonAnimesListEng.find(anime => anime.key == animeKey).nameAnimeEng;
    }
    this.anime.parentAnimeKey = animeKey;
  }

  save() {
    if (!this.anime.notLiked || this.anime.statusId !== 3) { this.anime.notLiked = false; }
    if (this.anime.key) {
      this.animeService.update(this.anime.key, this.anime);
      Swal.fire(
        'Anime data has been updated successfully',
        '',
        'success'
      )
    } else {
      if (this.arrayAnimes[0].numRefAnime) this.anime.numRefAnime = this.arrayAnimes[0].numRefAnime + 1;
      if (!this.anime.isFirst) this.anime.isFirst = false;

      this.animeService.create(this.anime);
      Swal.fire(
        'New Anime added successfully',
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
          await this.firestore.collection('PicturesAnimes').add({
            name: this.selectedFile.name,
            content: fileData,
            type: this.selectedFile?.type,
            uploadedAt: this.datePipe.transform(new Date(), 'dd/MM/yyyy HH:mm'),
            url: `data:${this.selectedFile?.type};base64,${fileData}`
          });
          this.progressValue.next(100);
          clearInterval(interval);
          this.anime.imageUrl = `data:${this.selectedFile?.type};base64,${fileData}`;
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
      this.anime.imageUrl = '';
    }
  }

  getErrorMessage() {
    return this.formControl.hasError('required') ? 'Required field' : '';
  }

  close() {
    this.dialogRef.close();
  }

}