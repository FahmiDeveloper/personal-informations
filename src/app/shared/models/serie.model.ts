export class Serie {

  key: string;
  nameSerie: string;
  note: string;
  imageUrl: string;
  statusId: number;
  checkDate: string;
  path: string;
  numRefSerie: number;
  currentEpisode: number;
  totalEpisodes: number;
  season: number;
  priority: number;
  isFirst: boolean;
  year: number;
  parentSerieKey: string;
  notLiked: boolean;

  constructor(){
    this.nameSerie = '';
    this.checkDate = '';
    this.note = '';
    this.imageUrl = '';
    this.statusId = null;
    this.path = '';
  }
  
}

export interface StatusSeries {
  id: number,
  status: string
}