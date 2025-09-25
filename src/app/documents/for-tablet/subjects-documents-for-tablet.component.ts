import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { SubjectDocumentsFormTabletComponent } from './subject-documents-form-tablet/subject-documents-form-tablet.component';
import { DocumentsListForTabletComponent } from './documents-list-tablet/documents-list-tablet.component';

import { SubjectDocumentsService } from 'src/app/shared/services/subject-documents.service';
import { DocumentService } from 'src/app/shared/services/document.service';

import { SubjectDocuments } from 'src/app/shared/models/subject-document.model';
import { Document } from 'src/app/shared/models/document.model';

@Component({
  selector: 'subjects-documents-for-tablet',
  templateUrl: './subjects-documents-for-tablet.component.html',
  styleUrls: ['./subjects-documents-for-tablet.scss']
})

export class SubjectDocumentsForTabletComponent implements OnInit, OnDestroy {

  subjectdocumentsList: SubjectDocuments[] = [];
  subjectDocumentsListForSelect: SubjectDocuments[] = [];
  arraysubjectDocuments: SubjectDocuments[] = [];

  p = 1;

  subjectDocumentSelectedKey = '';
  itemsPerPage: number;
  orientation = '';

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
    if(window.innerHeight > window.innerWidth){
      this.orientation = 'Portrait';    
    } else {
      this.orientation = 'Landscape';
    }

    this.itemsPerPage = this.orientation == 'Portrait' ? 10 : 9 ;

    window.matchMedia("(orientation: portrait)").addEventListener("change", e => {
      const portrait = e.matches;
  
      if (portrait) {
        this.orientation = 'Portrait';
      } else {
        this.orientation = 'Landscape';
      }

      this.itemsPerPage = this.orientation == 'Portrait' ? 10 : 9 ;

    });
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
           
    });
  }

  getDocumentsForeachSubject(subject: SubjectDocuments) {
    this.subscriptionForGetAllDocuments = this.documentService
    .getAll()
    .subscribe((documents: Document[]) => {

      subject.haveDocuments = documents.filter(document => document.subjectDocumentsKey == subject.key).length ? true : false;

    });
  }

  OnPageChange(){
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  newSubjectDocuments() {
    let config: MatDialogConfig = {panelClass: "dialog-responsive"}
    const dialogRef = this.dialogService.open(SubjectDocumentsFormTabletComponent, config);

    dialogRef.componentInstance.arraysubjectDocuments = this.arraysubjectDocuments;
  }

  editSubjectDocuments(subjectDocuments?: SubjectDocuments) {
    let config: MatDialogConfig = {panelClass: "dialog-responsive"}
    const dialogRef = this.dialogService.open(SubjectDocumentsFormTabletComponent, config); 
       
    dialogRef.componentInstance.subjectDocuments = subjectDocuments;
  }

  extractDocument(subjectDocuments: SubjectDocuments) {
    const dialogRef = this.dialogService.open(DocumentsListForTabletComponent, {width: '800px'});
    dialogRef.componentInstance.subjectDocuments = subjectDocuments;
    dialogRef.componentInstance.documentRef = 1;
  }

  renewalDocument(subjectDocuments: SubjectDocuments) {
    const dialogRef = this.dialogService.open(DocumentsListForTabletComponent, {width: '800px'});
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