import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuTrigger } from '@angular/material/menu';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import moment from 'moment';

import { MoviePartsForDesktopComponent } from './movie-parts-for-desktop/movie-parts-for-desktop.component';
import { MovieFormForDesktopComponent } from './movie-form-for-desktop/movie-form-for-desktop.component';

import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { MovieService } from '../../shared/services/movie.service';
import { UsersListService } from '../../shared/services/list-users.service';

import { Movie, StatusMovies } from '../../shared/models/movie.model';

@Component({
  selector: 'movies-for-desktop',
  templateUrl: './movies-for-desktop.component.html',
  styleUrls: ['./movies-for-desktop.scss']
})

export class MoviesForDesktopComponent implements OnInit, OnDestroy {

  moviesList: Movie[] = [];
  moviesListCopie: Movie[] = [];
  allMovies: Movie[] = [];
  listPartsByParentMovieKey: Movie[] = [];
  duplicatedMoviesList: Movie[] = [];
  p = 1;
  movieName = '';
  statusId: number;
  optionSelected: number;
  dislike = false;
  nbrMoviesToCheckToday = 0;
  nbrMoviesNotChecked = 0;
  nbrDuplicatedMovies = 0;
  showMoviesNotChecked = false;
  showDuplicatedMovies = false;
  itemsPerPage: number;
  loading = true;

  menuTopLeftPosition = { x: '0', y: '0' }

  @ViewChild('menuTrigger') matMenuTrigger!: MatMenuTrigger;

  subForGetAllMovies: Subscription;
  subForGetAllMoviesForSelect: Subscription;
  subForGetAllMoviesNotChecked: Subscription;
  subForGetAllDupMovies: Subscription;

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
    this.itemsPerPage = window.innerWidth <= 1366 ? 15 : 16;
    this.loading = true;
    this.getAllMovies();
    this.getAllMoviesForSelect();
    this.getAllMoviesNotChecked();
    this.getAllDuplicatedMovies();
  }

  getAllMovies() {
    this.subForGetAllMovies = this.movieService
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
            if (this.dislike) this.dislike = false;
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
            this.moviesList = this.moviesList.sort((n1, n2) => n2.numRefMovie - n1.numRefMovie);
          }
          else {
            if (this.optionSelected) this.optionSelected = null;
            if (this.statusId == 3) {
              if (this.dislike) {
                this.moviesList = movies.filter(movie => movie.statusId == this.statusId && movie.notLiked == true);
              }
              else {
                this.moviesList = movies.filter(movie => movie.statusId == this.statusId);
              }
            }
            else {
              if (this.dislike) this.dislike = false;
              this.moviesList = movies.filter(movie => movie.statusId == this.statusId);
            }
            this.moviesList = this.statusId == 3 ? this.moviesList.sort((n1, n2) => n2.numRefMovie - n1.numRefMovie) : this.moviesList.sort((n1, n2) => n1.numRefMovie - n2.numRefMovie);
          }
        }

        else if (this.showMoviesNotChecked) {
          this.moviesList = movies.filter(movie => movie.statusId == 1 && movie.checkDate && movie.checkDate < moment().format('YYYY-MM-DD'));
          this.moviesList = this.moviesList.sort((n1, n2) => n2.numRefMovie - n1.numRefMovie);
        }

        else this.moviesList = movies.filter(movie => movie.isFirst == true).sort((n1, n2) => n2.numRefMovie - n1.numRefMovie);

        this.loading = false;
      });
  }

  getAllMoviesForSelect() {
    this.subForGetAllMoviesForSelect = this.movieService
      .getAll()
      .subscribe((movies: Movie[]) => {
        this.nbrMoviesToCheckToday = movies.filter(movie => movie.statusId == 1 && movie.checkDate && movie.checkDate == moment().format('YYYY-MM-DD')).length;
        this.cdRef.detectChanges();
      })
  }

  getAllMoviesNotChecked() {
    this.subForGetAllMoviesNotChecked = this.movieService
      .getAll()
      .subscribe((movies: Movie[]) => {
        this.nbrMoviesNotChecked = movies.filter(movie => movie.statusId == 1 && movie.checkDate && movie.checkDate < moment().format('YYYY-MM-DD')).length;
        this.cdRef.detectChanges();
      })
  }

  getAllDuplicatedMovies() {
    this.moviesList = [];
    this.duplicatedMoviesList = [];
    this.nbrDuplicatedMovies = 0;

    this.subForGetAllDupMovies = this.movieService.getAll().subscribe((movies: Movie[]) => {
      const defaultMovies = movies.filter(m => m.isFirst);
      const duplicatedResult = this.getDuplicatedMovies(defaultMovies);

      this.duplicatedMoviesList = duplicatedResult.list;
      this.nbrDuplicatedMovies = duplicatedResult.count;

      this.updateMoviesList();
      this.cdRef.detectChanges();
    });
  }

  getDuplicatedMovies(movies: Movie[]): { list: Movie[]; count: number } {
    const movieMap = new Map<string, Movie[]>();
    const result: Movie[] = [];
    let duplicationCount = 0;

    movies.forEach(movie => {
      const key = movie.nameMovie?.trim();

      if (!key) {
        return;
      }

      const list = movieMap.get(key) || [];
      list.push(movie);
      movieMap.set(key, list);
    });

    movieMap.forEach(list => {
      if (list.length > 1) {
        duplicationCount++;      // ✅ one duplicated movie group
        result.push(...list);    // duplicates stay together
      }
    });

    return { list: result, count: duplicationCount };
  }
  
  onDuplicatedToggle() {
    this.updateMoviesList();
  }

  updateMoviesList() {
    if (this.showDuplicatedMovies) {
      this.moviesList = this.duplicatedMoviesList;
      this.moviesList = this.moviesList.sort((a, b) => {
        const nameCompare = a.nameMovie.localeCompare(b.nameMovie);

        if (nameCompare !== 0) return nameCompare; // group by name first

        return b.numRefMovie - a.numRefMovie; // then sort inside group
      });
    } else {
      this.getAllMovies();
    }
  }

  OnPageChange() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  showMovieParts(movieSelected: Movie) {
    this.listPartsByParentMovieKey = this.allMovies
      .filter(movie => (movie.key == movieSelected.key) || (movie.parentFilmKey == movieSelected.key))
      .sort((n1, n2) => n1.priority - n2.priority);

    const dialogRef = this.dialogService.open(MoviePartsForDesktopComponent, { width: '1150px' });
    dialogRef.componentInstance.movie = movieSelected;
    dialogRef.componentInstance.allMovies = this.allMovies;
    dialogRef.componentInstance.listPartsByParentMovieKey = this.listPartsByParentMovieKey;
  }

  newMovie() {
    const dialogRef = this.dialogService.open(MovieFormForDesktopComponent, { width: '500px', data: { movie: {} } });
    dialogRef.componentInstance.arrayMovies = this.moviesListCopie;
    dialogRef.componentInstance.allMovies = this.allMovies;
  }

  editMovie(movie?: Movie) {
    const dialogRef = this.dialogService.open(MovieFormForDesktopComponent, { width: '500px' });
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

  onRightClick(event: MouseEvent, movie: Movie) {
    // preventDefault avoids to show the visualization of the right-click menu of the browser 
    event.preventDefault();

    // we record the mouse position in our object 
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';

    // we open the menu 
    // we pass to the menu the information about our object 
    this.matMenuTrigger.menuData = { movie: movie };

    // we open the menu 
    this.matMenuTrigger.openMenu();
  }

  ngOnDestroy() {
    this.subForGetAllMovies.unsubscribe();
    this.subForGetAllMoviesForSelect.unsubscribe();
    this.subForGetAllMoviesNotChecked.unsubscribe();
    this.subForGetAllDupMovies.unsubscribe();
  }

}