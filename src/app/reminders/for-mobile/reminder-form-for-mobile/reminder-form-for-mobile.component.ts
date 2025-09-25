import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

import * as moment from 'moment';
import Swal from 'sweetalert2';

import { ReminderService } from 'src/app/shared/services/reminder.service';

import { Reminder, ReminderForList } from 'src/app/shared/models/reminder.model';
import { Notification } from 'src/app/shared/models/notification.model';
import { NotificationService } from 'src/app/shared/services/notification.service';

@Component({
  selector: 'reminder-form-for-mobile',
  templateUrl: './reminder-form-for-mobile.component.html',
  styleUrls: ['./reminder-form-for-mobile.scss']
})

export class ReminderFormForMobileComponent implements OnInit {

  allNotifications: Notification[];

  reminder: Reminder = new Reminder();
  currNotifToUpdate: Notification = {};
  
  formControl = new FormControl('', [Validators.required]);

  valueDateBeforeUpdate: string;
  valueTimeBeforeUpdate: string;
  valuereminderForBeforeUpdate: number;
  valueSubjectBeforeUpdate: string;

  reminderForList: ReminderForList[] = [
    {id: 1, reminderForName: 'Movie'},
    {id: 2, reminderForName: 'Anime'},
    {id: 3, reminderForName: 'Serie'},
    {id: 4, reminderForName: 'Note'},
    {id: 5, reminderForName: 'Clocking'},
    {id: 6, reminderForName: 'Expiration'},
    {id: 7, reminderForName: 'Debt'},
    {id: 8, reminderForName: 'File'},
    {id: 9, reminderForName: 'Password'},
    {id: 10, reminderForName: 'Medication'},
    {id: 11, reminderForName: 'Document'},
    {id: 12, reminderForName: 'Other'}     
  ];

  constructor(
    public reminderService: ReminderService,
    public notificationService: NotificationService, 
    public dialogRef: MatDialogRef<ReminderFormForMobileComponent>
  ) {}

  ngOnInit() {
    if (!this.reminder.key) {
      this.reminder.date = moment().format('YYYY-MM-DD');
      this.reminder.time = moment().format('HH:mm');
    } else {
      this.valueDateBeforeUpdate = this.reminder.date;
      this.valueTimeBeforeUpdate = this.reminder.time;
      this.valuereminderForBeforeUpdate = this.reminder.reminderFor;
      this.valueSubjectBeforeUpdate = this.reminder.subject;
    } 
  }

  save() {
    this.reminder.targetDate = this.reminder.date + ' ' + this.reminder.time;
    if (this.reminder.key) {

      if ((this.valueDateBeforeUpdate !== this.reminder.date) || (this.valueTimeBeforeUpdate !== this.reminder.time)) {
        this.currNotifToUpdate = this.allNotifications.find(notif => notif.reminderKey == this.reminder.key);
        if (this.currNotifToUpdate) {
          this.currNotifToUpdate.notifSubjectDone = true;
          this.notificationService.update(this.currNotifToUpdate.key, this.currNotifToUpdate);
        }   
      }

      this.reminderService.update(this.reminder.key, this.reminder);

      Swal.fire(
        'Reminder data has been updated successfully',
        '',
        'success'
      )

    } else {
      this.reminderService.create(this.reminder);

      Swal.fire(
      'New reminder added successfully',
      '',
      'success'
      )

    }
    this.close();
  }

  getErrorMessage() {
    return this.formControl.hasError('required') ? 'Required field' :'';
  }

  close() {
    this.dialogRef.close();
  }

}