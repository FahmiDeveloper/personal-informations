import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import moment from 'moment';

import { AnimeSeasonsForMobileComponent } from './anime-seasons-for-mobile/anime-seasons-for-mobile.component';
import { AnimeFormForMobileComponent } from './anime-form-for-mobile/anime-form-for-mobile.component';

import { AuthService } from 'src/app/shared/services/auth.service';
import { UserService } from 'src/app/shared/services/user.service';
import { AnimeService } from 'src/app/shared/services/anime.service';
import { UsersListService } from 'src/app/shared/services/list-users.service';

import { Anime, StatusAnimes } from 'src/app/shared/models/anime.model';

@Component({
  selector: 'animes-for-mobile',
  templateUrl: './animes-for-mobile.component.html',
  styleUrls: ['./animes-for-mobile.scss']
})

export class AnimesForMobileComponent implements OnInit, OnDestroy {

  animesList: Anime[] = [];
  animesListCopie: Anime[] = [];
  allAnimes: Anime[] = [];
  listSeasonsByParentAnimeKey: Anime[] = [];
  duplicatedAnimesList: Anime[] = [];
  p = 1;
  animeNameJap = '';
  animeNameEng = '';
  statusId: number;
  sortByDesc = true;
  optionSelected: number;
  dislike = false;
  nbrAnimesToCheckToday = 0;
  nbrDuplicatedAnimes = 0;
  nbrAnimesNotChecked = 0;
  showAnimesNotChecked = false;
  showDuplicatedAnimes = false;
  loading = true;

  subsForGetAllAnimes: Subscription;
  subsForGetAllAnimesForSelect: Subscription;
  subsForGetAllAnimesNotChecked: Subscription;
  subsForGetAllDuplicatedAnimes: Subscription;

  statusAnimes: StatusAnimes[] = [
    { id: 1, status: 'On hold' },
    { id: 2, status: 'Not yet downloaded' },
    { id: 3, status: 'Watched' },
    { id: 4, status: 'Downloaded but not yet watched' },
    { id: 5, status: 'Will be looked for' }
  ];

  constructor(
    private animeService: AnimeService,
    public userService: UserService,
    public usersListService: UsersListService,
    public authService: AuthService,
    public dialogService: MatDialog,
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loading = true;
    this.getAllAnimes();
    this.getAllAnimesForSelect();
    this.getAllAnimesNotChecked();
    this.getAllDuplicatedAnimes();
  }

  getAllAnimes() {
    this.subsForGetAllAnimes = this.animeService
      .getAll()
      .subscribe(animes => {
        this.animesListCopie = animes.sort((n1, n2) => n2.numRefAnime - n1.numRefAnime);
        this.allAnimes = animes;

        if (this.animeNameJap) {
          this.animesList = animes.filter(anime => (anime.nameAnime.toLowerCase().includes(this.animeNameJap.toLowerCase()) && (anime.isFirst == true)));
          this.animesList = this.animesList.sort((n1, n2) => n2.numRefAnime - n1.numRefAnime);
        }

        else if (this.animeNameEng) {
          this.animesList = animes.filter(anime => (anime.nameAnimeEng.toLowerCase().includes(this.animeNameEng.toLowerCase()) && (anime.isFirst == true)));
          this.animesList = this.animesList.sort((n1, n2) => n2.numRefAnime - n1.numRefAnime);
        }

        else if (this.statusId) {

          if (this.showAnimesNotChecked) this.showAnimesNotChecked = false;

          if (this.statusId == 1) {
            if (this.optionSelected) {
              if (this.optionSelected == 1) {
                this.animesList = animes.filter(anime => anime.statusId == this.statusId && !anime.checkDate);
              }
              else {
                this.animesList = animes.filter(anime => anime.statusId == this.statusId && anime.checkDate && anime.checkDate == moment().format('YYYY-MM-DD') &&
                  (!anime.currentEpisode || (anime.currentEpisode && !anime.totalEpisodes) || (anime.currentEpisode && anime.totalEpisodes && anime.currentEpisode < anime.totalEpisodes)));
              }
            }
            else {
              this.animesList = animes.filter(anime => anime.statusId == this.statusId);
            }
          }
          else {
            if (this.optionSelected) this.optionSelected = null;
            this.animesList = animes.filter(anime => anime.statusId == this.statusId);
          }

          this.animesList = this.statusId == 1 || this.statusId == 3 ? this.animesList.sort((n1, n2) => n2.numRefAnime - n1.numRefAnime) : this.animesList.sort((n1, n2) => n1.numRefAnime - n2.numRefAnime);
        }

        else if (this.showAnimesNotChecked) {
          this.animesList = animes.filter(anime => anime.statusId == 1 && anime.checkDate && anime.checkDate < moment().format('YYYY-MM-DD'));
          this.animesList = this.animesList.sort((n1, n2) => n2.numRefAnime - n1.numRefAnime);
        }

        else this.animesList = animes.filter(anime => anime.isFirst == true).sort((n1, n2) => n2.numRefAnime - n1.numRefAnime);

        this.animesList.forEach(anime => {
          this.checkIfAnimeHaveSeasons(anime);
        })
        this.loading = false;
      });
  }

  getAllAnimesForSelect() {
    this.subsForGetAllAnimesForSelect = this.animeService
      .getAll()
      .subscribe((animes: Anime[]) => {
        this.nbrAnimesToCheckToday = animes.filter(anime => anime.statusId == 1 && anime.checkDate && anime.checkDate == moment().format('YYYY-MM-DD') &&
          (!anime.currentEpisode || (anime.currentEpisode && !anime.totalEpisodes) || (anime.currentEpisode && anime.currentEpisode && anime.currentEpisode < anime.totalEpisodes))).length;
        this.cdRef.detectChanges();
      })
  }

  getAllAnimesNotChecked() {
    this.subsForGetAllAnimesNotChecked = this.animeService
      .getAll()
      .subscribe((animes: Anime[]) => {
        this.nbrAnimesNotChecked = animes.filter(anime => anime.statusId == 1 && anime.checkDate && anime.checkDate < moment().format('YYYY-MM-DD')).length;
        this.cdRef.detectChanges();
      })
  }

  getAllDuplicatedAnimes() {
    this.animesList = [];
    this.duplicatedAnimesList = [];
    this.nbrDuplicatedAnimes = 0;

    this.subsForGetAllDuplicatedAnimes = this.animeService.getAll().subscribe((animes: Anime[]) => {
      const defaultAnimes = animes.filter(a => a.isFirst);
      const duplicatedResult = this.getDuplicatedAnimes(defaultAnimes);

      this.duplicatedAnimesList = duplicatedResult.list;
      this.nbrDuplicatedAnimes = duplicatedResult.count;

      this.updateAnimesList();
      this.cdRef.detectChanges();
    });
  }

  getDuplicatedAnimes(animes: Anime[]): { list: Anime[]; count: number } {
    const animeMap = new Map<string, Anime[]>();
    const result: Anime[] = [];
    let duplicationCount = 0;

    animes.forEach(anime => {
      const key = anime.nameAnime && anime.nameAnime !== '-'? anime.nameAnime.trim() : anime.nameAnimeEng?.trim();
      if (!key) {
        return;
      }
      const list = animeMap.get(key) || [];
      list.push(anime);
      animeMap.set(key, list);
    });

    animeMap.forEach(list => {
      if (list.length > 1) {
        duplicationCount++;        // ✅ one duplicated group
        result.push(...list);      // keep copies together
      }
    });

    return { list: result, count: duplicationCount };
  }

  onDuplicatedToggle() {
    this.updateAnimesList();
  }

  updateAnimesList() {
    if (this.showDuplicatedAnimes) {
      this.animesList = this.duplicatedAnimesList;
      this.animesList = this.animesList.sort((a, b) => {
        const nameCompare = a.nameAnime.localeCompare(b.nameAnime);

        if (nameCompare !== 0) return nameCompare; // group by name first

        return b.numRefAnime - a.numRefAnime; // then sort inside group
      });
    } else {
      this.getAllAnimes();
    }
  }

  checkIfAnimeHaveSeasons(animeData: Anime) {
    if (this.allAnimes.filter(anime => anime.parentAnimeKey && anime.parentAnimeKey == animeData.key).length > 0) {
      animeData.haveSeasons = true;
    } else {
      animeData.haveSeasons = false;
    }
  }

  OnPageChange(elem: HTMLElement) {
    elem.scrollIntoView();
  }

  showDetailsAnime(animeSelected: Anime) {
    this.listSeasonsByParentAnimeKey = this.allAnimes
      .filter(anime => (anime.key == animeSelected.key) || (anime.parentAnimeKey == animeSelected.key))
      .sort((n1, n2) => n1.priority - n2.priority);

    const dialogRef = this.dialogService.open(AnimeSeasonsForMobileComponent, {
      width: '98vw',
      height: '75vh',
      maxWidth: '100vw'
    });
    dialogRef.componentInstance.anime = animeSelected;
    dialogRef.componentInstance.allAnimes = this.allAnimes;
    dialogRef.componentInstance.listSeasonsByParentAnimeKey = this.listSeasonsByParentAnimeKey;
  }

  newAnime() {
    const dialogRef = this.dialogService.open(AnimeFormForMobileComponent, {
      width: '98vw',
      height: '75vh',
      maxWidth: '100vw',
      data: { movie: {} }
    });
    dialogRef.componentInstance.arrayAnimes = this.animesListCopie;
    dialogRef.componentInstance.allAnimes = this.allAnimes;
  }

  editAnime(anime?: Anime) {
    const dialogRef = this.dialogService.open(AnimeFormForMobileComponent, {
      width: '98vw',
      height: '75vh',
      maxWidth: '100vw'
    });
    dialogRef.componentInstance.anime = anime;
    dialogRef.componentInstance.allAnimes = this.allAnimes;
  }

  deleteAnime(animeKey: string) {
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
        Swal.fire(
          'Anime has been deleted successfully',
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

  viewNote(animeNote: string) {
    Swal.fire({
      text: animeNote,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Close'
    });
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

  ngOnDestroy() {
    this.subsForGetAllAnimes.unsubscribe();
    this.subsForGetAllAnimesForSelect.unsubscribe();
    this.subsForGetAllAnimesNotChecked.unsubscribe();
    this.subsForGetAllDuplicatedAnimes.unsubscribe();
  }


}