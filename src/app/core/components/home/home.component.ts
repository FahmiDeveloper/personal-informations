import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

import { DeviceDetectorService } from 'ngx-device-detector';

import { Subscription } from 'rxjs';
import * as moment from 'moment';

import { AnimeService } from 'src/app/shared/services/anime.service';
import { MovieService } from 'src/app/shared/services/movie.service';
import { SerieService } from 'src/app/shared/services/serie.service';
import { ExpirationService } from 'src/app/shared/services/expiration.service';
import { DebtService } from 'src/app/shared/services/debt.service';
import { ClockingService } from 'src/app/shared/services/clocking.service';
import { ReminderService } from 'src/app/shared/services/reminder.service';
import { TimeCheckingService } from 'src/app/time-checking.service';

import { Movie } from 'src/app/shared/models/movie.model';
import { Anime } from 'src/app/shared/models/anime.model';
import { Serie } from 'src/app/shared/models/serie.model';
import { Expiration } from 'src/app/shared/models/expiration.model';
import { Debt } from 'src/app/shared/models/debt.model';
import { Clocking } from 'src/app/shared/models/clocking.model';
import { Reminder } from 'src/app/shared/models/reminder.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit, OnDestroy {

  isDesktop = false;
  isTablet = false;
  isMobile = false;

  innerWidth: any;
  orientation = '';
  
  nbrMoviesToCheckToday = 0;
  nbrMoviesNotChecked = 0;

  nbrAnimesToCheckToday = 0;
  nbrAnimesNotChecked = 0;

  nbrSeriesToCheckToday = 0;
  nbrSeriesNotChecked = 0;

  contentsExpiredList: Expiration[] = [];
  contentsSoonToExpireList: Expiration[] = [];

  currentMonth = '';
  currentYear: number;
  sumClockingLate: number;
  monthForCalculTotalClockingLateAndRestVac = '';
  clockingsListForCalculTotalClockingLate: Clocking[] = []
  minutePartList: number[] = [];
  totalClockingLate = 0;
  totalClockingLateByHoursMinute = '';
  vacationLimitDays = 0;

  // debts variables
  totalInDebt = 0;
  totalOutDebt = 0;
  allDebts: Debt[] = [];
  totalInDebts = '';
  defaultTotalInDebts: number;
  customTotalInDebts: number;
  totalOutDebts = '';
  defaultTotalOutDebts: number;
  customTotalOutDebts: number;
  restInPocket = '';
  restInWallet = '';
  restInEnvelope = '';
  restInBox = '';
  restInPosteAccount = '';
  restInEnvTaxi = '';
  restInEnvInternet = '';
  restInEnvWaterElec = '';
  restInEnvBeinSports = '';
  restInEnvHomeLoc = '';
  restInEnvHomeSupp = '';
  totalInDebtsByByTimeToPay: string;
  customTotalInDebtsByTimeToPay: number;
  defaultTotalInDebtsByTimeToPay: number;
  totalInDebtsToPayThisMonth: string;
  totalInDebtsToPayNextMonth: string;
  totalInDebtsNotToPayForNow: string;
  defaultTotalInDebtsToPayThisMonth: number;
  customTotalInDebtsToPayThisMonth: number;
  defaultTotalInDebtsToPayNextMonth: number;
  customTotalInDebtsToPayNextMonth: number;
  defaultTotalInDebtsNotToPayForNow: number;
  customTotalInDebtsNotToPayForNow: number;
  totalInDebtsToGetThisMonth: string;
  customTotalInDebtsToGetThisMonth: number;
  defaultTotalInDebtsToGetThisMonth: number;
  totalOutDebtsToGetThisMonth: string;
  totalOutDebtsToGetNextMonth: string;
  customTotalInDebtsToGetNextMonth: number;
  defaultTotalInDebtsToGetNextMonth: number;
  totalOutDebtsNotToGetForNow: string;
  customTotalInDebtsNotToGetForNow: number;
  defaultTotalInDebtsNotToGetForNow: number;

  allReminders: Reminder[] = [];
  contentsRemindersTodayList: Reminder[] = [];
  contentsRemindersNotDoed: Reminder[] = [];

  subscriptionForGetAllMoviesToCheckToday: Subscription;
  subscriptionForGetAllMoviesNotChecked: Subscription;

  subscriptionForGetAllAnimesToCheckToday: Subscription;
  subscriptionForGetAllAnimesNotChecked: Subscription;

  subscriptionForGetAllSeriesToCheckToday: Subscription;
  subscriptionForGetAllSeriesNotChecked: Subscription;

  subscriptionForGetAllContentsExpired: Subscription;

  subscriptionForGetAllDebts: Subscription;

  subscriptionForGetAllClockings: Subscription;

  subscriptionForGetAllReminders: Subscription;

  constructor(
    private movieService: MovieService,
    private animeService: AnimeService,
    private serieService: SerieService,
    public expirationService: ExpirationService,
    private debtService: DebtService,
    public clockingService: ClockingService,
    public reminderService: ReminderService, 
    private timeCheckingService: TimeCheckingService,
    private deviceService: DeviceDetectorService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isDesktop = this.deviceService.isDesktop();
    this.isTablet = this.deviceService.isTablet();
    this.isMobile = this.deviceService.isMobile();
    
    this.innerWidth = window.innerWidth;

    if(window.innerHeight > window.innerWidth){
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
    
    const d = new Date();
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    this.currentMonth = months[d.getMonth()];
    this.currentYear = d.getFullYear();

    if ((months[d.getMonth()] == 'October') || (months[d.getMonth()] == 'November') || (months[d.getMonth()] == 'December')) 
    {this.monthForCalculTotalClockingLateAndRestVac  = String(d.getMonth()+ 1);}
    else {this.monthForCalculTotalClockingLateAndRestVac  = '0' + String(d.getMonth()+ 1);}

    this.getAllMoviesToCheckToday();
    this.getAllMoviesNotChecked();

    this.getAllAnimesToCheckToday();
    this.getAllAnimesNotChecked();

    this.getAllSeriesToCheckToday();
    this.getAllSeriesNotChecked();

    this.getAllContentsExpired();

    this.getAllDebtsStatistics();

    this.getAllClockings();

    this.getAllReminders();
    this.sendRemindersForChecking();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = window.innerWidth;
  }

  getClass() {
    return this.innerWidth < 925 ? 'row-md' : 'row'; 
  }

  getAllMoviesToCheckToday() {
    this.subscriptionForGetAllMoviesToCheckToday = this.movieService
    .getAll()
    .subscribe((movies: Movie[]) => {
      this.nbrMoviesToCheckToday = movies.filter(movie => movie.statusId == 1 && movie.checkDate && movie.checkDate == moment().format('YYYY-MM-DD')).length;
    })
  }

  getAllMoviesNotChecked() {
    this.subscriptionForGetAllMoviesNotChecked = this.movieService
    .getAll()
    .subscribe((movies: Movie[]) => {
      this.nbrMoviesNotChecked = movies.filter(movie => movie.statusId == 1 && movie.checkDate && movie.checkDate < moment().format('YYYY-MM-DD')).length;
    })
  }

  getAllAnimesToCheckToday() {
    this.subscriptionForGetAllAnimesToCheckToday = this.animeService
    .getAll()
    .subscribe((animes: Anime[]) => {
      this.nbrAnimesToCheckToday = animes.filter(anime => anime.statusId == 1 && anime.checkDate && anime.checkDate == moment().format('YYYY-MM-DD') &&
      (!anime.currentEpisode || (anime.currentEpisode && !anime.totalEpisodes) || (anime.currentEpisode && anime.currentEpisode && anime.currentEpisode < anime.totalEpisodes))).length;    
    })
  }

  getAllAnimesNotChecked() {
    this.subscriptionForGetAllAnimesNotChecked = this.animeService
    .getAll()
    .subscribe((animes: Anime[]) => {
      this.nbrAnimesNotChecked = animes.filter(anime => anime.statusId == 1 && anime.checkDate && anime.checkDate < moment().format('YYYY-MM-DD')).length;
    })
  }

  getAllSeriesToCheckToday() {
    this.subscriptionForGetAllSeriesToCheckToday = this.serieService
    .getAll()
    .subscribe((series: Serie[]) => {
      this.nbrSeriesToCheckToday = series.filter(serie => serie.statusId == 1 && serie.checkDate && serie.checkDate == moment().format('YYYY-MM-DD') &&
      (!serie.currentEpisode || (serie.currentEpisode && !serie.totalEpisodes) || (serie.currentEpisode && serie.currentEpisode && serie.currentEpisode < serie.totalEpisodes))).length;
    })
  }

  getAllSeriesNotChecked() {
    this.subscriptionForGetAllSeriesNotChecked = this.serieService
    .getAll()
    .subscribe((series: Serie[]) => {
      this.nbrSeriesNotChecked = series.filter(serie => serie.statusId == 1 && serie.checkDate && serie.checkDate < moment().format('YYYY-MM-DD')).length;
    })
  }

  getAllContentsExpired() {
    this.subscriptionForGetAllContentsExpired = this.expirationService
    .getAll()
    .subscribe((expirations: Expiration[]) => {

      this.contentsExpiredList = [];
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // set to 00:00:00

      expirations.forEach(expiration => {
        const expDate = new Date(expiration.dateExpiration);
        const expirationDate = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate()); // 00:00:00

        const diffMs = expirationDate.getTime() - today.getTime(); // difference in ms
        const diffInDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        const absDays = Math.abs(diffInDays);
        const years = Math.floor(absDays / 365);
        const months = Math.floor((absDays % 365) / 30);
        const days = (absDays % 365) % 30;

        expiration.restdays = `${years}Y ${months}M ${days}D`;

        if (now > expirationDate || expiration.restdays == 0 + "Y " + 0 + "M " + 0 + "D") {
          this.contentsExpiredList.push(expiration);
        }

        if (now < expirationDate && years == 0 && months == 0 && days >= 1 && days <= 3) {
          this.contentsSoonToExpireList.push(expiration);
        }

      })        
    });
  }

  getAllDebtsStatistics() {
    this.subscriptionForGetAllDebts = this.debtService
    .getAll()
    .subscribe(debts => {
      this.allDebts = debts;
      this.getRestMoneyForeachPlace();
      this.getRestMoneyForeachEnvelope();
      this.getTotalIntDebts();
      this.getTotalOutDebts();
      this.getTotalInDebtsToPayThisMonth();
      this.getTotalInDebtsToPayNextMonth();
      this.getTotalInDebtsNotToPayForNow();
      this.getTotalOutDebtsToGetThisMonth();
      this.getTotalOutDebtsToGetNextMonth();
      this.getTotalOutDebtsNotToGetForNow();
    });
  }

  getRestMoneyForeachPlace() {
    let debtForRestInPocket = this.allDebts.filter(debt => debt.placeId == 1).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInWallet = this.allDebts.filter(debt => debt.placeId == 2).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInBox = this.allDebts.filter(debt => debt.placeId == 4).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInPosteAccount = this.allDebts.filter(debt => debt.placeId == 6).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];

    this.restInPocket = debtForRestInPocket ? debtForRestInPocket.restMoney : '0DT';
    this.restInWallet = debtForRestInWallet ? debtForRestInWallet.restMoney : '0DT';
    this.restInBox = debtForRestInBox ? debtForRestInBox.restMoney : '0DT';
    this.restInPosteAccount = debtForRestInPosteAccount ? debtForRestInPosteAccount.restMoney : '0DT';
  }

  getRestMoneyForeachEnvelope() {
    let debtForRestInEnvTaxi = this.allDebts.filter(debt => debt.placeId == 3 && debt.envelopeId == 1).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInEnvInternet = this.allDebts.filter(debt => debt.placeId == 3 && debt.envelopeId == 2).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInEnvWaterElec = this.allDebts.filter(debt => debt.placeId == 3 && debt.envelopeId == 3).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInEnvBeinSports = this.allDebts.filter(debt => debt.placeId == 3 && debt.envelopeId == 4).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInEnvHomeLoc = this.allDebts.filter(debt => debt.placeId == 3 && debt.envelopeId == 5).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInEnvHomeSupp = this.allDebts.filter(debt => debt.placeId == 3 && debt.envelopeId == 6).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];

    this.restInEnvTaxi = debtForRestInEnvTaxi ? debtForRestInEnvTaxi.restMoney : '0DT';
    this.restInEnvInternet = debtForRestInEnvInternet ? debtForRestInEnvInternet.restMoney : '0DT';
    this.restInEnvWaterElec = debtForRestInEnvWaterElec ? debtForRestInEnvWaterElec.restMoney : '0DT';
    this.restInEnvBeinSports = debtForRestInEnvBeinSports ? debtForRestInEnvBeinSports.restMoney : '0DT';
    this.restInEnvHomeLoc = debtForRestInEnvHomeLoc ? debtForRestInEnvHomeLoc.restMoney : '0DT';
    this.restInEnvHomeSupp = debtForRestInEnvHomeSupp ? debtForRestInEnvHomeSupp.restMoney : '0DT';
  }

  getTotalIntDebts() { 
    this.defaultTotalInDebts = 0;
    this.customTotalInDebts = 0;
    this.totalInDebts = "";

    this.allDebts.filter(debt => debt.debtForPay == true).forEach(element => {
      if (element.financialDebt.indexOf("DT") !== -1) {
        element.financialInDebtWithConvert = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("DT"));
        element.financialInDebtWithConvert = element.financialInDebtWithConvert + '000';
      }
      if (element.financialDebt.indexOf("Mill") !== -1) {
        element.financialInDebtWithConvert = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("Mill"));
      }
      if (element.financialDebt.includes(".")){
        const composedFinancialDebt = element.financialDebt.split('.');
        if (composedFinancialDebt[0].indexOf("DT") !== -1) {
          element.firstPartComposedFinancialInDebt = composedFinancialDebt[0].substring(0, composedFinancialDebt[0].lastIndexOf("DT"));
          element.firstPartComposedFinancialInDebt = element.firstPartComposedFinancialInDebt + '000';
        }
        if (composedFinancialDebt[1].indexOf("Mill") !== -1) {
          element.secondPartComposedFinancialInDebt = composedFinancialDebt[1].substring(0, composedFinancialDebt[1].lastIndexOf("Mill"));
        }
        element.financialInDebtWithConvert = String(Number(element.firstPartComposedFinancialInDebt)+Number(element.secondPartComposedFinancialInDebt));
      }

      this.defaultTotalInDebts += Number(element.financialInDebtWithConvert);
      if (this.defaultTotalInDebts.toString().length > 4) {

        this.customTotalInDebts = this.defaultTotalInDebts / 1000;

        if (String(this.customTotalInDebts).includes(".")){
          const customTotalInDebts = String(this.customTotalInDebts).split('.');
          if (customTotalInDebts[1].length == 1) this.totalInDebts = customTotalInDebts[0] + "DT." + customTotalInDebts[1] + "00Mill";
          else if (customTotalInDebts[1].length == 2) this.totalInDebts = customTotalInDebts[0] + "DT." + customTotalInDebts[1] + "0Mill";
          else this.totalInDebts = customTotalInDebts[0] + "DT." + customTotalInDebts[1] + "Mill";
        } else {
          this.totalInDebts = String(this.customTotalInDebts) + "DT";
        }
      } else {
        this.totalInDebts = this.defaultTotalInDebts + "Mill";
      }
    }); 
  }

  getTotalOutDebts() {
    this.defaultTotalOutDebts = 0;
    this.customTotalOutDebts = 0;
    this.totalOutDebts = "";

    this.allDebts.filter(debt => debt.debtToGet == true).forEach(element => {
      if (element.financialDebt.indexOf("DT") !== -1) {
        element.financialOutDebtWithConvert = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("DT"));
        element.financialOutDebtWithConvert = element.financialOutDebtWithConvert + '000';
      }
      if (element.financialDebt.indexOf("Mill") !== -1) {
        element.financialOutDebtWithConvert = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("Mill"));
      }

      if (element.financialDebt.includes(".")){
        const composedFinancialDebt = element.financialDebt.split('.');
        if (composedFinancialDebt[0].indexOf("DT") !== -1) {
          element.firstPartComposedFinancialOutDebt = composedFinancialDebt[0].substring(0, composedFinancialDebt[0].lastIndexOf("DT"));
          element.firstPartComposedFinancialOutDebt = element.firstPartComposedFinancialOutDebt + '000';
        }
        if (composedFinancialDebt[1].indexOf("Mill") !== -1) {
          element.secondPartComposedFinancialOutDebt = composedFinancialDebt[1].substring(0, composedFinancialDebt[1].lastIndexOf("Mill"));
        }
        element.financialOutDebtWithConvert = String(Number(element.firstPartComposedFinancialOutDebt)+Number(element.secondPartComposedFinancialOutDebt));
      }

      this.defaultTotalOutDebts += Number(element.financialOutDebtWithConvert);

      if (this.defaultTotalOutDebts.toString().length > 4) {

        this.customTotalOutDebts = this.defaultTotalOutDebts / 1000;
        if (String(this.customTotalOutDebts).includes(".")){
          const customTotalOutDebts = String(this.customTotalOutDebts).split('.');
          if (customTotalOutDebts[1].length == 1) this.totalOutDebts = customTotalOutDebts[0] + "DT." + customTotalOutDebts[1] + "00Mill";
          else if (customTotalOutDebts[1].length == 2) this.totalOutDebts = customTotalOutDebts[0] + "DT." + customTotalOutDebts[1] + "0Mill";
          else this.totalOutDebts = customTotalOutDebts[0] + "DT." + customTotalOutDebts[1] + "Mill";
        } else {
          this.totalOutDebts = String(this.customTotalOutDebts) + "DT";
        }
      } else {
        this.totalOutDebts = this.defaultTotalOutDebts + "Mill";
      }
    });
  }

  getTotalInDebtsToPayThisMonth() {
    this.defaultTotalInDebtsToPayThisMonth = 0;
    this.customTotalInDebtsToPayThisMonth = 0;
    this.totalInDebtsToPayThisMonth = "";

    this.allDebts.filter(debt => (debt.debtForPay == true) && (debt.toPayThisMonth == true)).forEach(element => {

      if (element.financialDebt.indexOf("DT") !== -1) {
        element.debtWithConvertToPayThisMonth = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("DT"));
        element.debtWithConvertToPayThisMonth = element.debtWithConvertToPayThisMonth + '000';

      }
      if (element.financialDebt.indexOf("Mill") !== -1) {
        element.debtWithConvertToPayThisMonth = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("Mill"));

      }
      if (element.financialDebt.includes(".")){
        const composedDebtToPayThisMonth = element.financialDebt.split('.');
        if (composedDebtToPayThisMonth[0].indexOf("DT") !== -1) {
          element.firstPartComposedDebtWithConvertToPayThisMonth = composedDebtToPayThisMonth[0].substring(0, composedDebtToPayThisMonth[0].lastIndexOf("DT"));
          element.firstPartComposedDebtWithConvertToPayThisMonth = element.firstPartComposedDebtWithConvertToPayThisMonth + '000';
        }
        if (composedDebtToPayThisMonth[1].indexOf("Mill") !== -1) {
          element.secondPartComposedDebtWithConvertToPayThisMonth = composedDebtToPayThisMonth[1].substring(0, composedDebtToPayThisMonth[1].lastIndexOf("Mill"));
        }
        element.debtWithConvertToPayThisMonth = String(Number(element.firstPartComposedDebtWithConvertToPayThisMonth)+Number(element.secondPartComposedDebtWithConvertToPayThisMonth));

      }

      this.defaultTotalInDebtsToPayThisMonth += Number(element.debtWithConvertToPayThisMonth);


      if (this.defaultTotalInDebtsToPayThisMonth.toString().length > 4) {

        this.customTotalInDebtsToPayThisMonth = this.defaultTotalInDebtsToPayThisMonth / 1000;

        if (String(this.customTotalInDebtsToPayThisMonth).includes(".")){
          const customTotalInDebtsToPayThisMonth = String(this.customTotalInDebtsToPayThisMonth).split('.');

          if (customTotalInDebtsToPayThisMonth[1].length == 1) this.totalInDebtsToPayThisMonth = customTotalInDebtsToPayThisMonth[0] + "DT." + customTotalInDebtsToPayThisMonth[1] + "00Mill";
          else if (customTotalInDebtsToPayThisMonth[1].length == 2) this.totalInDebtsToPayThisMonth = customTotalInDebtsToPayThisMonth[0] + "DT." + customTotalInDebtsToPayThisMonth[1] + "0Mill";
          else this.totalInDebtsToPayThisMonth = customTotalInDebtsToPayThisMonth[0] + "DT." + customTotalInDebtsToPayThisMonth[1] + "Mill";
        } else {
          this.totalInDebtsToPayThisMonth = String(this.customTotalInDebtsToPayThisMonth) + "DT";

        }
      } else {
        this.totalInDebtsToPayThisMonth = this.defaultTotalInDebtsToPayThisMonth + "Mill";
      }
    });
  }

  getTotalInDebtsToPayNextMonth() {
    this.defaultTotalInDebtsToPayNextMonth = 0;
    this.customTotalInDebtsToPayNextMonth = 0;
    this.totalInDebtsToPayNextMonth = "";

    this.allDebts.filter(debt => (debt.debtForPay == true) && (debt.toPayNextMonth == true)).forEach(element => {

      if (element.financialDebt.indexOf("DT") !== -1) {
        element.debtWithConvertToPayNextMonth = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("DT"));
        element.debtWithConvertToPayNextMonth = element.debtWithConvertToPayNextMonth + '000';

      }
      if (element.financialDebt.indexOf("Mill") !== -1) {
        element.debtWithConvertToPayNextMonth = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("Mill"));

      }
      if (element.financialDebt.includes(".")){
        const composedDebtToPayNextMonth = element.financialDebt.split('.');
        if (composedDebtToPayNextMonth[0].indexOf("DT") !== -1) {
          element.firstPartComposedDebtWithConvertToPayNextMonth = composedDebtToPayNextMonth[0].substring(0, composedDebtToPayNextMonth[0].lastIndexOf("DT"));
          element.firstPartComposedDebtWithConvertToPayNextMonth = element.firstPartComposedDebtWithConvertToPayNextMonth + '000';
        }
        if (composedDebtToPayNextMonth[1].indexOf("Mill") !== -1) {
          element.secondPartComposedDebtWithConvertToPayNextMonth = composedDebtToPayNextMonth[1].substring(0, composedDebtToPayNextMonth[1].lastIndexOf("Mill"));
        }
        element.debtWithConvertToPayNextMonth = String(Number(element.firstPartComposedDebtWithConvertToPayNextMonth)+Number(element.secondPartComposedDebtWithConvertToPayNextMonth));

      }

      this.defaultTotalInDebtsToPayNextMonth += Number(element.debtWithConvertToPayNextMonth);


      if (this.defaultTotalInDebtsToPayNextMonth.toString().length > 4) {

        this.customTotalInDebtsToPayNextMonth = this.defaultTotalInDebtsToPayNextMonth / 1000;

        if (String(this.customTotalInDebtsToPayNextMonth).includes(".")){
          const customTotalInDebtsToPayNextMonth = String(this.customTotalInDebtsToPayNextMonth).split('.');

          if (customTotalInDebtsToPayNextMonth[1].length == 1) this.totalInDebtsToPayNextMonth = customTotalInDebtsToPayNextMonth[0] + "DT." + customTotalInDebtsToPayNextMonth[1] + "00Mill";
          else if (customTotalInDebtsToPayNextMonth[1].length == 2) this.totalInDebtsToPayNextMonth = customTotalInDebtsToPayNextMonth[0] + "DT." + customTotalInDebtsToPayNextMonth[1] + "0Mill";
          else this.totalInDebtsToPayNextMonth = customTotalInDebtsToPayNextMonth[0] + "DT." + customTotalInDebtsToPayNextMonth[1] + "Mill";
        } else {
          this.totalInDebtsToPayNextMonth = String(this.customTotalInDebtsToPayNextMonth) + "DT";

        }
      } else {
        this.totalInDebtsToPayNextMonth = this.defaultTotalInDebtsToPayNextMonth + "Mill";
      }
    });
  }

  getTotalInDebtsNotToPayForNow() {
    this.defaultTotalInDebtsNotToPayForNow = 0;
    this.customTotalInDebtsNotToPayForNow = 0;
    this.totalInDebtsNotToPayForNow = "";

    this.allDebts.filter(debt => (debt.debtForPay == true) && (debt.notToPayForNow == true)).forEach(element => {

      if (element.financialDebt.indexOf("DT") !== -1) {
        element.debtWithConvertNotToPayForNow = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("DT"));
        element.debtWithConvertNotToPayForNow = element.debtWithConvertNotToPayForNow + '000';

      }
      if (element.financialDebt.indexOf("Mill") !== -1) {
        element.debtWithConvertNotToPayForNow = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("Mill"));

      }
      if (element.financialDebt.includes(".")){
        const composedDebtNotToPayForNow = element.financialDebt.split('.');
        if (composedDebtNotToPayForNow[0].indexOf("DT") !== -1) {
          element.firstPartComposedDebtWithConvertNotToPayForNow = composedDebtNotToPayForNow[0].substring(0, composedDebtNotToPayForNow[0].lastIndexOf("DT"));
          element.firstPartComposedDebtWithConvertNotToPayForNow = element.firstPartComposedDebtWithConvertNotToPayForNow + '000';
        }
        if (composedDebtNotToPayForNow[1].indexOf("Mill") !== -1) {
          element.secondPartComposedDebtWithConvertNotToPayForNow = composedDebtNotToPayForNow[1].substring(0, composedDebtNotToPayForNow[1].lastIndexOf("Mill"));
        }
        element.debtWithConvertNotToPayForNow = String(Number(element.firstPartComposedDebtWithConvertNotToPayForNow)+Number(element.secondPartComposedDebtWithConvertNotToPayForNow));

      }

      this.defaultTotalInDebtsNotToPayForNow += Number(element.debtWithConvertNotToPayForNow);


      if (this.defaultTotalInDebtsNotToPayForNow.toString().length > 4) {

        this.customTotalInDebtsNotToPayForNow = this.defaultTotalInDebtsNotToPayForNow / 1000;

        if (String(this.customTotalInDebtsNotToPayForNow).includes(".")){
          const customTotalInDebtsNotToPayForNow = String(this.customTotalInDebtsNotToPayForNow).split('.');

          if (customTotalInDebtsNotToPayForNow[1].length == 1) this.totalInDebtsNotToPayForNow = customTotalInDebtsNotToPayForNow[0] + "DT." + customTotalInDebtsNotToPayForNow[1] + "00Mill";
          else if (customTotalInDebtsNotToPayForNow[1].length == 2) this.totalInDebtsNotToPayForNow = customTotalInDebtsNotToPayForNow[0] + "DT." + customTotalInDebtsNotToPayForNow[1] + "0Mill";
          else this.totalInDebtsNotToPayForNow = customTotalInDebtsNotToPayForNow[0] + "DT." + customTotalInDebtsNotToPayForNow[1] + "Mill";
        } else {
          this.totalInDebtsNotToPayForNow = String(this.customTotalInDebtsNotToPayForNow) + "DT";

        }
      } else {
        this.totalInDebtsNotToPayForNow = this.defaultTotalInDebtsNotToPayForNow + "Mill";
      }
    });
  }

  getTotalOutDebtsToGetThisMonth() {
    this.defaultTotalInDebtsToGetThisMonth = 0;
    this.customTotalInDebtsToGetThisMonth = 0;
    this.totalOutDebtsToGetThisMonth = "";

    this.allDebts.filter(debt => (debt.debtToGet == true) && (debt.toGetThisMonth == true)).forEach(element => {

      if (element.financialDebt.indexOf("DT") !== -1) {
        element.debtWithConvertToGetThisMonth = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("DT"));
        element.debtWithConvertToGetThisMonth = element.debtWithConvertToGetThisMonth + '000';

      }
      if (element.financialDebt.indexOf("Mill") !== -1) {
        element.debtWithConvertToGetThisMonth = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("Mill"));

      }
      if (element.financialDebt.includes(".")){
        const composedDebtToGetThisMonth = element.financialDebt.split('.');
        if (composedDebtToGetThisMonth[0].indexOf("DT") !== -1) {
          element.firstPartComposedDebtWithConvertToGetThisMonth = composedDebtToGetThisMonth[0].substring(0, composedDebtToGetThisMonth[0].lastIndexOf("DT"));
          element.firstPartComposedDebtWithConvertToGetThisMonth = element.firstPartComposedDebtWithConvertToGetThisMonth + '000';
        }
        if (composedDebtToGetThisMonth[1].indexOf("Mill") !== -1) {
          element.secondPartComposedDebtWithConvertToGetThisMonth = composedDebtToGetThisMonth[1].substring(0, composedDebtToGetThisMonth[1].lastIndexOf("Mill"));
        }
        element.debtWithConvertToGetThisMonth = String(Number(element.firstPartComposedDebtWithConvertToGetThisMonth)+Number(element.secondPartComposedDebtWithConvertToGetThisMonth));

      }

      this.defaultTotalInDebtsToGetThisMonth += Number(element.debtWithConvertToGetThisMonth);


      if (this.defaultTotalInDebtsToGetThisMonth.toString().length > 4) {

        this.customTotalInDebtsToGetThisMonth = this.defaultTotalInDebtsToGetThisMonth / 1000;

        if (String(this.customTotalInDebtsToGetThisMonth).includes(".")){
          const customTotalInDebtsToGetThisMonth = String(this.customTotalInDebtsToGetThisMonth).split('.');

          if (customTotalInDebtsToGetThisMonth[1].length == 1) this.totalOutDebtsToGetThisMonth = customTotalInDebtsToGetThisMonth[0] + "DT." + customTotalInDebtsToGetThisMonth[1] + "00Mill";
          else if (customTotalInDebtsToGetThisMonth[1].length == 2) this.totalOutDebtsToGetThisMonth = customTotalInDebtsToGetThisMonth[0] + "DT." + customTotalInDebtsToGetThisMonth[1] + "0Mill";
          else this.totalOutDebtsToGetThisMonth = customTotalInDebtsToGetThisMonth[0] + "DT." + customTotalInDebtsToGetThisMonth[1] + "Mill";
        } else {
          this.totalOutDebtsToGetThisMonth = String(this.customTotalInDebtsToGetThisMonth) + "DT";

        }
      } else {
        this.totalOutDebtsToGetThisMonth = this.defaultTotalInDebtsToGetThisMonth + "Mill";
      }
    });
  }

  getTotalOutDebtsToGetNextMonth() {
    this.defaultTotalInDebtsToGetNextMonth = 0;
    this.customTotalInDebtsToGetNextMonth = 0;
    this.totalOutDebtsToGetNextMonth = "";

    this.allDebts.filter(debt => (debt.debtToGet == true) && (debt.toGetNextMonth == true)).forEach(element => {

      if (element.financialDebt.indexOf("DT") !== -1) {
        element.debtWithConvertToGetNextMonth = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("DT"));
        element.debtWithConvertToGetNextMonth = element.debtWithConvertToGetNextMonth + '000';

      }
      if (element.financialDebt.indexOf("Mill") !== -1) {
        element.debtWithConvertToGetNextMonth = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("Mill"));

      }
      if (element.financialDebt.includes(".")){
        const composedDebtToGetNextMonth = element.financialDebt.split('.');
        if (composedDebtToGetNextMonth[0].indexOf("DT") !== -1) {
          element.firstPartComposedDebtWithConvertToGetNextMonth = composedDebtToGetNextMonth[0].substring(0, composedDebtToGetNextMonth[0].lastIndexOf("DT"));
          element.firstPartComposedDebtWithConvertToGetNextMonth = element.firstPartComposedDebtWithConvertToGetNextMonth + '000';
        }
        if (composedDebtToGetNextMonth[1].indexOf("Mill") !== -1) {
          element.secondPartComposedDebtWithConvertToGetNextMonth = composedDebtToGetNextMonth[1].substring(0, composedDebtToGetNextMonth[1].lastIndexOf("Mill"));
        }
        element.debtWithConvertToGetNextMonth = String(Number(element.firstPartComposedDebtWithConvertToGetNextMonth)+Number(element.secondPartComposedDebtWithConvertToGetNextMonth));

      }

      this.defaultTotalInDebtsToGetNextMonth += Number(element.debtWithConvertToGetNextMonth);


      if (this.defaultTotalInDebtsToGetNextMonth.toString().length > 4) {

        this.customTotalInDebtsToGetNextMonth = this.defaultTotalInDebtsToGetNextMonth / 1000;

        if (String(this.customTotalInDebtsToGetNextMonth).includes(".")){
          const customTotalInDebtsToGetNextMonth = String(this.customTotalInDebtsToGetNextMonth).split('.');

          if (customTotalInDebtsToGetNextMonth[1].length == 1) this.totalOutDebtsToGetNextMonth = customTotalInDebtsToGetNextMonth[0] + "DT." + customTotalInDebtsToGetNextMonth[1] + "00Mill";
          else if (customTotalInDebtsToGetNextMonth[1].length == 2) this.totalOutDebtsToGetNextMonth = customTotalInDebtsToGetNextMonth[0] + "DT." + customTotalInDebtsToGetNextMonth[1] + "0Mill";
          else this.totalOutDebtsToGetNextMonth = customTotalInDebtsToGetNextMonth[0] + "DT." + customTotalInDebtsToGetNextMonth[1] + "Mill";
        } else {
          this.totalOutDebtsToGetNextMonth = String(this.customTotalInDebtsToGetNextMonth) + "DT";

        }
      } else {
        this.totalOutDebtsToGetNextMonth = this.defaultTotalInDebtsToGetNextMonth + "Mill";
      }
    });
  }

  getTotalOutDebtsNotToGetForNow() {
    this.defaultTotalInDebtsNotToGetForNow = 0;
    this.customTotalInDebtsNotToGetForNow = 0;
    this.totalOutDebtsNotToGetForNow = "";

    this.allDebts.filter(debt => (debt.debtToGet == true) && (debt.notToGetForNow == true)).forEach(element => {

      if (element.financialDebt.indexOf("DT") !== -1) {
        element.debtWithConvertNotToGetForNow = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("DT"));
        element.debtWithConvertNotToGetForNow = element.debtWithConvertNotToGetForNow + '000';

      }
      if (element.financialDebt.indexOf("Mill") !== -1) {
        element.debtWithConvertNotToGetForNow = element.financialDebt.substring(0, element.financialDebt.lastIndexOf("Mill"));

      }
      if (element.financialDebt.includes(".")){
        const composedDebtNotToGetForNow = element.financialDebt.split('.');
        if (composedDebtNotToGetForNow[0].indexOf("DT") !== -1) {
          element.firstPartComposedDebtWithConvertNotToGetForNow = composedDebtNotToGetForNow[0].substring(0, composedDebtNotToGetForNow[0].lastIndexOf("DT"));
          element.firstPartComposedDebtWithConvertNotToGetForNow = element.firstPartComposedDebtWithConvertNotToGetForNow + '000';
        }
        if (composedDebtNotToGetForNow[1].indexOf("Mill") !== -1) {
          element.secondPartComposedDebtWithConvertNotToGetForNow = composedDebtNotToGetForNow[1].substring(0, composedDebtNotToGetForNow[1].lastIndexOf("Mill"));
        }
        element.debtWithConvertNotToGetForNow = String(Number(element.firstPartComposedDebtWithConvertNotToGetForNow)+Number(element.secondPartComposedDebtWithConvertNotToGetForNow));

      }

      this.defaultTotalInDebtsNotToGetForNow += Number(element.debtWithConvertNotToGetForNow);


      if (this.defaultTotalInDebtsNotToGetForNow.toString().length > 4) {

        this.customTotalInDebtsNotToGetForNow = this.defaultTotalInDebtsNotToGetForNow / 1000;

        if (String(this.customTotalInDebtsNotToGetForNow).includes(".")){
          const customTotalInDebtsNotToGetForNow = String(this.customTotalInDebtsNotToGetForNow).split('.');

          if (customTotalInDebtsNotToGetForNow[1].length == 1) this.totalOutDebtsNotToGetForNow = customTotalInDebtsNotToGetForNow[0] + "DT." + customTotalInDebtsNotToGetForNow[1] + "00Mill";
          else if (customTotalInDebtsNotToGetForNow[1].length == 2) this.totalOutDebtsNotToGetForNow = customTotalInDebtsNotToGetForNow[0] + "DT." + customTotalInDebtsNotToGetForNow[1] + "0Mill";
          else this.totalOutDebtsNotToGetForNow = customTotalInDebtsNotToGetForNow[0] + "DT." + customTotalInDebtsNotToGetForNow[1] + "Mill";
        } else {
          this.totalOutDebtsNotToGetForNow = String(this.customTotalInDebtsNotToGetForNow) + "DT";

        }
      } else {
        this.totalOutDebtsNotToGetForNow = this.defaultTotalInDebtsNotToGetForNow + "Mill";
      }
    });
  }

  getAllClockings() {
    this.subscriptionForGetAllClockings = this.clockingService
    .getAll()
    .subscribe((clockings: Clocking[]) => {

      this.clockingsListForCalculTotalClockingLate = clockings
      .filter(clocking => clocking.dateClocking.split('-')[1] == this.monthForCalculTotalClockingLateAndRestVac)
      .sort((n1, n2) => n2.numRefClocking - n1.numRefClocking);
   
      this.minutePartList = [];
      if (this.clockingsListForCalculTotalClockingLate.length > 0) {
        this.clockingsListForCalculTotalClockingLate.forEach(clocking => {
            this.calculTotalClockingLate(clocking.timeClocking);
        })
      } else {
        this.totalClockingLate = 0;
        this.totalClockingLateByHoursMinute = '0 Min';
      }

      let lastClockingByCurrentMonth = clockings
      .filter(clocking => clocking.dateClocking.split('-')[1] == this.monthForCalculTotalClockingLateAndRestVac)
      .sort((n1, n2) => n2.numRefClocking - n1.numRefClocking)[0];
      if (lastClockingByCurrentMonth) this.vacationLimitDays = lastClockingByCurrentMonth.restVacationDays;

    });
  }

  calculTotalClockingLate(timeClocking: string) {
    if (!timeClocking || !/^\d{2}:\d{2}$/.test(timeClocking)) return;

    // Helper: HH:MM → minutes
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const now = new Date();
    const month = now.getMonth(); // 0 = Jan, 6 = July, 7 = August

    const summerBaseTime = timeToMinutes('07:30');
    const regularBaseTime = timeToMinutes('08:00');
    const clockingTime = timeToMinutes(timeClocking);

    let lateMinutes = 0;

    if (month === 6 || month === 7) {
      // July or August
      if (clockingTime > summerBaseTime) {
        lateMinutes = clockingTime - summerBaseTime;
      }
    } else {
      // Other months
      if (clockingTime > regularBaseTime) {
        lateMinutes = clockingTime - regularBaseTime;
      }
    }

    // Accumulate late minutes
    this.minutePartList.push(lateMinutes);
    this.sumClockingLate = this.minutePartList.reduce((acc, curr) => acc + curr, 0);

    // Always keep total in minutes
    this.totalClockingLate = this.sumClockingLate;

    // Also provide hours/minutes format if >= 60
    if (this.sumClockingLate < 60) {
      this.totalClockingLateByHoursMinute = '';
    } else {
      const hours = Math.floor(this.sumClockingLate / 60);
      const minutes = this.sumClockingLate % 60;
      this.totalClockingLateByHoursMinute = `${hours}H ${minutes}Min`;
    }
  }

  getAllReminders() {
    this.contentsRemindersTodayList = [];
    this.contentsRemindersNotDoed = [];
    const currentTime = this.formatDate(new Date());
    this.subscriptionForGetAllReminders = this.reminderService
    .getAll()
    .subscribe((reminders: Reminder[]) => {
      let remindersCopy = reminders;
      this.contentsRemindersTodayList = reminders.filter(reminder => reminder.date == moment().format('YYYY-MM-DD'));
      this.contentsRemindersNotDoed = remindersCopy.filter(reminder => reminder.targetDate < currentTime);
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed, so add 1
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
  
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }

  sendRemindersForChecking() {
    this.allReminders = [];
    this.subscriptionForGetAllReminders = this.reminderService
    .getAll()
    .subscribe((reminders: Reminder[]) => {
      if (reminders.length > 0) {
        this.allReminders = reminders;
        this.timeCheckingService.startCheckingTime(this.allReminders, this.isDesktop);
        this.router.events.subscribe(event => {
          if (event instanceof NavigationStart) {
            this.timeCheckingService.startCheckingTime(this.allReminders, this.isDesktop);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.subscriptionForGetAllMoviesToCheckToday.unsubscribe();
    this.subscriptionForGetAllMoviesNotChecked.unsubscribe();
    this.subscriptionForGetAllAnimesToCheckToday.unsubscribe();
    this.subscriptionForGetAllAnimesNotChecked.unsubscribe();
    this.subscriptionForGetAllSeriesToCheckToday.unsubscribe();
    this.subscriptionForGetAllSeriesNotChecked.unsubscribe();
    this.subscriptionForGetAllContentsExpired.unsubscribe();
    this.subscriptionForGetAllDebts.unsubscribe();
    this.subscriptionForGetAllClockings.unsubscribe();
    this.subscriptionForGetAllReminders.unsubscribe();
  }
  
}