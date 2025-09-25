import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

import { map } from 'rxjs/operators';

import { FileUploadService } from 'src/app/shared/services/file-upload.service';

import { FileUpload } from 'src/app/shared/models/file-upload.model';

@Component({
  selector: 'app-upload-list',
  templateUrl: './upload-list.component.html',
  styleUrls: ['./upload-list.component.scss']
})

export class UploadListComponent implements OnChanges {

  @Input() isDesktop: boolean;
  @Input() isTablet: boolean;
  @Input() isMobile: boolean;
  @Input() typeFileId: number;
  @Input() numContextFile: number;

  @Output() arrayFiles = new EventEmitter<FileUpload[]>();

  fileUploads?: any[];
  filteredFiles?: any[];

  constructor(private uploadService: FileUploadService) {}
  
  ngOnChanges(changes: import("@angular/core").SimpleChanges) {
    this.uploadService.getFiles().snapshotChanges().pipe(
      map(changes => changes.map(c => ({ key: c.payload.key, ...c.payload.val() })))
    ).subscribe(fileUploads => {
      this.arrayFiles.emit(fileUploads.sort((n1, n2) => n2.numRefFile - n1.numRefFile));
      if (this.numContextFile) 
      this.filteredFiles = fileUploads.filter(element => (element.typeFileId == this.typeFileId) && (element.contextFile == this.numContextFile)).sort((n1, n2) => n2.numRefFile - n1.numRefFile);
      else this.filteredFiles = fileUploads.filter(element => element.typeFileId == this.typeFileId).sort((n1, n2) => n2.numRefFile - n1.numRefFile);
      this.fileUploads = fileUploads;
    });
  }
  
  ngOnInit() {}

  filter(query: string) {
    this.filteredFiles = (this.numContextFile)
    ? this.fileUploads.filter(file => (file.typeFileId == this.typeFileId) && (file.contextFile == this.numContextFile) && (file.name.toLowerCase().includes(query.toLowerCase()))).sort((n1, n2) => n2.numRefFile - n1.numRefFile)
    : this.fileUploads.filter(file => (file.typeFileId == this.typeFileId) && (file.name.toLowerCase().includes(query.toLowerCase()))).sort((n1, n2) => n2.numRefFile - n1.numRefFile);
  }
}
