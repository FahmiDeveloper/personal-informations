import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { ClockingFormForTabletComponent } from './clocking-form-for-tablet/clocking-form-for-tablet.component';

import { ClockingService } from 'src/app/shared/services/clocking.service';

import { Clocking, MonthsList, SubjectList } from 'src/app/shared/models/clocking.model';

@Component({
  selector: 'clockings-for-tablet',
  templateUrl: './clockings-for-tablet.component.html',
  styleUrls: ['./clockings-for-tablet.scss']
})

export class ClockingsForTabletComponent implements OnInit, OnDestroy {

  clockingsList: Clocking[] = [];
  allClockings: Clocking[]= [];
  clockingsListCopieForNewClocking: Clocking[] = []
  clockingsListCopieForCalculTotalClockingLate: Clocking[] = []

  p = 1;

  currentMonthAndYear: string;
  totalClockingLate = 0;
  minutePartList: number[] = [];
  sumClockingLate: number;
  totalClockingLateByHoursMinute = '';
  vacationLimitDays = 0;
  monthSelected = '';
  currentMonth = '';
  currentYear: number;
  currentMonthAndYearForVacation = '';
  subjectSelectedId: number;
  isLoading: boolean;
  showDeleteAllClockingsButtton: boolean;
  lastClockingFromList = 0;

  modalRefLodaing: any;

  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  subscriptionForGetAllClockings: Subscription;
  
  monthsList: MonthsList[] = [
    { monthNbr: '06', monthName: 'June'},
    { monthNbr: '07', monthName: 'July'},
    { monthNbr: '08', monthName: 'August'},
    { monthNbr: '09', monthName: 'September'},
    { monthNbr: '10', monthName: 'October'},
    { monthNbr: '11', monthName: 'November'},
    { monthNbr: '12', monthName: 'December'},
    { monthNbr: '01', monthName: 'January'},
    { monthNbr: '02', monthName: 'February'},
    { monthNbr: '03', monthName: 'March'},
    { monthNbr: '04', monthName: 'April'},
    { monthNbr: '05', monthName: 'May'}
  ];

  subjectList: SubjectList[] = [
    {id: 1, subjectName: 'Work on sunday'},
    {id: 2, subjectName: 'Take vacation'},
    {id: 3, subjectName: 'Take one hour'},
    {id: 4, subjectName: 'Take two hours'},
    {id: 5, subjectName: 'Take three hours'},
    {id: 6, subjectName: 'Work half day'},
    {id: 7, subjectName: 'Public holiday'},
    {id: 8, subjectName: 'Vacations by month'}     
  ];
  
  constructor(
    public clockingService: ClockingService,
    public dialogService: MatDialog
  ) {}

  ngOnInit() {
    const d = new Date();
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    this.currentMonthAndYearForVacation = months[d.getMonth()] + ' ' + d.getFullYear();
    if ((months[d.getMonth()] == 'October') || (months[d.getMonth()] == 'November') || (months[d.getMonth()] == 'December')) {this.monthSelected = String(d.getMonth()+ 1);}
    else {this.monthSelected = '0' + String(d.getMonth()+ 1);}

    this.getAllClockings();
  }

  getAllClockings() {
    this.subscriptionForGetAllClockings = this.clockingService
    .getAll()
    .subscribe((clockings: Clocking[]) => {

      this.allClockings = clockings;

      this.clockingsListCopieForNewClocking = clockings.sort((n1, n2) => n2.numRefClocking - n1.numRefClocking);

      this.clockingsListCopieForCalculTotalClockingLate = clockings
      .filter(clocking => clocking.dateClocking.split('-')[1] == this.monthSelected)
      .sort((n1, n2) => n2.numRefClocking - n1.numRefClocking);

      this.currentMonth = this.monthsList.find(month => month.monthNbr == this.monthSelected).monthName;

      if (this.subjectSelectedId) { 
        if (this.subjectSelectedId == 8) {
          this.clockingsList = clockings
          .filter(clocking => (clocking.dateClocking.split('-')[1] == this.monthSelected) && (clocking.subjectId) && (clocking.subjectId !== 1))
          .sort((n1, n2) => n1.numRefClocking - n2.numRefClocking); 
        }
        else {
          this.clockingsList = clockings
          .filter(clocking => (clocking.dateClocking.split('-')[1] == this.monthSelected) && (clocking.subjectId == this.subjectSelectedId))
          .sort((n1, n2) => n1.numRefClocking - n2.numRefClocking);   
        }    
      } 
      else {
        this.clockingsList = clockings
        .filter(clocking => clocking.dateClocking.split('-')[1] == this.monthSelected)
        .sort((n1, n2) => n2.numRefClocking - n1.numRefClocking);
      }

      if (this.monthSelected == '05' && new Date(this.clockingsList[0].dateClocking).getDate() == 31) {
        this.showDeleteAllClockingsButtton = true;
      }
      else {
        this.showDeleteAllClockingsButtton = false;
      }

      let lastClockingByCurrentMonth = clockings
      .filter(clocking => clocking.dateClocking.split('-')[1] == this.monthSelected)
      .sort((n1, n2) => n2.numRefClocking - n1.numRefClocking)[0];
      if (lastClockingByCurrentMonth) this.vacationLimitDays = lastClockingByCurrentMonth.restVacationDays;
   
      this.minutePartList = [];
      if (this.clockingsListCopieForCalculTotalClockingLate.length > 0) {
        this.clockingsListCopieForCalculTotalClockingLate.forEach(clocking => {
            this.calculTotalClockingLate(clocking.timeClocking);
        })
      } else {
        this.totalClockingLate = 0;
        this.totalClockingLateByHoursMinute = '0 Min';
      }
      
      if (this.clockingsList.length > 0) {
        this.clockingsList.forEach(clocking => {
          this.getDayFromDateClocking(clocking);
        })
      }

      this.lastClockingFromList = clockings.sort((n1, n2) => n2.numRefClocking - n1.numRefClocking)[0].restVacationDays;

    });
  }

  OnPageChange(){
    document.body.scrollTop = document.documentElement.scrollTop = 0;
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

  getDayFromDateClocking(clocking: Clocking) {
    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    const d = new Date(clocking.dateClocking);
    clocking.day = weekday[d.getDay()];
    this.currentYear = d.getFullYear();
  }

  newClocking() {  
    let config: MatDialogConfig = {panelClass: "dialog-responsive"}
    const dialogRef = this.dialogService.open(ClockingFormForTabletComponent, config);

    dialogRef.componentInstance.arrayClockings = this.clockingsListCopieForNewClocking;
    dialogRef.componentInstance.vacationLimitDays = this.vacationLimitDays;
    dialogRef.componentInstance.currentMonthAndYearForVacation = this.currentMonthAndYearForVacation;
    dialogRef.componentInstance.monthSelected = this.monthSelected;
    dialogRef.componentInstance.lastClockingFromList = this.lastClockingFromList;
  }

  editClocking(clocking?: Clocking) {
    let config: MatDialogConfig = {panelClass: "dialog-responsive"}
    const dialogRef = this.dialogService.open(ClockingFormForTabletComponent, config);
    
    dialogRef.componentInstance.clocking = clocking;
    dialogRef.componentInstance.vacationLimitDays = this.vacationLimitDays;
    dialogRef.componentInstance.currentMonthAndYearForVacation = this.currentMonthAndYearForVacation;
    dialogRef.componentInstance.monthSelected = this.monthSelected;
  }

  deleteClocking(clockingKey) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this clocking!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.clockingService.delete(clockingKey);
        Swal.fire(
          'Clocking has been deleted successfully',
          '',
          'success'
        )
      }
    })
  }

  viewNote(clockingNote: string) {
    Swal.fire({
      text: clockingNote,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Close'
    });
  }

  deleteAllClockings(contentLoading) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete all clockings!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.modalRefLodaing = this.dialogService.open(contentLoading, {
          width: '20vw',
          height:'20vw',
          maxWidth: '100vw'
        });
        this.isLoading = true;

        this.allClockings.forEach(clockingForDesktop => {
          this.clockingService.delete(clockingForDesktop.key);
        });

        setTimeout(() => {
          this.isLoading = false;
          this.modalRefLodaing.close();

          Swal.fire(
            'Clockings has been deleted successfully',
            '',
            'success'
          ).then((res) => {})
        }, 20000);
      }
    })
  }

  ngOnDestroy() {
    this.subscriptionForGetAllClockings.unsubscribe();
  }

}