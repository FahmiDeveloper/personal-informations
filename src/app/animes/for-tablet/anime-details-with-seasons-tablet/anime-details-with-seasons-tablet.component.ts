import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuTrigger } from '@angular/material/menu';

import Swal from 'sweetalert2';

import { AnimeFormTabletComponent } from '../anime-form-tablet/anime-form-tablet.component';

import { AnimeService } from 'src/app/shared/services/anime.service';

import { Anime, StatusAnimes } from 'src/app/shared/models/anime.model';

@Component({
  selector: 'anime-details-with-seasons-tablet',
  templateUrl: './anime-details-with-seasons-tablet.component.html',
  styleUrls: ['./anime-details-with-seasons-tablet.scss']
})

export class AnimeDetailsWithSeasonsTabletComponent implements OnInit {

  listSeasonsByParentAnimeKey: Anime[];
  allAnimes: Anime[];

  anime: Anime = new Anime();

  orientation = '';
  currMonthName: string;

  statusAnimes: StatusAnimes[] = [
    { id: 1, status: 'On hold' },
    { id: 2, status: 'Not yet downloaded' },
    { id: 3, status: 'Watched' },
    { id: 4, status: 'Downloaded but not yet watched' },
    { id: 5, status: 'Will be looked for' }
  ];

  monthsList = [
    { monthNbr: 1, monthName: 'January' },
    { monthNbr: 2, monthName: 'February' },
    { monthNbr: 3, monthName: 'March' },
    { monthNbr: 4, monthName: 'April' },
    { monthNbr: 5, monthName: 'May' },
    { monthNbr: 6, monthName: 'June' },
    { monthNbr: 7, monthName: 'July' },
    { monthNbr: 8, monthName: 'August' },
    { monthNbr: 9, monthName: 'September' },
    { monthNbr: 10, monthName: 'October' },
    { monthNbr: 11, monthName: 'November' },
    { monthNbr: 12, monthName: 'December' }
  ];

  menuTopLeftPosition = { x: '0', y: '0' }

  @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger: MatMenuTrigger;

  constructor(
    private animeService: AnimeService,
    public dialogRef: MatDialogRef<AnimeDetailsWithSeasonsTabletComponent>,
    public dialogService: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    if (window.innerHeight > window.innerWidth) {
      this.orientation = 'Portrait';
    } else {
      this.orientation = 'Landscape';
    }

    window.matchMedia("(orientation: portrait)").addEventListener("change", e => {
      const portrait = e.matches;

      if (portrait) {
        this.orientation = 'Portrait';
      } else {
        this.orientation = 'Landscape';
      }

    });
  }

  editAnime(anime?: Anime) {
    const dialogRef = this.dialogService.open(AnimeFormTabletComponent, { width: '500px' });
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

  copyText(event: MouseEvent, text: string) {
    event.stopPropagation();
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

  viewNote(animeNote: string) {
    Swal.fire({
      text: animeNote,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Close'
    });
  }

  viewCheckDate(animeCheckDate: string) {
    this.currMonthName = '';
    var d = new Date(animeCheckDate);
    this.currMonthName = this.monthsList.find(month => month.monthNbr == d.getMonth() + 1).monthName;
    var datestring = d.getDate() + " " + this.currMonthName + " " + d.getFullYear();
    Swal.fire({
      text: datestring,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Close'
    });
  }

  followLink(path: string) {
    window.open(path);
  }

  openMenuTrigger(event: MouseEvent, anime: Anime) {
    // preventDefault avoids to show the visualization of the right-click menu of the browser 
    event.preventDefault();

    // we record the mouse position in our object 
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';

    // we open the menu 
    // we pass to the menu the information about our object 
    this.matMenuTrigger.menuData = { anime: anime };

    // we open the menu 
    this.matMenuTrigger.openMenu();
  }

  viewEpisodes(anime: Anime) {
    if (anime.currentEpisode && anime.totalEpisodes) {
      var animeEpisodes = anime.currentEpisode + " / " + anime.totalEpisodes;
    } else if (anime.currentEpisode && !anime.totalEpisodes) {
      var animeEpisodes = anime.currentEpisode + " / " + '?';
    } else if (!anime.currentEpisode && anime.totalEpisodes) {
      var animeEpisodes = '?' + " / " + anime.totalEpisodes;
    } else {
      var animeEpisodes = '?' + " / " + '?';
    }
    Swal.fire({
      text: animeEpisodes,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Close'
    });
  }

  close() {
    this.dialogRef.close();
  }

}