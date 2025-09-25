import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

import Swal from 'sweetalert2';

import { SubjectDocumentsService } from 'src/app/shared/services/subject-documents.service';

import { SubjectDocuments } from 'src/app/shared/models/subject-document.model';

@Component({
  selector: 'subject-documents-form-desktop',
  templateUrl: './subject-documents-form-desktop.component.html',
  styleUrls: ['./subject-documents-form-desktop.scss']
})

export class SubjectDocumentsFormDesktopComponent implements OnInit {

  arraysubjectDocuments: SubjectDocuments[];

  subjectDocuments: SubjectDocuments = new SubjectDocuments();
  
  formControl = new FormControl('', [Validators.required]);

  constructor(
    public subjectDocumentsService: SubjectDocumentsService,
    public dialogRef: MatDialogRef<SubjectDocumentsFormDesktopComponent>
  ) {}

  ngOnInit() {}

  save() {
    if (this.subjectDocuments.key) {

      this.subjectDocumentsService.update(this.subjectDocuments.key, this.subjectDocuments);

      Swal.fire(
        'Subject data has been updated successfully',
        '',
        'success'
      )

    } else {
      if (this.arraysubjectDocuments[0] && this.arraysubjectDocuments[0].numRefSubjectDocument) 
      this.subjectDocuments.numRefSubjectDocument = this.arraysubjectDocuments[0].numRefSubjectDocument + 1;
      
      else this.subjectDocuments.numRefSubjectDocument = 1;

      this.subjectDocumentsService.create(this.subjectDocuments);

      Swal.fire(
      'New subject added successfully',
      '',
      'success'
      )

    }
    this.close();
  }

  getErrorMessage() {
    return this.formControl.hasError('required') ? 'Required field' :'';
  }

  close() {
    this.dialogRef.close();
  }

}