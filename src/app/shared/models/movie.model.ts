export class Movie {

  key: string;
  nameMovie: string;
  note: string;
  imageUrl: string;
  statusId: number;
  checkDate: string;
  path: string;
  numRefMovie: number;
  year: number;
  part: number;
  priority: number;
  isFirst: boolean;
  parentFilmKey: string;
  notLiked: boolean;

  constructor(){
    this.nameMovie = '';
    this.checkDate = '';
    this.note = '';
    this.imageUrl = '';
    this.statusId = null;
    this.path = '';
    this.year = null;
  }
  
}

export interface StatusMovies {
  id: number,
  status: string
}