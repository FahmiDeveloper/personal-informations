import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})

export class ShowNotificationAndroidService {

  constructor() { }

  // Show push notification
  showNotificationAndroid(title: string, body: string) {
    LocalNotifications.requestPermissions().then(permission => {
      if (permission.display === 'granted') {
        // Planifier une notification
        return LocalNotifications.schedule({
          notifications: [
            {
              id: 1,
              title: title,
              body: body
            }
          ]
        });
      } else {
        console.log('Permission for local notifications denied');
        return Promise.reject('Permission denied');
      }
    })
    .then(() => {
      console.log('Notification scheduled successfully');
    })
    .catch(error => {
      console.error('Error setting up local notifications:', error);
    });

    // Écouter les clics sur les notifications
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('Notification cliquée :', notification);
    });
  }
}