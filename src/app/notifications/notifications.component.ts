import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { DeviceDetectorService } from 'ngx-device-detector';
import { Subscription } from 'rxjs';

import { NotificationService } from 'src/app/shared/services/notification.service';

import { Notification } from 'src/app/shared/models/notification.model';

@Component({
  selector: 'notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.scss']
})

export class NotificationsComponent implements OnInit, OnDestroy {

  notificationsList: Notification[] = [];
  allNotifications: Notification[]= [];

  p: number = 1;
  showNotDone: boolean;
  content = '';
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;

  subscriptionForGetAllNotifications: Subscription;
  
  constructor(
    public notificationService: NotificationService,
    public deviceService: DeviceDetectorService,
    public dialogService: MatDialog
  ) {}

  ngOnInit() {
    this.isDesktop = this.deviceService.isDesktop();
    this.isTablet = this.deviceService.isTablet();
    this.isMobile = this.deviceService.isMobile();
    this.getAllNotifications();
  }

  getAllNotifications() {
    this.subscriptionForGetAllNotifications = this.notificationService
    .getAll()
    .subscribe((notifications: Notification[]) => {

      this.allNotifications = notifications;

      if (this.content) {
        this.notificationsList = notifications.filter(notification => notification.subject.toLowerCase().includes(this.content.toLowerCase()));
        this.notificationsList = this.notificationsList.sort((n1, n2) =>  new Date(n2.formatDate).getTime() - new Date(n1.formatDate).getTime());
      }

      else if (this.showNotDone) {
        this.notificationsList = notifications.filter(notification => notification.notifSubjectDone == false).sort((n1, n2) => new Date(n2.formatDate).getTime() - new Date(n1.formatDate).getTime());
      }

      else {
        this.notificationsList = notifications.sort((n1, n2) => new Date(n2.formatDate).getTime() - new Date(n1.formatDate).getTime());
      }
   
    });
  }

  OnPageChange(){
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  getTimeAgo(notificationDate: string): string {
    const now = new Date();
    const notifDate = new Date(notificationDate);
    const diffInSeconds = Math.floor((now.getTime() - notifDate.getTime()) / 1000);
  
    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    } else {
      return notifDate.toLocaleDateString(); // Show full date after a week
    }
  }

  ngOnDestroy() {
    this.subscriptionForGetAllNotifications.unsubscribe();
  }

}