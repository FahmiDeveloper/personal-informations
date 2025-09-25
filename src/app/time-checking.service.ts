import { Injectable, OnDestroy } from '@angular/core';

import { ShowNotificationDesktopService } from './show-notification-desktop.service'; // Assuming you have a NotificationService
import { ShowNotificationAndroidService } from 'src/app/show-notification-android.service';
import { NotificationService } from './shared/services/notification.service';

import { Reminder } from './shared/models/reminder.model';
import { Notification } from 'src/app/shared/models/notification.model';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class TimeCheckingService implements OnDestroy {

  private interval: any;
  originalAllReminders:  Reminder[] = [];
  notificationForSave: Notification = {};
  allNotifications: Notification[]= [];

  subscriptionForGetAllNotifications: Subscription;

  constructor(
    public showNotificationDesktopService: ShowNotificationDesktopService,
    public showNotificationAndroidService: ShowNotificationAndroidService,
    public notificationService: NotificationService,
  ) {
    this.subscriptionForGetAllNotifications = this.notificationService
    .getAll()
    .subscribe((notifications: Notification[]) => {
      this.allNotifications = notifications;
    });
  }

  startCheckingTime(allReminders: Reminder[], isDesktop: boolean) {
    this.originalAllReminders = allReminders;  // This is the target date you want to compare with

    this.stopCheckingTime(); // Ensure no interval is already running

    this.interval = setInterval(() => {
      const currentTime = this.formatDate(new Date()); 
      const bodyNotif = 'Your reminder is starting now !'; 

      // Loop through the target dates array
      allReminders.forEach(reminder => {
        this.notificationForSave = {};
        if (currentTime === reminder.targetDate) {
          if (isDesktop) {
            this.showNotificationDesktopService.showNotificationDesktop(`${reminder.subject}`, `${bodyNotif}`);
          } else {
            this.showNotificationAndroidService.showNotificationAndroid(reminder.subject, `${bodyNotif}`);
          }

          this.notificationForSave.date = reminder.date;
          this.notificationForSave.time = reminder.time;
          this.notificationForSave.subject = reminder.subject;
          this.notificationForSave.formatDate = reminder.targetDate;
          this.notificationForSave.notifSubjectDone = false;
          this.notificationForSave.reminderKey = reminder.key;
          this.notificationForSave.reminderForId = reminder.reminderFor;

          if (this.allNotifications.length) {
            if (!this.allNotifications.filter(notification => (notification.subject == reminder.subject) && (notification.formatDate == reminder.targetDate)).length) {        
              this.notificationService.create(this.notificationForSave);
            }
          } else {
            this.notificationService.create(this.notificationForSave);
          }
          
          this.removeReminder(reminder);  // Optionally, remove the target date after it matches
        }
      });
    }, 1000);  // Check every second
  }

  // Remove a target date from the array after it's triggered
  removeReminder(reminder: Reminder) {
    const index = this.originalAllReminders.indexOf(reminder);
    if (index > -1) {
      this.originalAllReminders.splice(index, 1);
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed, so add 1
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
  
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }

  // Stop checking (clear interval)
  stopCheckingTime() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  ngOnDestroy() {
    this.subscriptionForGetAllNotifications.unsubscribe();
  }
}