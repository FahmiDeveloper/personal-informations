import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';

import Swal from 'sweetalert2';

import { MovieService } from 'src/app/shared/services/movie.service';

import { Movie, StatusMovies } from 'src/app/shared/models/movie.model';

@Component({
  selector: 'movie-form-tablet',
  templateUrl: './movie-form-tablet.component.html',
  styleUrls: ['./movie-form-tablet.scss'],
  providers: [DatePipe]
})

export class MovieFormTabletComponent implements OnInit {

  arrayMovies: Movie[];
  partMoviesList: Movie[] = [];
  allMovies: Movie[];

  movie: Movie = new Movie();

  parentFilmName: string;

  basePath = '/PicturesMovies';
  progressValue = new BehaviorSubject<number | null>(null);
  selectedFile: File | null = null;

  formControl = new FormControl('', [Validators.required]);

  statusMovies: StatusMovies[] = [
    { id: 1, status: 'On hold' },
    { id: 2, status: 'Not yet downloaded' },
    { id: 3, status: 'Watched' },
    { id: 4, status: 'Downloaded but not yet watched' },
    { id: 5, status: 'Will be looked for' }
  ];

  constructor(
    private movieService: MovieService,
    public dialogRef: MatDialogRef<MovieFormTabletComponent>,
    public dialogService: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: Movie[],
    private firestore: AngularFirestore,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.partMoviesList = this.allMovies
      .filter(movie => movie.isFirst == true && movie.part && movie.part == 1)
      .sort((n1, n2) => n2.numRefMovie - n1.numRefMovie);

    if (this.movie.key) {
      if (this.partMoviesList.find(movie => movie.key == this.movie.parentFilmKey)) {
        this.parentFilmName = this.partMoviesList.find(movie => movie.key == this.movie.parentFilmKey).nameMovie;
      }
    }
  }

  filterByParentName(event: Event) {
    const input = event.target as HTMLInputElement;
    const movieName = input.value;

    if (movieName) {
      this.partMoviesList = this.allMovies
        .filter(movie =>
          movie.nameMovie.toLowerCase().includes(movieName.toLowerCase()) &&
          movie.isFirst == true &&
          movie.part &&
          movie.part == 1
        )
        .sort((n1, n2) => n2.numRefMovie - n1.numRefMovie);
    } else {
      this.partMoviesList = this.allMovies
        .filter(movie => movie.isFirst == true && movie.part && movie.part == 1)
        .sort((n1, n2) => n2.numRefMovie - n1.numRefMovie);
    }
  }

  getParentFilmKey(movieKey: string) {
    if (this.partMoviesList.find(movie => movie.key == movieKey)) {
      this.parentFilmName = this.partMoviesList.find(movie => movie.key == movieKey).nameMovie;
    }
    this.movie.parentFilmKey = movieKey;
  }

  save() {
    if (!this.movie.notLiked || this.movie.statusId !== 3) { this.movie.notLiked = false; }
    if (this.movie.key) {
      this.movieService.update(this.movie.key, this.movie);
      Swal.fire(
        'Movie data has been updated successfully',
        '',
        'success'
      )
    } else {
      if (this.arrayMovies[0].numRefMovie) this.movie.numRefMovie = this.arrayMovies[0].numRefMovie + 1;
      if (!this.movie.isFirst) this.movie.isFirst = false;

      this.movieService.create(this.movie);
      Swal.fire(
        'New Movie added successfully',
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
          await this.firestore.collection('PicturesMovies').add({
            name: this.selectedFile.name,
            content: fileData,
            type: this.selectedFile?.type,
            uploadedAt: this.datePipe.transform(new Date(), 'dd/MM/yyyy HH:mm'),
            url: `data:${this.selectedFile?.type};base64,${fileData}`
          });
          this.progressValue.next(100);
          clearInterval(interval);
          this.movie.imageUrl = `data:${this.selectedFile?.type};base64,${fileData}`;
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
      this.movie.imageUrl = '';
    }
  }

  getErrorMessage() {
    return this.formControl.hasError('required') ? 'Required field' : '';
  }

  close() {
    this.dialogRef.close();
  }

}