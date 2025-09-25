import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { DatePipe } from '@angular/common';

import Swal from 'sweetalert2';
import { BehaviorSubject } from 'rxjs';

import { PasswordService } from 'src/app/shared/services/password.service';

import { Password } from 'src/app/shared/models/password.model';

@Component({
  selector: 'password-form-for-mobile',
  templateUrl: './password-form-for-mobile.component.html',
  styleUrls: ['./password-form-for-mobile.scss'],
  providers: [DatePipe]
})

export class PasswordFormForMobileComponent implements OnInit {

  arrayPasswords: Password[];
  pagedList: Password[];

  password: Password = new Password();

  basePath = '/PicturesPasswords';
  progressValue = new BehaviorSubject<number | null>(null);
  selectedFile: File | null = null;

  formControl = new FormControl('', [Validators.required]);

  constructor(
    public passwordService: PasswordService,
    private firestore: AngularFirestore,
    private datePipe: DatePipe,    
    public dialogRef: MatDialogRef<PasswordFormForMobileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Password[]
  ) {}

  ngOnInit() {
    if (this.password.key) {
      this.data = this.pagedList;
    }
  }

  save() {
    if (this.password.key) {

      this.passwordService.update(this.password.key, this.password);

      Swal.fire(
        'Password data has been updated successfully',
        '',
        'success'
      )

    } else {
      if (this.arrayPasswords[0] && this.arrayPasswords[0].numRefPassword) this.password.numRefPassword = this.arrayPasswords[0].numRefPassword + 1;
      else this.password.numRefPassword = 1;

      this.passwordService.create(this.password);

      Swal.fire(
      'New password added successfully',
      '',
      'success'
      )

    }
    this.close();
  }

  onFileChanged(event: any) {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {
      if (this.selectedFile.size > 1024 * 1024) {
        Swal.fire(
          'File too large for Firestore. Max 1 MB!',
          '',
          'warning'
        )
        return;
      }

      // Start simulated progress
      this.progressValue.next(0);
      let progress = 0;
      const interval = setInterval(() => {
        if (progress < 90) {
          progress += 10;
          this.progressValue.next(progress);
        }
      }, 100);

      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const fileData = e.target.result.split(',')[1]; // get Base64 part
        try {
          await this.firestore.collection('PicturesPasswords').add({
            name: this.selectedFile.name,
            content: fileData,
            type: this.selectedFile?.type,
            uploadedAt: this.datePipe.transform(new Date(), 'dd/MM/yyyy HH:mm'),
            url: `data:${this.selectedFile?.type};base64,${fileData}`
          });
          this.progressValue.next(100);
          clearInterval(interval);
          this.password.imageUrl = `data:${this.selectedFile?.type};base64,${fileData}`;
          Swal.fire(
            'Picture has been uploaded successfully!',
            '',
            'success'
          )
        } catch (err) {
          console.error(err);
          clearInterval(interval);
          this.progressValue.next(null);
          alert('Error uploading file!');
        }
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.password.imageUrl = '';
    }
  }

  getErrorMessage() {
    return this.formControl.hasError('required') ? 'Required field' :'';
  }

  close() {
    this.dialogRef.close(this.data);
  }

}
