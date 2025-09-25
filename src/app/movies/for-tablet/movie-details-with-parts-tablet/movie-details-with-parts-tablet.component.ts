import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import Swal from 'sweetalert2';

import { MovieFormTabletComponent } from '../movie-form-tablet/movie-form-tablet.component';

import { MovieService } from 'src/app/shared/services/movie.service';

import { Movie, StatusMovies } from 'src/app/shared/models/movie.model';

@Component({
  selector: 'movie-details-with-parts-tablet',
  templateUrl: './movie-details-with-parts-tablet.component.html',
  styleUrls: ['./movie-details-with-parts-tablet.scss']
})

export class MovieDetailsWithPartsTabletComponent implements OnInit {

  listPartsByParentFilmKey: Movie[];
  allMovies: Movie[];

  movie: Movie = new Movie();

  orientation = '';
  currMonthName: string;

  statusMovies: StatusMovies[] = [
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

  constructor(
    private movieService: MovieService,
    public dialogRef: MatDialogRef<MovieDetailsWithPartsTabletComponent>,
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

  editMovie(movie?: Movie) {
    const dialogRef = this.dialogService.open(MovieFormTabletComponent, { width: '500px' });
    dialogRef.componentInstance.movie = movie;
    dialogRef.componentInstance.allMovies = this.allMovies;
  }

  deleteMovie(movieId) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this movie!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.movieService.delete(movieId);
        this.listPartsByParentFilmKey.forEach((movie, index) => {
          if (movie.key === movieId) this.listPartsByParentFilmKey.splice(index, 1);
        });
        if (this.listPartsByParentFilmKey.length == 0) {
          this.dialogRef.close();
        }
        else {
          this.movie = this.listPartsByParentFilmKey[0];
        }
        Swal.fire(
          'Movie has been deleted successfully',
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

  viewCheckDate(movieCheckDate: string) {
    this.currMonthName = '';
    var d = new Date(movieCheckDate);
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

  close() {
    this.dialogRef.close();
  }

}