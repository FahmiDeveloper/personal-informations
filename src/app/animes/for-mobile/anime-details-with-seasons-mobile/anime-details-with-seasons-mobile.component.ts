import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import Swal from 'sweetalert2';
import { DeviceDetectorService } from 'ngx-device-detector';

import { AnimeFormMobileComponent } from '../anime-form-mobile/anime-form-mobile.component';

import { AnimeService } from 'src/app/shared/services/anime.service';

import { Anime, StatusAnimes } from 'src/app/shared/models/anime.model';

@Component({
  selector: 'anime-details-with-seasons-mobile',
  templateUrl: './anime-details-with-seasons-mobile.component.html',
  styleUrls: ['./anime-details-with-seasons-mobile.scss']
})

export class AnimeDetailsWithSeasonsMobileComponent implements OnInit {

  listSeasonsByParentAnimeKey: Anime[];
  allAnimes: Anime[];

  anime: Anime = new Anime();

  isDesktop = false;

  statusAnimes: StatusAnimes[] = [
    { id: 1, status: 'On hold' },
    { id: 2, status: 'Not yet downloaded' },
    { id: 3, status: 'Watched' },
    { id: 4, status: 'Downloaded but not yet watched' },
    { id: 5, status: 'Will be looked for' }
  ];

  constructor(
    private animeService: AnimeService,
    public dialogRef: MatDialogRef<AnimeDetailsWithSeasonsMobileComponent>,
    public dialogService: MatDialog,
    private deviceService: DeviceDetectorService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.isDesktop = this.deviceService.isDesktop();
  }

  editAnime(anime?: Anime) {
    const dialogRef = this.dialogService.open(AnimeFormMobileComponent, {
      width: '98vw',
      height: '70vh',
      maxWidth: '100vw'
    });
    dialogRef.componentInstance.anime = anime;
    dialogRef.componentInstance.allAnimes = this.allAnimes;
  }

  deleteAnime(animeKey) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this anime!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.animeService.delete(animeKey);
        this.listSeasonsByParentAnimeKey.forEach((anime, index) => {
          if (anime.key === animeKey) this.listSeasonsByParentAnimeKey.splice(index, 1);
        });
        if (this.listSeasonsByParentAnimeKey.length == 0) {
          this.dialogRef.close();
        }
        else {
          this.anime = this.listSeasonsByParentAnimeKey[0];
        }
        Swal.fire(
          'Anime has been deleted successfully',
          '',
          'success'
        )
      }
    })
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

  viewNote(movieNote: string) {
    Swal.fire({
      text: movieNote,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Close'
    });
  }

  followLink(path: string) {
    window.open(path);
  }

  getTruncatedNameAnime(value: string, limit: number): string {
    if (!value) {
      return '';
    }
    return value.length > limit ? value.substring(0, limit) + '...' : value;
  }

  viewFullNameAnime(animeName: string) {
    Swal.fire({
      text: animeName,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Close'
    });
  }

  close() {
    this.dialogRef.close();
  }

}