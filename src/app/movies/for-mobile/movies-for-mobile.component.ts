import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import * as moment from 'moment';

import { MovieDetailsWithPartsMobileComponent } from './movie-details-with-parts-mobile/movie-details-with-parts-mobile.component';
import { MovieFormMobileComponent } from './movie-form-mobile/movie-form-mobile.component';

import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { MovieService } from '../../shared/services/movie.service';
import { UsersListService } from '../../shared/services/list-users.service';

import { Movie, StatusMovies } from '../../shared/models/movie.model';

@Component({
  selector: 'movies-for-mobile',
  templateUrl: './movies-for-mobile.component.html',
  styleUrls: ['./movies-for-mobile.scss']
})

export class MoviesForMobileComponent implements OnInit, OnDestroy {

  moviesList: Movie[] = [];
  moviesListCopie: Movie[] = [];
  allMovies: Movie[] = [];
  listPartsByParentFilmKey: Movie[] = [];

  p = 1;

  movieName = '';
  statusId: number;
  sortByDesc = true;
  optionSelected: number;
  nbrMoviesToCheckToday = 0;
  nbrMoviesNotChecked = 0;
  showMoviesNotChecked = false;

  subscriptionForGetAllMovies: Subscription;
  subscriptionForGetAllMoviesForSelect: Subscription;
  subscriptionForGetAllMoviesNotChecked: Subscription;

  statusMovies: StatusMovies[] = [
    { id: 1, status: 'On hold' },
    { id: 2, status: 'Not yet downloaded' },
    { id: 3, status: 'Watched' },
    { id: 4, status: 'Downloaded but not yet watched' },
    { id: 5, status: 'Will be looked for' }
  ];

  constructor(
    private movieService: MovieService,
    public userService: UserService,
    public usersListService: UsersListService,
    public authService: AuthService,
    public dialogService: MatDialog,
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.getAllMovies();
    this.getAllMoviesForSelect();
    this.getAllMoviesNotChecked();
  }

  getAllMovies() {
    this.subscriptionForGetAllMovies = this.movieService
      .getAll()
      .subscribe((movies: Movie[]) => {
        this.moviesListCopie = movies.sort((n1, n2) => n2.numRefMovie - n1.numRefMovie);
        this.allMovies = movies;

        if (this.movieName) {
          this.moviesList = movies.filter(movie => (movie.nameMovie.toLowerCase().includes(this.movieName.toLowerCase()) && (movie.isFirst == true)));
          this.moviesList = this.moviesList.sort((n1, n2) => n2.numRefMovie - n1.numRefMovie);
        }

        else if (this.statusId) {

          if (this.showMoviesNotChecked) this.showMoviesNotChecked = false;

          if (this.statusId == 1) {
            if (this.optionSelected) {
              if (this.optionSelected == 1) {
                this.moviesList = movies.filter(movie => movie.statusId == this.statusId && !movie.checkDate);
              }
              else {
                this.moviesList = movies.filter(movie => movie.statusId == this.statusId && movie.checkDate && movie.checkDate == moment().format('YYYY-MM-DD'));
              }
            }
            else {
              this.moviesList = movies.filter(movie => movie.statusId == this.statusId);
            }
          }

          else {
            if (this.optionSelected) this.optionSelected = null;
            this.moviesList = movies.filter(movie => movie.statusId == this.statusId);
          }

          this.moviesList = this.statusId == 1 || this.statusId == 3 ? this.moviesList.sort((n1, n2) => n2.numRefMovie - n1.numRefMovie) : this.moviesList.sort((n1, n2) => n1.numRefMovie - n2.numRefMovie);
        }

        else if (this.showMoviesNotChecked) {
          this.moviesList = movies.filter(movie => movie.statusId == 1 && movie.checkDate && movie.checkDate < moment().format('YYYY-MM-DD'));
          this.moviesList = this.moviesList.sort((n1, n2) => n2.numRefMovie - n1.numRefMovie);
        }

        else this.moviesList = movies.filter(movie => movie.isFirst == true).sort((n1, n2) => n2.numRefMovie - n1.numRefMovie);
      });
  }

  getAllMoviesForSelect() {
    this.subscriptionForGetAllMoviesForSelect = this.movieService
      .getAll()
      .subscribe((movies: Movie[]) => {
        this.nbrMoviesToCheckToday = movies.filter(movie => movie.statusId == 1 && movie.checkDate && movie.checkDate == moment().format('YYYY-MM-DD')).length;
        this.cdRef.detectChanges();
      })
  }

  getAllMoviesNotChecked() {
    this.subscriptionForGetAllMoviesNotChecked = this.movieService
      .getAll()
      .subscribe((movies: Movie[]) => {
        this.nbrMoviesNotChecked = movies.filter(movie => movie.statusId == 1 && movie.checkDate && movie.checkDate < moment().format('YYYY-MM-DD')).length;
        this.cdRef.detectChanges();
      })
  }

  OnPageChange(elem: HTMLElement) {
    elem.scrollIntoView();
  }

  showDetailsMovie(movieSelected: Movie) {
    this.listPartsByParentFilmKey = this.allMovies
      .filter(movie => (movie.key == movieSelected.key) || (movie.parentFilmKey == movieSelected.key))
      .sort((n1, n2) => n1.priority - n2.priority);

    const dialogRef = this.dialogService.open(MovieDetailsWithPartsMobileComponent, {
      width: '98vw',
      height: '75vh',
      maxWidth: '100vw'
    });
    dialogRef.componentInstance.movie = movieSelected;
    dialogRef.componentInstance.allMovies = this.allMovies;
    dialogRef.componentInstance.listPartsByParentFilmKey = this.listPartsByParentFilmKey;
  }

  newMovie() {
    const dialogRef = this.dialogService.open(MovieFormMobileComponent, {
      width: '98vw',
      height: '75vh',
      maxWidth: '100vw',
      data: { movie: {} }
    });
    dialogRef.componentInstance.arrayMovies = this.moviesListCopie;
    dialogRef.componentInstance.allMovies = this.allMovies;
  }

  editMovie(movie?: Movie) {
    const dialogRef = this.dialogService.open(MovieFormMobileComponent, {
      width: '98vw',
      height: '75vh',
      maxWidth: '100vw'
    });
    dialogRef.componentInstance.movie = movie;
    dialogRef.componentInstance.allMovies = this.allMovies;
  }

  deleteMovie(movieKey: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this movie!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.movieService.delete(movieKey);
        Swal.fire(
          'Movie has been deleted successfully',
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

  viewNote(movieNote: string) {
    Swal.fire({
      text: movieNote,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Close'
    });
  }

  ngOnDestroy() {
    this.subscriptionForGetAllMovies.unsubscribe();
    this.subscriptionForGetAllMoviesForSelect.unsubscribe();
    this.subscriptionForGetAllMoviesNotChecked.unsubscribe();
  }

}