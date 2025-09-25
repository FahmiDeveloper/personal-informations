import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { SubjectDocumentsFormMobileComponent } from './subject-documents-form-mobile/subject-documents-form-mobile.component';
import { DocumentsListForMobileComponent } from './documents-list-mobile/documents-list-mobile.component';

import { SubjectDocumentsService } from 'src/app/shared/services/subject-documents.service';
import { DocumentService } from 'src/app/shared/services/document.service';

import { SubjectDocuments } from 'src/app/shared/models/subject-document.model';
import { Document } from 'src/app/shared/models/document.model';

@Component({
  selector: 'subjects-documents-for-mobile',
  templateUrl: './subjects-documents-for-mobile.component.html',
  styleUrls: ['./subjects-documents-for-mobile.scss']
})

export class SubjectsDocumentsForMobileComponent implements OnInit, OnDestroy {

  subjectdocumentsList: SubjectDocuments[] = [];
  subjectDocumentsListForSelect: SubjectDocuments[] = [];
  pagedListSubjectDocuments: SubjectDocuments[] = [];
  arraysubjectDocuments: SubjectDocuments[] = [];

  length = 0;

  subjectDocumentSelectedKey: string;

  subscriptionForGetAllSubjectDocuments: Subscription;
  subscriptionForGetAllDocuments: Subscription;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;
    
  constructor(
    public subjectDocumentsService: SubjectDocumentsService,
    public documentService: DocumentService,
    public dialogService: MatDialog
  ) {}

  ngOnInit() {
    this.getAllSubjectsDocuments();
  }

  getAllSubjectsDocuments() {
    this.subscriptionForGetAllSubjectDocuments = this.subjectDocumentsService
    .getAll()
    .subscribe((subjectDocuments: SubjectDocuments[]) => {

      this.arraysubjectDocuments = subjectDocuments.sort((n1, n2) => n2.numRefSubjectDocument - n1.numRefSubjectDocument);
      this.subjectDocumentsListForSelect = this.arraysubjectDocuments;

      if (this.subjectDocumentSelectedKey) {
        this.subjectdocumentsList = subjectDocuments
        .filter(subject => subject.key == this.subjectDocumentSelectedKey)
        .sort((n1, n2) => n2.numRefSubjectDocument - n1.numRefSubjectDocument);
      }
      else {
        this.subjectdocumentsList = subjectDocuments.sort((n1, n2) => n2.numRefSubjectDocument - n1.numRefSubjectDocument);
      }

      this.subjectdocumentsList.forEach(subject => {
        this.getDocumentsForeachSubject(subject);
      })

      this.pagedListSubjectDocuments = this.subjectdocumentsList.slice(0, 9);
      this.length = this.subjectdocumentsList.length;
           
    });
  }

  getDocumentsForeachSubject(subject: SubjectDocuments) {
    this.subscriptionForGetAllDocuments = this.documentService
    .getAll()
    .subscribe((documents: Document[]) => {

      subject.haveDocuments = documents.filter(document => document.subjectDocumentsKey == subject.key).length ? true : false;

    });
  }

  OnPageChange(event: PageEvent){
    let startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if(endIndex > this.length){
      endIndex = this.length;
    }
    this.pagedListSubjectDocuments = this.subjectdocumentsList.slice(startIndex, endIndex);
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  newSubjectDocuments() {
    let config: MatDialogConfig = {
      panelClass: "dialog-responsive",
      width: '98vw',
      maxWidth: '100vw'
    }
    const dialogRef = this.dialogService.open(SubjectDocumentsFormMobileComponent, config);

    dialogRef.componentInstance.arraysubjectDocuments = this.arraysubjectDocuments;
  }

  editSubjectDocuments(subjectDocuments?: SubjectDocuments) {
    let config: MatDialogConfig = {
      panelClass: "dialog-responsive",
      width: '98vw',
      maxWidth: '100vw'
    }
    const dialogRef = this.dialogService.open(SubjectDocumentsFormMobileComponent, config);
    
    dialogRef.componentInstance.subjectDocuments = subjectDocuments;
    dialogRef.componentInstance.pagedListSubjectDocuments = this.pagedListSubjectDocuments;

    dialogRef.afterClosed().subscribe(res => {
      this.pagedListSubjectDocuments = res;
    });
  }

  extractDocument(subjectDocuments: SubjectDocuments) {
    let config: MatDialogConfig = {
      panelClass: "dialog-responsive",
      width: '98vw',
      maxWidth: '100vw'
    }
    const dialogRef = this.dialogService.open(DocumentsListForMobileComponent, config);

    dialogRef.componentInstance.subjectDocuments = subjectDocuments;
    dialogRef.componentInstance.documentRef = 1;
  }

  renewalDocument(subjectDocuments: SubjectDocuments) {
    let config: MatDialogConfig = {
      panelClass: "dialog-responsive",
      width: '98vw',
      maxWidth: '100vw'
    }
    const dialogRef = this.dialogService.open(DocumentsListForMobileComponent, config);
   
    dialogRef.componentInstance.subjectDocuments = subjectDocuments;
    dialogRef.componentInstance.documentRef = 2;
  }

  deleteSubjectDocuments(subjectDocumentKey) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this Subject!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.subjectDocumentsService.delete(subjectDocumentKey);
        Swal.fire(
          'Subject has been deleted successfully',
          '',
          'success'
        )
      }
    })
  }

  ngOnDestroy() {
    this.subscriptionForGetAllSubjectDocuments.unsubscribe();
    this.subscriptionForGetAllDocuments.unsubscribe();
  }

}