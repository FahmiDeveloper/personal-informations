import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

import { DeviceDetectorService } from 'ngx-device-detector';

import { forkJoin, Observable } from 'rxjs';

import * as moment from 'moment';

import { AnimeService } from 'src/app/shared/services/anime.service';
import { MovieService } from 'src/app/shared/services/movie.service';
import { SerieService } from 'src/app/shared/services/serie.service';
import { ExpirationService } from 'src/app/shared/services/expiration.service';
import { DebtService } from 'src/app/shared/services/debt.service';
import { ClockingService } from 'src/app/shared/services/clocking.service';
import { ReminderService } from 'src/app/shared/services/reminder.service';
import { TimeCheckingService } from 'src/app/time-checking.service';

import { Expiration } from 'src/app/shared/models/expiration.model';
import { Debt } from 'src/app/shared/models/debt.model';
import { Clocking } from 'src/app/shared/models/clocking.model';
import { Reminder } from 'src/app/shared/models/reminder.model';
import { take } from 'rxjs/operators';

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

  loading = true;
  
  // movies variables
  todayMoviesCount = 0;
  notCheckedMoviesCount = 0;

  // animes variables
  todayAnimesCount = 0;
  notCheckedAnimesCount = 0;

  // series variables
  todaySeriesCount = 0;
  notCheckedSeriesCount = 0;

  // clockings variables
  currentMonth = '';
  currentYear: number;
  sumClockingLate: number;
  monthLateRestVacTotal = '';
  clockingsForLateCalc: Clocking[] = []
  minutePartList: number[] = [];
  totalClockingLate = 0;
  totalClockingLateByHoursMinute = '';
  vacationLimitDays = 0;
  hours: number;
  minutes: number;

  // expirations variables
  expiredContents: Expiration[] = [];
  contentsSoonToExpire: Expiration[] = [];

  // reminders variables
  remindersTodayList: Reminder[] = [];
  remindersNotDoed: Reminder[] = [];

  // debts variables
  totalInDebt = 0;
  totalOutDebt = 0;
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
  totInDebtsToPayThisMonth: string;
  totInDebtsToPayNextMonth: string;
  totInDebtsNotToPayForNow: string;
  deftotInDebtsToPayThisMonth: number;
  custTotInDebtsToPayThisMonth: number;
  defTotInDebtsToPayNextMonth: number;
  custTotInDebtsToPayNextMonth: number;
  defTotInDebtsNotToPayForNow: number;
  custTotInDebtsNotToPayForNow: number;
  totInDebtsToGetThisMonth: string;
  custTotInDebtsToGetThisMonth: number;
  defTotInDebtsToGetThisMonth: number;
  totOutDebtsToGetThisMonth: string;
  totOutDebtsToGetNextMonth: string;
  custTotalInDebtsToGetNextMonth: number;
  defTotalInDebtsToGetNextMonth: number;
  totOutDebtsNotToGetForNow: string;
  custTotalInDebtsNotToGetForNow: number;
  defTotalInDebtsNotToGetForNow: number;

  constructor(
    private deviceService: DeviceDetectorService,
    private movieService: MovieService,
    private animeService: AnimeService,
    private serieService: SerieService,
    private clockingService: ClockingService,
    private expirationService: ExpirationService,
    private reminderService: ReminderService,
    private timeCheckingService: TimeCheckingService,
    private debtService: DebtService,
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
    {this.monthLateRestVacTotal  = String(d.getMonth()+ 1);}
    else {this.monthLateRestVacTotal  = '0' + String(d.getMonth()+ 1);}

    const today = moment().format('YYYY-MM-DD');

    this.loading = true;

    forkJoin({
      todayMoviesCount: this.countMoviesToCheckToday(today),
      notCheckedMoviesCount: this.countMoviesNotChecked(today),
      todayAnimesCount: this.countAnimesToCheckToday(today),
      notCheckedAnimesCount: this.countAnimesNotChecked(today),
      todaySeriesCount: this.countSeriesToCheckToday(today),
      notCheckedSeriesCount: this.countSeriesNotChecked(today),
      clockings: this.loadClockings(),
      expirations: this.loadExpirations(),      
      reminders: this.loadReminders(),      
      debts: this.loadDebts()      
    }).subscribe(result => {
      this.todayMoviesCount = result.todayMoviesCount;
      this.notCheckedMoviesCount = result.notCheckedMoviesCount;
      this.todayAnimesCount = result.todayAnimesCount;
      this.notCheckedAnimesCount = result.notCheckedAnimesCount;
      this.todaySeriesCount = result.todaySeriesCount;
      this.notCheckedSeriesCount = result.notCheckedSeriesCount;
      this.getClockingsSummary(result.clockings);
      this.getExpiredContents(result.expirations);
      this.getReminders(result.reminders);
      this.sendNotfsOfReminders(result.reminders);
      this.getDebtsStats(result.debts);
      this.loading = false;
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = window.innerWidth;
  }

  getClass() {
    return this.innerWidth < 925 ? 'row-md' : 'row'; 
  }

  countMoviesToCheckToday(today): Observable<number> {
    return this.movieService.getTodayMoviesCount(today);
  }

  countMoviesNotChecked(today): Observable<number> {
    return this.movieService.getNotCheckedMoviesCount(today);
  }

  countAnimesToCheckToday(today): Observable<number> {
    return this.animeService.getTodayAnimesCount(today);
  }

  countAnimesNotChecked(today): Observable<number> {
    return this.animeService.getNotCheckedAnimesCount(today);
  }

  countSeriesToCheckToday(today): Observable<number> {
    return this.serieService.getTodaySeriesCount(today);
  }

  countSeriesNotChecked(today): Observable<number> {
    return this.serieService.getNotCheckedSeriesCount(today);
  }

  loadReminders() {
    return this.reminderService.getAll().pipe(take(1));
  }

  sendNotfsOfReminders(reminders: Reminder[]) {
    this.timeCheckingService.startCheckingTime(reminders, this.isDesktop);
  }

  loadClockings() {
    return this.clockingService.getAll().pipe(take(1));
  }

  getClockingsSummary(clockings: Clocking[]) {
    this.clockingsForLateCalc = clockings
    .filter(clocking => clocking.dateClocking.split('-')[1] == this.monthLateRestVacTotal)
    .sort((n1, n2) => n2.numRefClocking - n1.numRefClocking);
  
    this.minutePartList = [];
    if (this.clockingsForLateCalc.length > 0) {
      this.clockingsForLateCalc.forEach(clocking => {
          this.calculTotalClockingLate(clocking.timeClocking);
      })
    } else {
      this.totalClockingLate = 0;
        this.totalClockingLateByHoursMinute = '0 Min';
    }

    let lastClockingByCurrentMonth = clockings
    .filter(clocking => clocking.dateClocking.split('-')[1] == this.monthLateRestVacTotal)
    .sort((n1, n2) => n2.numRefClocking - n1.numRefClocking)[0];
    if (lastClockingByCurrentMonth) this.vacationLimitDays = lastClockingByCurrentMonth.restVacationDays;
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
      this.hours = Math.floor(this.sumClockingLate / 60);
      this.minutes = this.sumClockingLate % 60;
      this.totalClockingLateByHoursMinute = `${this.hours}H ${this.minutes}Min`;
    }
  }

  loadExpirations() {
    return this.expirationService.getAll().pipe(take(1));
  }

  getExpiredContents(expirations: Expiration[]) {
    this.expiredContents = [];
    this.contentsSoonToExpire = [];

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
        this.expiredContents.push(expiration);
      }

      if (now < expirationDate && years == 0 && months == 0 && days >= 1 && days <= 3) {
        this.contentsSoonToExpire.push(expiration);
      }
    })        
  }

  getReminders(reminders: Reminder[]) {
    this.remindersTodayList = [];
    this.remindersNotDoed = [];
    const currentTime = this.formatDate(new Date());
    let remindersCopy = reminders;
    this.remindersTodayList = reminders.filter(reminder => reminder.date == moment().format('YYYY-MM-DD'));
    this.remindersNotDoed = remindersCopy.filter(reminder => reminder.targetDate < currentTime);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed, so add 1
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
  
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }

  loadDebts() {
    return this.debtService.getAll().pipe(take(1));
  }

  getDebtsStats(debts: Debt[]) {
      this.getRestMoneyForeachPlace(debts);
      this.getRestMoneyForeachEnv(debts);
      this.getTotalIntDebts(debts);
      this.getTotalOutDebts(debts);
      this.getTotInDebtsToPayThisMonth(debts);
      this.getTotInDebtsToPayNextMonth(debts);
      this.getTotInDebtsNotToPayForNow(debts);
      this.getTotOutDebtsToGetThisMonth(debts);
      this.getTotOutDebtsToGetNextMonth(debts);
      this.getTotOutDebtsNotToGetForNow(debts);
  }

  getRestMoneyForeachPlace(debts: Debt[]) {
    let debtForRestInPocket = debts.filter(debt => debt.placeId == 1).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInWallet = debts.filter(debt => debt.placeId == 2).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInBox = debts.filter(debt => debt.placeId == 4).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInPosteAccount = debts.filter(debt => debt.placeId == 6).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];

    this.restInPocket = debtForRestInPocket ? debtForRestInPocket.restMoney : '0DT';
    this.restInWallet = debtForRestInWallet ? debtForRestInWallet.restMoney : '0DT';
    this.restInBox = debtForRestInBox ? debtForRestInBox.restMoney : '0DT';
    this.restInPosteAccount = debtForRestInPosteAccount ? debtForRestInPosteAccount.restMoney : '0DT';
  }

  getRestMoneyForeachEnv(debts: Debt[]) {
    let debtForRestInEnvTaxi = debts.filter(debt => debt.placeId == 3 && debt.envelopeId == 1).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInEnvInternet = debts.filter(debt => debt.placeId == 3 && debt.envelopeId == 2).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInEnvWaterElec = debts.filter(debt => debt.placeId == 3 && debt.envelopeId == 3).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInEnvBeinSports = debts.filter(debt => debt.placeId == 3 && debt.envelopeId == 4).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInEnvHomeLoc = debts.filter(debt => debt.placeId == 3 && debt.envelopeId == 5).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];
    let debtForRestInEnvHomeSupp = debts.filter(debt => debt.placeId == 3 && debt.envelopeId == 6).sort((n1, n2) => n2.numRefDebt - n1.numRefDebt)[0];

    this.restInEnvTaxi = debtForRestInEnvTaxi ? debtForRestInEnvTaxi.restMoney : '0DT';
    this.restInEnvInternet = debtForRestInEnvInternet ? debtForRestInEnvInternet.restMoney : '0DT';
    this.restInEnvWaterElec = debtForRestInEnvWaterElec ? debtForRestInEnvWaterElec.restMoney : '0DT';
    this.restInEnvBeinSports = debtForRestInEnvBeinSports ? debtForRestInEnvBeinSports.restMoney : '0DT';
    this.restInEnvHomeLoc = debtForRestInEnvHomeLoc ? debtForRestInEnvHomeLoc.restMoney : '0DT';
    this.restInEnvHomeSupp = debtForRestInEnvHomeSupp ? debtForRestInEnvHomeSupp.restMoney : '0DT';
  }

  getTotalIntDebts(debts: Debt[]) { 
    this.defaultTotalInDebts = 0;
    this.customTotalInDebts = 0;
    this.totalInDebts = "";

    debts.filter(debt => debt.debtForPay == true).forEach(element => {
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

  getTotalOutDebts(debts: Debt[]) {
    this.defaultTotalOutDebts = 0;
    this.customTotalOutDebts = 0;
    this.totalOutDebts = "";

    debts.filter(debt => debt.debtToGet == true).forEach(element => {
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

  getTotInDebtsToPayThisMonth(debts: Debt[]) {
    this.deftotInDebtsToPayThisMonth = 0;
    this.custTotInDebtsToPayThisMonth = 0;
    this.totInDebtsToPayThisMonth = "";

    debts.filter(debt => (debt.debtForPay == true) && (debt.toPayThisMonth == true)).forEach(element => {

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

      this.deftotInDebtsToPayThisMonth += Number(element.debtWithConvertToPayThisMonth);


      if (this.deftotInDebtsToPayThisMonth.toString().length > 4) {

        this.custTotInDebtsToPayThisMonth = this.deftotInDebtsToPayThisMonth / 1000;

        if (String(this.custTotInDebtsToPayThisMonth).includes(".")){
          const custTotInDebtsToPayThisMonth = String(this.custTotInDebtsToPayThisMonth).split('.');

          if (custTotInDebtsToPayThisMonth[1].length == 1) this.totInDebtsToPayThisMonth = custTotInDebtsToPayThisMonth[0] + "DT." + custTotInDebtsToPayThisMonth[1] + "00Mill";
          else if (custTotInDebtsToPayThisMonth[1].length == 2) this.totInDebtsToPayThisMonth = custTotInDebtsToPayThisMonth[0] + "DT." + custTotInDebtsToPayThisMonth[1] + "0Mill";
          else this.totInDebtsToPayThisMonth = custTotInDebtsToPayThisMonth[0] + "DT." + custTotInDebtsToPayThisMonth[1] + "Mill";
        } else {
          this.totInDebtsToPayThisMonth = String(this.custTotInDebtsToPayThisMonth) + "DT";

        }
      } else {
        this.totInDebtsToPayThisMonth = this.deftotInDebtsToPayThisMonth + "Mill";
      }
    });
  }

  getTotInDebtsToPayNextMonth(debts: Debt[]) {
    this.defTotInDebtsToPayNextMonth = 0;
    this.custTotInDebtsToPayNextMonth = 0;
    this.totInDebtsToPayNextMonth = "";

    debts.filter(debt => (debt.debtForPay == true) && (debt.toPayNextMonth == true)).forEach(element => {

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

      this.defTotInDebtsToPayNextMonth += Number(element.debtWithConvertToPayNextMonth);


      if (this.defTotInDebtsToPayNextMonth.toString().length > 4) {

        this.custTotInDebtsToPayNextMonth = this.defTotInDebtsToPayNextMonth / 1000;

        if (String(this.custTotInDebtsToPayNextMonth).includes(".")){
          const custTotInDebtsToPayNextMonth = String(this.custTotInDebtsToPayNextMonth).split('.');

          if (custTotInDebtsToPayNextMonth[1].length == 1) this.totInDebtsToPayNextMonth = custTotInDebtsToPayNextMonth[0] + "DT." + custTotInDebtsToPayNextMonth[1] + "00Mill";
          else if (custTotInDebtsToPayNextMonth[1].length == 2) this.totInDebtsToPayNextMonth = custTotInDebtsToPayNextMonth[0] + "DT." + custTotInDebtsToPayNextMonth[1] + "0Mill";
          else this.totInDebtsToPayNextMonth = custTotInDebtsToPayNextMonth[0] + "DT." + custTotInDebtsToPayNextMonth[1] + "Mill";
        } else {
          this.totInDebtsToPayNextMonth = String(this.custTotInDebtsToPayNextMonth) + "DT";

        }
      } else {
        this.totInDebtsToPayNextMonth = this.defTotInDebtsToPayNextMonth + "Mill";
      }
    });
  }

  getTotInDebtsNotToPayForNow(debts: Debt[]) {
    this.defTotInDebtsNotToPayForNow = 0;
    this.custTotInDebtsNotToPayForNow = 0;
    this.totInDebtsNotToPayForNow = "";

    debts.filter(debt => (debt.debtForPay == true) && (debt.notToPayForNow == true)).forEach(element => {

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

      this.defTotInDebtsNotToPayForNow += Number(element.debtWithConvertNotToPayForNow);


      if (this.defTotInDebtsNotToPayForNow.toString().length > 4) {

        this.custTotInDebtsNotToPayForNow = this.defTotInDebtsNotToPayForNow / 1000;

        if (String(this.custTotInDebtsNotToPayForNow).includes(".")){
          const custTotInDebtsNotToPayForNow = String(this.custTotInDebtsNotToPayForNow).split('.');

          if (custTotInDebtsNotToPayForNow[1].length == 1) this.totInDebtsNotToPayForNow = custTotInDebtsNotToPayForNow[0] + "DT." + custTotInDebtsNotToPayForNow[1] + "00Mill";
          else if (custTotInDebtsNotToPayForNow[1].length == 2) this.totInDebtsNotToPayForNow = custTotInDebtsNotToPayForNow[0] + "DT." + custTotInDebtsNotToPayForNow[1] + "0Mill";
          else this.totInDebtsNotToPayForNow = custTotInDebtsNotToPayForNow[0] + "DT." + custTotInDebtsNotToPayForNow[1] + "Mill";
        } else {
          this.totInDebtsNotToPayForNow = String(this.custTotInDebtsNotToPayForNow) + "DT";

        }
      } else {
        this.totInDebtsNotToPayForNow = this.defTotInDebtsNotToPayForNow + "Mill";
      }
    });
  }

  getTotOutDebtsToGetThisMonth(debts: Debt[]) {
    this.defTotInDebtsToGetThisMonth = 0;
    this.custTotInDebtsToGetThisMonth = 0;
    this.totOutDebtsToGetThisMonth = "";

    debts.filter(debt => (debt.debtToGet == true) && (debt.toGetThisMonth == true)).forEach(element => {

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

      this.defTotInDebtsToGetThisMonth += Number(element.debtWithConvertToGetThisMonth);


      if (this.defTotInDebtsToGetThisMonth.toString().length > 4) {

        this.custTotInDebtsToGetThisMonth = this.defTotInDebtsToGetThisMonth / 1000;

        if (String(this.custTotInDebtsToGetThisMonth).includes(".")){
          const custTotInDebtsToGetThisMonth = String(this.custTotInDebtsToGetThisMonth).split('.');

          if (custTotInDebtsToGetThisMonth[1].length == 1) this.totOutDebtsToGetThisMonth = custTotInDebtsToGetThisMonth[0] + "DT." + custTotInDebtsToGetThisMonth[1] + "00Mill";
          else if (custTotInDebtsToGetThisMonth[1].length == 2) this.totOutDebtsToGetThisMonth = custTotInDebtsToGetThisMonth[0] + "DT." + custTotInDebtsToGetThisMonth[1] + "0Mill";
          else this.totOutDebtsToGetThisMonth = custTotInDebtsToGetThisMonth[0] + "DT." + custTotInDebtsToGetThisMonth[1] + "Mill";
        } else {
          this.totOutDebtsToGetThisMonth = String(this.custTotInDebtsToGetThisMonth) + "DT";

        }
      } else {
        this.totOutDebtsToGetThisMonth = this.defTotInDebtsToGetThisMonth + "Mill";
      }
    });
  }

  getTotOutDebtsToGetNextMonth(debts: Debt[]) {
    this.defTotalInDebtsToGetNextMonth = 0;
    this.custTotalInDebtsToGetNextMonth = 0;
    this.totOutDebtsToGetNextMonth = "";

    debts.filter(debt => (debt.debtToGet == true) && (debt.toGetNextMonth == true)).forEach(element => {

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

      this.defTotalInDebtsToGetNextMonth += Number(element.debtWithConvertToGetNextMonth);


      if (this.defTotalInDebtsToGetNextMonth.toString().length > 4) {

        this.custTotalInDebtsToGetNextMonth = this.defTotalInDebtsToGetNextMonth / 1000;

        if (String(this.custTotalInDebtsToGetNextMonth).includes(".")){
          const custTotalInDebtsToGetNextMonth = String(this.custTotalInDebtsToGetNextMonth).split('.');

          if (custTotalInDebtsToGetNextMonth[1].length == 1) this.totOutDebtsToGetNextMonth = custTotalInDebtsToGetNextMonth[0] + "DT." + custTotalInDebtsToGetNextMonth[1] + "00Mill";
          else if (custTotalInDebtsToGetNextMonth[1].length == 2) this.totOutDebtsToGetNextMonth = custTotalInDebtsToGetNextMonth[0] + "DT." + custTotalInDebtsToGetNextMonth[1] + "0Mill";
          else this.totOutDebtsToGetNextMonth = custTotalInDebtsToGetNextMonth[0] + "DT." + custTotalInDebtsToGetNextMonth[1] + "Mill";
        } else {
          this.totOutDebtsToGetNextMonth = String(this.custTotalInDebtsToGetNextMonth) + "DT";

        }
      } else {
        this.totOutDebtsToGetNextMonth = this.defTotalInDebtsToGetNextMonth + "Mill";
      }
    });
  }

  getTotOutDebtsNotToGetForNow(debts: Debt[]) {
    this.defTotalInDebtsNotToGetForNow = 0;
    this.custTotalInDebtsNotToGetForNow = 0;
    this.totOutDebtsNotToGetForNow = "";

    debts.filter(debt => (debt.debtToGet == true) && (debt.notToGetForNow == true)).forEach(element => {

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

      this.defTotalInDebtsNotToGetForNow += Number(element.debtWithConvertNotToGetForNow);


      if (this.defTotalInDebtsNotToGetForNow.toString().length > 4) {

        this.custTotalInDebtsNotToGetForNow = this.defTotalInDebtsNotToGetForNow / 1000;

        if (String(this.custTotalInDebtsNotToGetForNow).includes(".")){
          const custTotalInDebtsNotToGetForNow = String(this.custTotalInDebtsNotToGetForNow).split('.');

          if (custTotalInDebtsNotToGetForNow[1].length == 1) this.totOutDebtsNotToGetForNow = custTotalInDebtsNotToGetForNow[0] + "DT." + custTotalInDebtsNotToGetForNow[1] + "00Mill";
          else if (custTotalInDebtsNotToGetForNow[1].length == 2) this.totOutDebtsNotToGetForNow = custTotalInDebtsNotToGetForNow[0] + "DT." + custTotalInDebtsNotToGetForNow[1] + "0Mill";
          else this.totOutDebtsNotToGetForNow = custTotalInDebtsNotToGetForNow[0] + "DT." + custTotalInDebtsNotToGetForNow[1] + "Mill";
        } else {
          this.totOutDebtsNotToGetForNow = String(this.custTotalInDebtsNotToGetForNow) + "DT";

        }
      } else {
        this.totOutDebtsNotToGetForNow = this.defTotalInDebtsNotToGetForNow + "Mill";
      }
    });
  }

  ngOnDestroy() {}
  
}