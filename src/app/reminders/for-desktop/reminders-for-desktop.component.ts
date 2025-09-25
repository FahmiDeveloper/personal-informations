import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { ReminderFormForDesktopComponent } from './reminder-form-for-desktop/reminder-form-for-desktop.component';

import { ReminderService } from 'src/app/shared/services/reminder.service';
import { NotificationService } from 'src/app/shared/services/notification.service';

import { Reminder } from 'src/app/shared/models/reminder.model';
import { Notification } from 'src/app/shared/models/notification.model';

@Component({
  selector: 'reminders-for-desktop',
  templateUrl: './reminders-for-desktop.component.html',
  styleUrls: ['./reminders-for-desktop.scss']
})

export class RemindersForDesktopComponent implements OnInit, OnDestroy {

  remindersList: Reminder[] = [];
  allReminders: Reminder[]= [];
  allNotifications: Notification[]= [];

  p: number = 1;
  currentYear: number;

  menuTopLeftPosition =  {x: '0', y: '0'} 

  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger: MatMenuTrigger; 

  subscriptionForGetAllReminders: Subscription;
  subscriptionForGetAllNotifications: Subscription;
  currNotifToUpdate: Notification = {};
  
  constructor(
    public reminderService: ReminderService,
    public notificationService: NotificationService, 
    public dialogService: MatDialog
  ) {}

  ngOnInit() {
    this.getAllReminders();
    this.getAllNotifications();
  }

  getAllReminders() {
    this.subscriptionForGetAllReminders = this.reminderService
    .getAll()
    .subscribe((reminders: Reminder[]) => {

      this.allReminders = reminders;

      this.remindersList = reminders.sort((n1, n2) => new Date(n1.targetDate).getTime() - new Date(n2.targetDate).getTime());
      
      if (this.remindersList.length > 0) {
        this.remindersList.forEach(reminder => {
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

  OnPageChange(){
    document.body.scrollTop = document.documentElement.scrollTop = 0;
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
    let config: MatDialogConfig = {panelClass: "dialog-responsive"}
    const dialogRef = this.dialogService.open(ReminderFormForDesktopComponent, config);
  }

  editReminder(reminder?: Reminder) {
    let config: MatDialogConfig = {panelClass: "dialog-responsive"}
    const dialogRef = this.dialogService.open(ReminderFormForDesktopComponent, config);
    
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

  onRightClick(event: MouseEvent, reminder: Reminder) { 
    // preventDefault avoids to show the visualization of the right-click menu of the browser 
    event.preventDefault(); 

    // we record the mouse position in our object 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 

    // we open the menu 
    // we pass to the menu the information about our object 
    this.matMenuTrigger.menuData = {reminder: reminder};

    // we open the menu 
    this.matMenuTrigger.openMenu(); 
  }

  ngOnDestroy() {
    this.subscriptionForGetAllReminders.unsubscribe();
    this.subscriptionForGetAllNotifications.unsubscribe();
  }

}