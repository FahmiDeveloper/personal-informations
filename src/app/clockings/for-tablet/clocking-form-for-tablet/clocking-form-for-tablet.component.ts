import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

import * as moment from 'moment';
import Swal from 'sweetalert2';

import { ClockingService } from 'src/app/shared/services/clocking.service';

import { Clocking, SubjectList } from 'src/app/shared/models/clocking.model';

@Component({
  selector: 'clocking-form-for-tablet',
  templateUrl: './clocking-form-for-tablet.component.html',
  styleUrls: ['./clocking-form-for-tablet.scss']
})

export class ClockingFormForTabletComponent implements OnInit {

  arrayClockings: Clocking[];

  clocking: Clocking = new Clocking();

  vacationLimitDays: number;
  currentMonthAndYearForVacation: string;
  monthSelected: string ;
  showVacationLimitDays: boolean;
  lastClockingFromList: number;
  
  formControl = new FormControl('', [Validators.required]);

  subjectList: SubjectList[] = [
    {id: 1, subjectName: 'Work on sunday'},
    {id: 2, subjectName: 'Take vacation'},
    {id: 3, subjectName: 'Take one hour'},
    {id: 4, subjectName: 'Take two hours'},
    {id: 5, subjectName: 'Take three hours'},
    {id: 6, subjectName: 'Work half day'},
    {id: 7, subjectName: 'Public holiday'}  
  ];

  constructor(
    public clockingService: ClockingService, 
    public dialogRef: MatDialogRef<ClockingFormForTabletComponent>
  ) {}

  ngOnInit() {
    if (!this.clocking.key) {
      this.clocking.dateClocking = moment().format('YYYY-MM-DD');
      this.clocking.timeClocking = moment().format('HH:mm');

      if (new Date(this.clocking.dateClocking).getDate() == 1) {
        this.vacationLimitDays = this.lastClockingFromList + 1.75;
      }
      else {
        this.vacationLimitDays = this.lastClockingFromList; 
      }
    } 
    else {
      this.vacationLimitDays =  this.clocking.restVacationDays; 
    }
    if (this.monthSelected == String(new Date().getMonth()+ 1)  || (this.monthSelected == '0' + String(new Date().getMonth()+ 1))) {this.showVacationLimitDays = true;} 
    else {this.showVacationLimitDays = false;}
  }

  save() {
    if (!this.clocking.key) {
      if (this.clocking.subjectId == 2) {
        const start = new Date(this.clocking.dateClocking);
        const end = new Date(this.clocking.dateEndVaction);
        const dates = this.getDatesBetween(start, end);  

        for (let i = 0;i < dates.length; i++) {
          this.clocking.dateClocking = dates[i];
          if (this.arrayClockings[0] && this.arrayClockings[0].numRefClocking) this.clocking.numRefClocking = this.arrayClockings[0].numRefClocking + (i + 1);
          if (this.arrayClockings[0] && (this.arrayClockings[0].restVacationDays || this.arrayClockings[0].restVacationDays === 0)) this.clocking.restVacationDays = this.arrayClockings[0].restVacationDays - (i + 1);
          this.clocking.subjectId = 2;
          this.clocking.timeClocking = '';
          this.clockingService.create(this.clocking);
        }
      } else {
        this.clocking.restVacationDays = this.vacationLimitDays;
        if (this.arrayClockings[0] && this.arrayClockings[0].numRefClocking) {
          this.clocking.numRefClocking = this.arrayClockings[0].numRefClocking + 1;
        } else {
          this.clocking.numRefClocking = 1;
        }
        this.clockingService.create(this.clocking);  
      }
      Swal.fire(
        'New clocking(s) added successfully',
        '',
        'success'
      )
    } else {
        this.clocking.restVacationDays = this.vacationLimitDays;
        
        if (this.clocking.key) {
    
          this.clockingService.update(this.clocking.key, this.clocking);
    
          Swal.fire(
            'Clocking data has been updated successfully',
            '',
            'success'
          )
    
        } 
    }  
    this.close();
  }

  getDatesBetween(startDate: Date, endDate: Date): string[] {
    const dateArray: string[] = [];
    let currentDate = new Date(startDate);
  
    while (currentDate <= endDate) {
      // Format date as 'YYYY-MM-DD'
      const formattedDate = currentDate.toLocaleDateString('en-CA'); // 'en-CA' is the locale for 'YYYY-MM-DD' format
      dateArray.push(formattedDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dateArray;
  }

  getErrorMessage() {
    return this.formControl.hasError('required') ? 'Required field' :'';
  }

  close() {
    this.dialogRef.close();
  }

  selectSubject() {
    this.vacationLimitDays = this.clocking.subjectId == 6 ? this.vacationLimitDays - 0.5 : this.vacationLimitDays;
  }

  minimizeFromVacLimitDays() {
    this.vacationLimitDays = this.vacationLimitDays - 1;
  }

}
