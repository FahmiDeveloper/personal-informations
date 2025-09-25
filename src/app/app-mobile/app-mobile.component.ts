import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

// import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription } from 'rxjs';
import firebase from 'firebase';

import { AuthService } from '../shared/services/auth.service';
import { UsersListService } from '../shared/services/list-users.service';

import { FirebaseUserModel } from '../shared/models/user.model';
import { Notification } from 'src/app/shared/models/notification.model';
import { NotificationService } from '../shared/services/notification.service';

// @UntilDestroy()

@Component({
  selector: 'app-mobile',
  templateUrl: './app-mobile.component.html',
  styleUrls: ['./app-mobile.component.scss'],
})

export class AppMobileComponent implements OnInit {

  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  user: firebase.User;
  userName: string;
  subscriptipn: Subscription;
  allUsers: FirebaseUserModel[] = [];
  isConnected:boolean;

  sideNavList: SideNavList[] = [
    {icon: 'home', text: 'Home', link: '/home'},
    {icon: 'view_list', text: 'To Do List', link: '/to-do-list'},
    {icon: 'movie', text: 'Movies', link: '/movies-for-mobile'},
    {icon: 'insert_photo', text: 'Animes', link: '/animes-for-mobile'}, 
    {icon: 'theaters', text: 'Series', link: '/series-for-mobile'},
    {icon: 'insert_drive_file', text: 'Notes', link: '/notes-for-mobile'},
    {icon: 'access_time', text: 'Clockings', link: '/clockings-for-mobile'},
    {icon: 'calendar_today', text: 'Expirations', link: '/expirations-for-mobile'},
    {icon: 'attach_money', text: 'Debts', link: '/debts-for-mobile'},
    {icon: 'attachment', text: 'Files', link: '/files'},
    {icon: 'lock_open', text: 'Passwords', link: '/passwords-for-mobile'},
    {icon: 'local_hospital', text: 'Medications', link: '/medications-for-mobile'},
    {icon: 'format_align_justify', text: 'Documents', link: '/documents-for-mobile'},
    {icon: 'notifications_none', text: 'Reminders', link: '/reminders-for-mobile'}
  ];

  allNotifNotDone: Notification[]= [];
  subscriptionForGetAllNotifNotDone: Subscription;
  isOpenOverlayNotifs = false;

  constructor(
    private observer: BreakpointObserver, 
    private router: Router,
    private afAuth: AngularFireAuth, 
    public authService: AuthService, 
    public usersListService: UsersListService,
    public notificationService: NotificationService  
  ) {}

  ngOnInit() {
    this.checkIfUserIsConnected();
    this.getUserData();
    this.getAllUsers();
    this.getAllNotificationsNotDone();
  }

  checkIfUserIsConnected() {
    this.authService.isConnected.subscribe(res=>{
      this.isConnected=res;
    })
  }

  ngAfterViewInit() {
    // this.observer
    //   .observe(['(max-width: 800px)'])
    //   .pipe(delay(1), untilDestroyed(this))
    //   .subscribe((res) => {
    //     if (res.matches) {
    //       this.sidenav.mode = 'over';
    //       this.sidenav.close();
    //     } else {
    //       this.sidenav.mode = 'side';
    //       this.sidenav.open();
    //     }
    //   });

    // this.router.events
    //   .pipe(
    //     untilDestroyed(this),
    //     filter((e) => e instanceof NavigationEnd)
    //   )
    //   .subscribe(() => {
    //     if (this.sidenav.mode === 'over') {
    //       this.sidenav.close();
    //     }
    //   });
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

  logout(){
    this.authService
      .doLogout()
      .then((res) => {
        this.router.navigate(['/login']);
        this.authService.isConnected.next(false);
        this.putCurrentUserConnected(this.user.email);
        this.sidenav.close();
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

  redirectToSideNavContext(sideNavContext: SideNavList) {
    this.router.navigate([sideNavContext.link]);
    this.sidenav.close();
  }

  getTruncatedNameSubject(value: string, limit: number): string {
    if (!value) {
      return '';
    }
    return value.length > limit ? value.substring(0, limit) + '...' : value;
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
}

export interface SideNavList {
  icon: string,
  text: string,
  link: string
}