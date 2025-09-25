export class Anime {

  key: string;
  nameAnime: string;
  nameAnimeEng: string;
  note: string;
  imageUrl: string;
  statusId: number;
  checkDate: string;
  path: string;
  numRefAnime: number;
  currentEpisode: number;
  totalEpisodes: number;
  season: number;
  priority: number;
  type: string;
  isFirst: boolean;
  parentAnimeKey: string;
  notLiked: boolean;
  haveSeasons: boolean;
  year: number;

  constructor(){
    this.nameAnime = '';
    this.nameAnimeEng = '';
    this.checkDate = '';
    this.note = '';
    this.imageUrl = '';
    this.statusId = null;
    this.path = '';
  }
  
}

export interface StatusAnimes {
  id: number,
  status: string
}