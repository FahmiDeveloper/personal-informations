import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { DocumentFormMobileComponent } from './document-form-mobile/document-form-mobile.component';

import { DocumentService } from 'src/app/shared/services/document.service';

import { Document } from 'src/app/shared/models/document.model';
import { SubjectDocuments } from 'src/app/shared/models/subject-document.model';

@Component({
  selector: 'documents-list-mobile',
  templateUrl: './documents-list-mobile.component.html',
  styleUrls: ['./documents-list-mobile.scss']
})

export class DocumentsListForMobileComponent implements OnInit, OnDestroy {

  documentsList: Document[] = [];
  documentsListCopieForNewDocument: Document[] = [];

  p = 1;

  subjectDocuments: SubjectDocuments = new SubjectDocuments();

  documentRef: number;

  menuTopLeftPosition =  {x: '0', y: '0'} 

  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger: MatMenuTrigger; 

  subscriptionForGetAllDocuments: Subscription;

  constructor(
    public documentService: DocumentService,
    public dialogService: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.getAllDocuments();
  }

  getAllDocuments() {
    this.subscriptionForGetAllDocuments = this.documentService
    .getAll()
    .subscribe((documents: Document[]) => {

      this.documentsListCopieForNewDocument = documents.sort((n1, n2) => n2.numRefDocument - n1.numRefDocument);
 
      this.documentsList = documents
      .filter(document => (document.subjectDocumentsKey == this.subjectDocuments.key) && (document.documentRef == this.documentRef))
      .sort((n1, n2) => n2.numRefDocument - n1.numRefDocument);

    });
  }

  newDocument() {
    let config: MatDialogConfig = {
      panelClass: "dialog-responsive",
      width: '98vw',
      maxWidth: '100vw'
    }
    const dialogRef = this.dialogService.open(DocumentFormMobileComponent, config);

    dialogRef.componentInstance.arrayDocuments = this.documentsListCopieForNewDocument;
    dialogRef.componentInstance.subjectDocumentsKey = this.subjectDocuments.key;
    dialogRef.componentInstance.documentRef = this.documentRef;
  }

  editDocument(document?: Document) {
    let config: MatDialogConfig = {
      panelClass: "dialog-responsive",
      width: '98vw',
      maxWidth: '100vw'
    }
    const dialogRef = this.dialogService.open(DocumentFormMobileComponent, config);
    
    dialogRef.componentInstance.document = document;
    dialogRef.componentInstance.documentRef = this.documentRef;
  }

  deleteDocument(documentKey) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this document!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.documentService.delete(documentKey);
        Swal.fire(
          'Document has been deleted successfully',
          '',
          'success'
        )
      }
    })
  }

  copyDocumentContent(contentDocumentContent: string){
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = contentDocumentContent;
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

  openMenuTrigger(event: MouseEvent, document: Document) { 
    // preventDefault avoids to show the visualization of the right-click menu of the browser 
    event.preventDefault(); 

    // we record the mouse position in our object 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 

    // we open the menu 
    // we pass to the menu the information about our object 
    this.matMenuTrigger.menuData = {document: document};

    // we open the menu 
    this.matMenuTrigger.openMenu(); 
  }

  ngOnDestroy() {
    this.subscriptionForGetAllDocuments.unsubscribe();
  }

}
