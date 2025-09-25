import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

import { FileUploadService } from 'src/app/shared/services/file-upload.service';

import { FileUpload } from 'src/app/shared/models/file-upload.model';

import { AngularFirestore } from '@angular/fire/firestore';
import { DatePipe } from '@angular/common';

import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';
import { AngularFireDatabase } from '@angular/fire/database';


@Component({
  selector: 'app-upload-form',
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.scss'],
  providers: [DatePipe]
})

export class UploadFormComponent implements OnChanges, OnInit {

  @Input() typeFileId: number;
  @Input() defaultArrayFiles: FileUpload[];

  @Output() refContextFile = new EventEmitter<number>();
  
  selectedFiles?: FileList;
  currentFileUpload?: FileUpload;
  percentage = 0;
  angularContext = false;
  otherContext = false;
  contextFile: number;
  lastNumRefFile: number;

  basePath = '/Files';
  progressValue = new BehaviorSubject<number | null>(null);
  selectedFile: File | null = null;

  constructor(
    private uploadService: FileUploadService, 
    private firestore: AngularFirestore,
    private datePipe: DatePipe, 
    private db: AngularFireDatabase) 
  {}

  ngOnChanges(changes: import("@angular/core").SimpleChanges) {
    if (this.defaultArrayFiles[0]) this.lastNumRefFile = this.defaultArrayFiles[0].numRefFile;
  }

  ngOnInit() {}

  checkAngularContext() {
    if (this.angularContext == true) this.otherContext = false;
    this.refContextFile.emit(1);
  }

  checkotherContext() {
    if (this.otherContext == true) this.angularContext = false;
    this.refContextFile.emit(2);
  }

  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
    if (this.angularContext == true) this.contextFile = 1;
    else if(this.otherContext == true) this.contextFile = 2;
    this.upload();
  }
  
  upload(): void {
    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);
      this.selectedFiles = undefined;
      if (file) {
        this.currentFileUpload = new FileUpload(file, this.typeFileId, this.contextFile, this.lastNumRefFile + 1);
        this.uploadService.pushFileToStorage(this.currentFileUpload).subscribe(
          percentage => {
            this.percentage = Math.round(percentage ? percentage : 0);
          },
          error => {
            console.log(error);
          }
        );
      }
    }
  }

  onFileChanged(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.angularContext == true) this.contextFile = 1;
    else if(this.otherContext == true) this.contextFile = 2;

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
          await this.firestore.collection('Files').add({
            name: this.selectedFile.name,
            content: fileData,
            type: this.selectedFile?.type,
            uploadedAt: this.datePipe.transform(new Date(), 'dd/MM/yyyy HH:mm'),
            url: `data:${this.selectedFile?.type};base64,${fileData}`
          }).then(async docRef => {
            const docSnapshot = await docRef.get();
            if (docSnapshot.exists) {
              this.saveFileData(docSnapshot.data());
            }
          }).catch(error => {
            console.error('Error adding document: ', error);
          });
          this.progressValue.next(100);
          clearInterval(interval);
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
    }
  }

  private saveFileData(data): void {
    let fileUpload: FileUpload = {};
    fileUpload.name = data['name'];
    fileUpload.url = data['url'];
    fileUpload.contextFile = this.contextFile;
    fileUpload.typeFileId = this.typeFileId;
    fileUpload.numRefFile = this.lastNumRefFile + 1;
    this.db.list(this.basePath).push(fileUpload);
  }
}
