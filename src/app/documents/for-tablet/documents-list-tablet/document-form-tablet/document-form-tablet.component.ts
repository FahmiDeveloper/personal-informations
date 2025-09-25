import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

import Swal from 'sweetalert2';

import { DocumentService } from 'src/app/shared/services/document.service';

import { Document } from 'src/app/shared/models/document.model';

@Component({
  selector: 'document-form-tablet',
  templateUrl: './document-form-tablet.component.html',
  styleUrls: ['./document-form-tablet.scss']
})

export class DocumentFormTabletComponent implements OnInit {

  arrayDocuments: Document[];

  document: Document = new Document();

  subjectDocumentsKey: string;
  documentRef: number;
  documentRefSelected: number;
  
  formControl = new FormControl('', [Validators.required]);

  constructor(
    public documentService: DocumentService,
    public dialogRef: MatDialogRef<DocumentFormTabletComponent>
  ) {}

  ngOnInit() {
    if (this.document.key) {
      this.documentRefSelected = this.document.documentRef;
    }
  }

  save() {
    if (this.document.key) {

      if (this.documentRefSelected) this.document.documentRef = this.documentRefSelected;

      this.documentService.update(this.document.key, this.document);

      Swal.fire(
        'Document data has been updated successfully',
        '',
        'success'
      )

    } else {
      if (this.arrayDocuments[0] && this.arrayDocuments[0].numRefDocument) this.document.numRefDocument = this.arrayDocuments[0].numRefDocument + 1;
      else this.document.numRefDocument = 1;

      this.document.subjectDocumentsKey = this.subjectDocumentsKey;
      this.document.documentRef = this.documentRef;

      this.documentService.create(this.document);

      Swal.fire(
      'New document added successfully',
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