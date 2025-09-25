import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';

import { Subscription } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';
import firebase from 'firebase';

import { AuthService } from 'src/app/shared/services/auth.service';
import { UsersListService } from 'src/app/shared/services/list-users.service';
import { NotificationService } from 'src/app/shared/services/notification.service';

import { FirebaseUserModel } from 'src/app/shared/models/user.model';
import { Notification } from 'src/app/shared/models/notification.model';

import { languages, userItems } from './header-dummy-data';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit, OnDestroy {

  @Input() collapsed = false;
  @Input() screenWidth = 0;

  isDesktop: boolean;
  isConnected:boolean;
  user: firebase.User;
  userName: string;
  subscriptipn: Subscription;
  allUsers: FirebaseUserModel[] = [];

  canShowSearchAsOverlay = false;
  isOpenOverlaySearch = false;
  isOpenOverlayFlags = false;
  isOpenOverlayNotifs = false;
  isOpenOverlayUser = false;
  selectedLanguage: any;

  languages = languages;
  allNotifNotDone: Notification[]= [];
  userItems = userItems;

  subscriptionForGetAllNotifNotDone: Subscription;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkCanShowSearchAsOverlay(window.innerWidth);
  }

  constructor(
    private afAuth: AngularFireAuth, 
    public authService: AuthService, 
    private router: Router,
    public usersListService: UsersListService,
    public notificationService: NotificationService,
    public deviceService: DeviceDetectorService,
  ) {}

  ngOnInit() {
    this.isDesktop = this.deviceService.isDesktop();
    this.getUserData();
    this.getAllUsers();
    this.getAllNotificationsNotDone();
    this.checkCanShowSearchAsOverlay(window.innerWidth);
    this.selectedLanguage = this.languages[0];
  }

  getUserData() {
    this.subscriptipn = this.afAuth
      .authState
      .subscribe(user => {
        this.user = user;
        if(this.user && !this.user.displayName) {
          this.getNameFromEmail(this.user.email);
        }
    })
  }

  getNameFromEmail(email) {
    this.userName = email.substring(0, email.lastIndexOf("@"));
  }

  getAllUsers() {
    this.usersListService
    .getAll()
    .subscribe((users: FirebaseUserModel[]) => {
      this.allUsers = users;
    });
  }

  getAllNotificationsNotDone() {
    this.subscriptionForGetAllNotifNotDone = this.notificationService
    .getAll()
    .subscribe((notifications: Notification[]) => {
      this.allNotifNotDone = []; 
      notifications.forEach(notification => {
        if (notification.notifSubjectDone == false) {
          this.allNotifNotDone.push(notification);
        }
      })
      this.allNotifNotDone = this.allNotifNotDone.sort((n1, n2) => new Date(n2.formatDate).getTime() - new Date(n1.formatDate).getTime()).slice(0, 5);  
    });
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

  logout(){
    this.authService
      .doLogout()
      .then((res) => {
        this.router.navigate(['/login']);
        this.authService.isConnected.next(false);
        this.putCurrentUserConnected(this.user.email);
      }, (error) => {
        console.log("Logout error", error);
    });
  }
  

  putCurrentUserConnected(email: string) {
    let connectedUserFromList: FirebaseUserModel;
    connectedUserFromList = this.allUsers.find(user => user.email == email);
    connectedUserFromList.isConnected = false;
    this.usersListService.update(connectedUserFromList.key, connectedUserFromList);
  }

  getHeadClass(): string {
    let styleClass = '';
    if (this.collapsed && this.screenWidth > 768) {
      styleClass = 'head-trimmed';
    } else {
      styleClass = 'head-md-screen';
    }
    return styleClass;
  }

  checkCanShowSearchAsOverlay(innerWidth: number): void {
    if (innerWidth < 845) {
      this.canShowSearchAsOverlay = true;
    } else {
      this.canShowSearchAsOverlay = false;
    }
  }

  getTruncatedNameSubject(value: string, limit: number): string {
    if (!value) {
      return '';
    }
    return value.length > limit ? value.substring(0, limit) + '...' : value;
  }

  ngOnDestroy() {
    this.subscriptipn.unsubscribe();
  }
  
}