import { Component, OnInit, Output, EventEmitter, HostListener, ViewEncapsulation } from '@angular/core';
import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';

import { DeviceDetectorService } from 'ngx-device-detector';

import { INavbarData, fadeInOut } from './helper';
import { navbarDataHome, navbarDataForDesktop, navbarDataForTablet } from './nav-data';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  animations: [
    fadeInOut,
    trigger('rotate', [
      transition(':enter', [
        animate('1000ms',
          keyframes([
            style({transform: 'rotate(0deg)', offset: '0'}),
            style({transform: 'rotate(2turn)', offset: '1'}),
          ])
        )
      ])
    ])
  ],
  encapsulation: ViewEncapsulation.None
})

export class SidenavComponent implements OnInit {

  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  collapsed = false;
  screenWidth = 0;
  navbarDataHome = navbarDataHome;
  // navbarDataToDoList = navbarDataToDoList;
  navDataForDesktop = navbarDataForDesktop;
  navDataToShow: INavbarData [] = [];
  navDataForTablet = navbarDataForTablet;
  multiple: boolean = false;
  isDesktop: boolean;
  isTablet: boolean;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.screenWidth <= 768) {
      this.collapsed = false;
      this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
    }
  }

  constructor(public router: Router, private deviceService: DeviceDetectorService) {}

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
    this.isDesktop = this.deviceService.isDesktop();
    this.isTablet = this.deviceService.isTablet();
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
  }

  closeSidenav(): void {
    this.collapsed = false;
    this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
  }

  handleClick(item: INavbarData, event: MouseEvent): void {
    this.shrinkItems(item, event);
    item.expanded = !item.expanded;
  }

  getActiveClass(data: INavbarData): string {
    return this.router.url.includes(data.routeLink) ? 'active' : ''; 
  }

  shrinkItems(item: INavbarData, event: MouseEvent): void {
    if (!this.multiple) {
      if (this.isDesktop) {
        if (item.routeLink == 'to-do-list') {
          event.preventDefault(); 
          const url = this.router.serializeUrl(
            this.router.createUrlTree(['/to-do-list'])
          );
          window.open(url, '_blank');
        } else {
          this.router.navigate(['/' + item.routeLink]);
        }      
        for (let modelItem of this.navDataForDesktop) {
          if (item !== modelItem && modelItem.expanded) {
            modelItem.expanded = false;
          }
        }
      } else {
        this.router.navigate(['/' + item.routeLink]);
        for (let modelItem of this.navDataForTablet) {
          if (item !== modelItem && modelItem.expanded) {
            modelItem.expanded = false;
          }
        }
      }
    }
  }

  getItems() {
    if (this.isDesktop) {
      this.navDataToShow = this.navDataForDesktop;
    } else {
      this.navDataToShow = this.navDataForTablet;
    }
    return this.navDataToShow;
  }

}