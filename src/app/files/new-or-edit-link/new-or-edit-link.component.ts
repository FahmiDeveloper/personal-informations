import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import Swal from 'sweetalert2';

import { LinkService } from 'src/app/shared/services/link.service';

import { Link } from 'src/app/shared/models/link.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'new-or-edit-link',
  templateUrl: './new-or-edit-link.component.html',
  styleUrls: ['./new-or-edit-link.scss']
})

export class NewOrEditLinkComponent implements OnInit {

  link: Link = new Link();
  arrayLinks: Link[];
  dataSource: Link[];

  typeLinkId: number;
  modalRef: any;
  isMobile: boolean;
  angularContext: boolean;
  otherContext: boolean;

  formControl = new FormControl('', [Validators.required]);

  constructor(
    private linkService: LinkService,
    public dialogRef: MatDialogRef<NewOrEditLinkComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Link[]
    ) {}

  ngOnInit() {
    if (this.link.key) {
      if (this.link.typeLinkId == 1) this.angularContext = true;
      else this.otherContext = true;
      this.data = this.dataSource;
    }
  }

  save() {
    if (this.link.key) {

      this.linkService.update(this.link.key, this.link);

      Swal.fire(
        'Link data has been updated successfully',
        '',
        'success'
      );
    } 
    else {
      this.link.typeLinkId = this.typeLinkId;
      if (this.arrayLinks[0].numRefLink) this.link.numRefLink = this.arrayLinks[0].numRefLink + 1;

      this.linkService.create(this.link);

      Swal.fire(
      'New Link added successfully',
      '',
      'success'
      );
    }
    this.close();
  }

  getErrorMessage() {
    return this.formControl.hasError('required') ? 'Required field' :'';
  }

  checkAngularContext() {
    if (this.angularContext == true) {
      this.otherContext = false;
      this.link.typeLinkId = 1;
    }
  }

  checkotherContext() {
    if (this.otherContext == true) {
      this.angularContext = false;
      this.link.typeLinkId = 2;
    }
  }

  close() {
    this.dialogRef.close();
  }

}
