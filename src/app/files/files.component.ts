import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { DeviceDetectorService } from 'ngx-device-detector';
import { NgNavigatorShareService } from 'ng-navigator-share';

import { NewOrEditLinkComponent } from './new-or-edit-link/new-or-edit-link.component';

import { AuthService } from '../shared/services/auth.service';
import { LinkService } from '../shared/services/link.service';
import { UserService } from '../shared/services/user.service';
import { UsersListService } from '../shared/services/list-users.service';

import { Link } from '../shared/models/link.model';
import { FileUpload, TypesFiles } from '../shared/models/file-upload.model';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})

export class FilesComponent implements OnInit, OnDestroy {

  linksList: Link[]= [];
  arrayLinksForNewLink: Link[]= [];

  p = 1;

  content = '';
  numContextFile: number;
  typeFile: TypesFiles;
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  defaultArrayFiles: FileUpload[] = [];
  angularContext = false;
  otherContext = false;
  itemsPerPage: number;
  orientation = '';

  menuTopLeftPosition =  {x: '0', y: '0'} 

  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;

  subscriptionForGetAllLinks: Subscription;

  typesFiles: TypesFiles[] = [
    {id: 1, title: 'Pictures', type: 'Picture', icon: '/assets/pictures/picture-file.jpg'},
    {id: 2, title: 'Pdf', type: 'Pdf', icon: '/assets/pictures/pdf-file.jpg'},
    {id: 3, title: 'Excel', type: 'Excel', icon: '/assets/pictures/excel-file.png'}, 
    {id: 4, title: 'Text doc', type: 'Text doc', icon: '/assets/pictures/txt-file.PNG'},
    {id: 5, title: 'Zip', type: 'Zip', icon: '/assets/pictures/zip-file.PNG'},
    {id: 6, title: 'Links', type: 'Links', icon: '/assets/pictures/links.png'},
    {id: 7, title: 'Word', type: 'Word', icon: '/assets/pictures/word-file.jpg'}
  ];
  clickShowLinks: boolean;

  constructor(
    private deviceService: DeviceDetectorService,
    protected ngNavigatorShareService: NgNavigatorShareService,
    private linkService: LinkService,
    public userService: UserService,
    public usersListService: UsersListService,
    public authService: AuthService,
    public dialogService: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.itemsPerPage = window.innerWidth <= 1366 ? 4 : 8;
    this.isDesktop = this.deviceService.isDesktop();
    this.isTablet = this.deviceService.isTablet();
    this.isMobile = this.deviceService.isMobile();

    if(window.innerHeight > window.innerWidth){
      this.orientation = 'Portrait';    
    } else {
      this.orientation = 'Landscape';
    }

    window.matchMedia("(orientation: portrait)").addEventListener("change", e => {
      const portrait = e.matches;
  
      if (portrait) {
        this.orientation = 'Portrait';
      } else {
        this.orientation = 'Landscape';
      }
    });

    if (this.isMobile) {document.body.scrollTop = document.documentElement.scrollTop = 0;}
  }

  openListFiles(contentListFiles, contentLinks, typeFile: TypesFiles) {
    this.typeFile = typeFile;
    this.numContextFile = null;

    let configMobile: MatDialogConfig = {
      panelClass: "dialog-responsive",
      width: '98vw',
      maxWidth: '100vw'
    }

    if (this.typeFile.id == 6) {
      this.content = '';
      this.angularContext = false;
      this.otherContext = false;
      this.clickShowLinks = true;
      this.getAllLinks();
      if (this.isMobile) {
        this.dialogService.open(contentLinks, configMobile);
      } else {
        this.dialogService.open(contentLinks, {width: '800px'});
      }
    } else {
      this.clickShowLinks = false;
      if (this.isMobile) {
        this.dialogService.open(contentListFiles, configMobile);
      } else {
        this.dialogService.open(contentListFiles, {width: '800px'});
      }   
    } 
  }

  getAllLinks() {
    this.subscriptionForGetAllLinks = this.linkService
    .getAll()
    .subscribe(links => {
      this.arrayLinksForNewLink = links.sort((n1, n2) => n2.numRefLink - n1.numRefLink);

      if (this.angularContext && this.content) {
        this.linksList = links.filter(link => (link.typeLinkId == 1) && (link.content.toLowerCase().includes(this.content.toLowerCase()))).sort((n1, n2) => n2.numRefLink - n1.numRefLink);
      } 
      else if (this.angularContext && !this.content) {
        this.linksList = links.filter(link => (link.typeLinkId == 1)).sort((n1, n2) => n2.numRefLink - n1.numRefLink);
      } 
      else if (this.otherContext && this.content) {
        this.linksList = links.filter(link => (link.typeLinkId == 2) && (link.content.toLowerCase().includes(this.content.toLowerCase()))).sort((n1, n2) => n2.numRefLink - n1.numRefLink);
      } 
      else if (this.otherContext && !this.content) {
        this.linksList = links.filter(link => (link.typeLinkId == 2)).sort((n1, n2) => n2.numRefLink - n1.numRefLink);
      } 
      else this.linksList = links.sort((n1, n2) => n2.numRefLink - n1.numRefLink);
      
    });
  }

  newLink() {
    if (this.isMobile) {
      let config: MatDialogConfig = {
        panelClass: "dialog-responsive",
        width: '98vw',
        maxWidth: '100vw'
      }
      const dialogRef = this.dialogService.open(NewOrEditLinkComponent, config);

      dialogRef.componentInstance.typeLinkId = this.angularContext ? 1 : 2;
      dialogRef.componentInstance.arrayLinks = this.arrayLinksForNewLink;
      dialogRef.componentInstance.isMobile = this.isMobile;
      dialogRef.componentInstance.modalRef = dialogRef;
    } else {
      let config: MatDialogConfig = {panelClass: "dialog-responsive"}
      const dialogRef = this.dialogService.open(NewOrEditLinkComponent, config);

      dialogRef.componentInstance.typeLinkId = this.angularContext ? 1 : 2;
      dialogRef.componentInstance.arrayLinks = this.arrayLinksForNewLink;
      dialogRef.componentInstance.isMobile = this.isMobile;
      dialogRef.componentInstance.modalRef = dialogRef;
    }
  }

  editLink(link?: Link) {
    if (this.isMobile) {
      let config: MatDialogConfig = {
        panelClass: "dialog-responsive",
        width: '98vw',
        maxWidth: '100vw'
      }
      const dialogRef = this.dialogService.open(NewOrEditLinkComponent, config);

      dialogRef.componentInstance.link = link;
      dialogRef.componentInstance.isMobile = this.isMobile;
      dialogRef.componentInstance.modalRef = dialogRef;
      
    } else {
      let config: MatDialogConfig = {panelClass: "dialog-responsive"}
      const dialogRef = this.dialogService.open(NewOrEditLinkComponent, config);

      dialogRef.componentInstance.link = link;
      dialogRef.componentInstance.isMobile = this.isMobile;
      dialogRef.componentInstance.modalRef = dialogRef;
      
    }
  }

  shareLink(link: Link) {
    if (this.isMobile) {
      if (!this.ngNavigatorShareService.canShare()) {
        alert(`This service/api is not supported in your Browser`);
        return;
      }

      this.ngNavigatorShareService.share({
        title: link.content,
        text: '',
        url: link.path
      }).then( (response) => {
        console.log(response);
      })
      .catch( (error) => {
        console.log(error);
      });
    } else
    window.open("https://web.whatsapp.com/send?text=" + link.path,'_blank');
  }

  getRefContextFile(refContextFile: number) {
    this.numContextFile = refContextFile;
  }

  getDefaultArrayFiles(defaultArrayFiles:FileUpload[]) {
    this.defaultArrayFiles = defaultArrayFiles;
  }

  ngOnDestroy() {
    if (this.subscriptionForGetAllLinks) this.subscriptionForGetAllLinks.unsubscribe();
  }

  checkAngularContext() {
    if (this.angularContext == true) this.otherContext = false;
    if (this.content) this.content = '';
    this.getAllLinks();
  }

  checkotherContext() {
    if (this.otherContext == true) this.angularContext = false;
    if (this.content) this.content = '';
    this.getAllLinks();
  }

  deleteLink(linkKey) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this link!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.linkService.delete(linkKey);
        Swal.fire(
          'Link has been deleted successfully',
          '',
          'success'
        )
      }
    })
  }

  onRightClick(event: MouseEvent, link: Link) { 
    // preventDefault avoids to show the visualization of the right-click menu of the browser 
    event.preventDefault(); 

    // we record the mouse position in our object 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 

    // we open the menu 
    // we pass to the menu the information about our object 
     this.matMenuTrigger.menuData = {link: link};

    // we open the menu 
    this.matMenuTrigger.openMenu(); 
  }

  openMenuTrigger(event: MouseEvent, link: Link) { 
    // preventDefault avoids to show the visualization of the right-click menu of the browser 
    event.preventDefault(); 

    // we record the mouse position in our object 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 

    // we open the menu 
    // we pass to the menu the information about our object 
     this.matMenuTrigger.menuData = {link: link};

    // we open the menu 
    this.matMenuTrigger.openMenu(); 
  }
  
  copyText(link: Link){
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = link.content;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.showSnackbarTopPosition();
  }

  showSnackbarTopPosition() {
    this.snackBar.open('Text copied', 'Done', {
      duration: 2000,
      verticalPosition: "bottom", // Allowed values are  'top' | 'bottom'
      horizontalPosition: "center" // Allowed values are 'start' | 'center' | 'end' | 'left' | 'right'
    });
  }

  viewContentLink(linkContent: string) {
    Swal.fire({
      text: linkContent,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Close'
    }).then();
  }
  
}