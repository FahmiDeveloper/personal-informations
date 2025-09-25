import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ShowNotificationDesktopService {

  constructor() { }

  // Show push notification
  showNotificationDesktop(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: 'assets/reminder.png'
      });
    }
  }
}