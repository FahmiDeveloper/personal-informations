import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatTableDataSource } from '@angular/material/table';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { ReminderFormForMobileComponent } from './reminder-form-for-mobile/reminder-form-for-mobile.component';

import { ReminderService } from 'src/app/shared/services/reminder.service';
import { NotificationService } from 'src/app/shared/services/notification.service';

import { Reminder } from 'src/app/shared/models/reminder.model';
import { Notification } from 'src/app/shared/models/notification.model';

@Component({
  selector: 'reminders-for-mobile',
  templateUrl: './reminders-for-mobile.component.html',
  styleUrls: ['./reminders-for-mobile.scss']
})

export class RemindersForMobileComponent implements OnInit, OnDestroy {

  dataSource = new MatTableDataSource<Reminder>();
  displayedColumns: string[] = ['day', 'date', 'time', 'subject', 'star'];

  allReminders: Reminder[]= [];
  allNotifications: Notification[]= [];

  currentYear: number;
  currNotifToUpdate: Notification = {};

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  subscriptionForGetAllReminders: Subscription;
  subscriptionForGetAllNotifications: Subscription;
  
  constructor(
    public reminderService: ReminderService,
    public notificationService: NotificationService, 
    public dialogService: MatDialog
  ) {}

  ngOnInit() {
    this.getAllReminders();
    this.getAllNotifications();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getAllReminders() {
    this.subscriptionForGetAllReminders = this.reminderService
    .getAll()
    .subscribe((reminders: Reminder[]) => {

      this.allReminders = reminders;

      this.dataSource.data = reminders.sort((n1, n2) => new Date(n1.targetDate).getTime() - new Date(n2.targetDate).getTime());
      
      if (this.dataSource.data.length > 0) {
        this.dataSource.data.forEach(reminder => {
          this.getDayFromDateReminder(reminder);
          this.checkIfReminderIsDone(reminder);
        })
      }
    });
  }

  getAllNotifications() {
    this.subscriptionForGetAllNotifications = this.notificationService
    .getAll()
    .subscribe((notifications: Notification[]) => {
      this.allNotifications = notifications;
    });
  }

  OnPageChange(elem: HTMLElement){
    elem.scrollIntoView();
  }

  getDayFromDateReminder(reminder: Reminder) {
    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    const d = new Date(reminder.date);
    reminder.day = weekday[d.getDay()];
    this.currentYear = d.getFullYear();
  }

  checkIfReminderIsDone(reminder: Reminder) {
    const currentTime = this.formatDate(new Date());
    reminder.reminderNotDone = reminder.targetDate < currentTime ? true : false;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed, so add 1
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
  
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }

  newReminder() {
    let config: MatDialogConfig = {
      panelClass: "dialog-responsive",
      width: '98vw',
      maxWidth: '100vw'
    }
    this.dialogService.open(ReminderFormForMobileComponent, config);
  }

  editReminder(reminder?: Reminder) {
    let config: MatDialogConfig = {
      panelClass: "dialog-responsive",
      width: '98vw',
      maxWidth: '100vw'
    }
    const dialogRef = this.dialogService.open(ReminderFormForMobileComponent, config);

    dialogRef.componentInstance.reminder = reminder;
    dialogRef.componentInstance.allNotifications = this.allNotifications;
  }

  deleteReminder(reminder: Reminder) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this reminder!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.currNotifToUpdate = this.allNotifications.find(notif => notif.reminderKey == reminder.key);
        if (this.currNotifToUpdate) {
          this.currNotifToUpdate.notifSubjectDone = true;
          this.notificationService.update(this.currNotifToUpdate.key, this.currNotifToUpdate);
        } 
        this.reminderService.delete(reminder.key);
        Swal.fire(
          'Reminder has been deleted successfully',
          '',
          'success'
        )
      }
    })
  }

  ngOnDestroy() {
    this.subscriptionForGetAllReminders.unsubscribe();
    this.subscriptionForGetAllNotifications.unsubscribe();
  }

}