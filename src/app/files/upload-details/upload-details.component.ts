import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';

import { from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import * as fileSaver from 'file-saver';
import * as JSZip from 'jszip/dist/jszip';
import { utils, write as XlsxWrite, read as XlsxRead } from 'ts-xlsx';
import { renderAsync } from 'docx-preview';
import { NgNavigatorShareService } from 'ng-navigator-share';

import { FileUploadService } from 'src/app/shared/services/file-upload.service';

import { FileUpload, ZipFile } from 'src/app/shared/models/file-upload.model';

@Component({
  selector: 'app-upload-details',
  templateUrl: './upload-details.component.html',
  styleUrls: ['./upload-details.component.scss']
})

export class UploadDetailsComponent implements OnChanges {

  @Input() filteredFiles: any[];
  @Input() isDesktop: boolean;
  @Input() isTablet: boolean;
  @Input() isMobile: boolean;

  p: number = 1;

  urlFile: string;
  pictureFile: string;
  FileName: string;
  $zipFiles: Observable<ZipFile[]>;
  isLoading: boolean;
  blobForDownload: Blob;
  srcExtractedImage: any;
  fileExtractedName = '';
  contentTxtFile = '';
  contentPdfFile: any;
  excelFile: File;
  data: any;
  headData: any;
  arrayBuffer: any;
  wordFile: File;
  itemsPerPage: number;

  menuTopLeftPosition =  {x: '0', y: '0'} 

  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger: MatMenuTrigger;

  constructor(
    private uploadService: FileUploadService,
    protected ngNavigatorShareService: NgNavigatorShareService,
    private sanitizer : DomSanitizer,
    public dialogService: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnChanges(changes: import("@angular/core").SimpleChanges) {
    this.itemsPerPage = window.innerWidth <= 1366 ? 4 : 8;
    if (this.filteredFiles) {
      this.filteredFiles.forEach(element => {
        element.fileNameWithoutType = element.name.substring(0, element.name.lastIndexOf("."));
      })
    }
  }

  viewOtherFileUpload(fileUpload: FileUpload, showFile) {
    this.urlFile = fileUpload.url;
    this.FileName = fileUpload.name;

    if (this.isMobile) {
      this.dialogService.open(showFile, {
        width: '98vw',
        height:'81vh',
        maxWidth: '100vw'
      });
    } 
    else if (this.isTablet) {
      this.dialogService.open(showFile, {
        width: '80vw',
        height:'85vh',
        maxWidth: '100vw'
      });
    } 
    else {
      this.dialogService.open(showFile, {
        width: '60vw',
        height:'85vh',
        maxWidth: '100vw'
      });
    }
  }

  viewFilePictureUpload(fileUpload: FileUpload, showPicture) {
    this.pictureFile = fileUpload.url;
    this.FileName = fileUpload.name;

    if (this.isMobile) {
      this.dialogService.open(showPicture, {
        width: '98vw',
        height:'81vh',
        maxWidth: '100vw'
      });
    } 
    else if (this.isTablet) {
      this.dialogService.open(showPicture, {
        width: '75vw',
        height:'70vh',
        maxWidth: '100vw'
      });
    } 
    else {
      this.dialogService.open(showPicture, {
        width: '40vw',
        height:'85vh',
        maxWidth: '100vw'
      });
    }
  }

  showZipFile(fileUpload: FileUpload, viewZipFile) {
    this.FileName = fileUpload.name;
    this.isLoading = true;

    fetch(fileUpload.url)
    .then(res => res.blob()) // Gets the response and returns it as a blob
    .then(blob => {
      this.blobForDownload =blob;
      const zipLoaded = new JSZip.default();

      this.$zipFiles = from(zipLoaded.loadAsync(blob)).pipe(
        switchMap((zip: any):Observable<ZipFile[]> => {
          return of(Object.keys(zip.files).map((key)=>zip.files[key]))
        })
      )

      this.$zipFiles.forEach(zipFiles => {
        zipFiles.forEach(element => {
          let n = element.name.lastIndexOf('/');
          element.fileName = element.name.substring(n + 1);
        })        
      })

      if (this.isMobile) {
        this.dialogService.open(viewZipFile, {
          width: '98vw',
          height:'81vh',
          maxWidth: '100vw'
        });
      } 
      else if (this.isTablet) {
        this.dialogService.open(viewZipFile, {
          width: '80vw',
          height:'85vh',
          maxWidth: '100vw'
        });
      } 
      else {
        this.dialogService.open(viewZipFile, {
          width: '45vw',
          height:'85vh',
          maxWidth: '100vw'
        });
      }

    });
    setTimeout(() => this.isLoading = false, 5000); 
  }

  downloadFile(fileUpload: FileUpload) {
    fetch(fileUpload.url)
    .then(res => res.blob()) // Gets the response and returns it as a blob
    .then(blob => {
      fileSaver.saveAs(blob, fileUpload.name);
    });
  }

  viewFileFromZip(file: ZipFile, showContentFilesFromZip) {
    this.fileExtractedName = file.fileName;

    var zip = new JSZip();
    zip.loadAsync(this.blobForDownload).then((zip) => {
      Object.keys(zip.files).forEach((filename) => {
        if (file.name == filename) {
          zip.files[file.name].async('uint8array').then((fileData) => {
          const blob = new Blob([fileData]);
          const reader = new FileReader();

          if (this.checkIsImage(file.fileName))
          this.srcExtractedImage = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(blob));

          else if (this.isTxt(file.fileName)){
            reader.onloadend = () => {
              this.contentTxtFile = reader.result as string;
            };
            reader.readAsText(blob);
          } 
          
          else if (this.isPdf(file.fileName)){
            reader.readAsDataURL(blob);
            reader.addEventListener(
                'load',
                () => {
                    this.contentPdfFile = reader.result;
                },
                false
            );
          }

          else if (this.isExcel(file.fileName)){
            this.excelFile = new File([blob], file.fileName);

            reader.onload = (e: any) => {

              this.arrayBuffer = reader.result;
              const data = new Uint8Array(this.arrayBuffer);
              const arr = new Array();
        
              for (let i = 0; i !== data.length; i++) {
                arr[i] = String.fromCharCode(data[i]);
              }
        
              const bstr = arr.join('');
              const workbook = XlsxRead(bstr, { type: 'binary', cellDates: true });
        
              const wsname: string = workbook.SheetNames[0];
              const ws = workbook.Sheets[wsname];
        
              this.data = utils.sheet_to_json(ws, {header: 1, raw: false});
        
              this.headData = this.data[0];

              this.data = this.data.slice(1);

              const ws2 = workbook.Sheets[workbook.SheetNames[1]];
              this.readDataSheet(ws2, 10);
            };
            reader.readAsArrayBuffer(this.excelFile);
          }

          else if (this.isWord(file.fileName)){
            this.wordFile = new File([blob], file.fileName);

            reader.onloadend = () => {
              var arrayBuffer = reader.result;
  
              if (this.isMobile) {
                renderAsync(arrayBuffer, document.getElementById("contentWord"), null, {
                inWrapper: false
                })
                .then(x => console.log("docx: finished"));
              } else {
                renderAsync(arrayBuffer, document.getElementById("contentWord"))
                .then(x => console.log("docx: finished"));
              }
              };
              reader.readAsArrayBuffer(this.wordFile);
          };

          if (this.isTxt(file.fileName) || this.isPdf(file.fileName) ||this.isWord(file.fileName) || this.isExcel(file.fileName)) {
            if (this.isMobile) {
              this.dialogService.open(showContentFilesFromZip, {
               width: '98vw',
               height:'81vh',
               maxWidth: '100vw'
             });
           } else {
             this.dialogService.open(showContentFilesFromZip, {
               width: '60vw',
               height:'95vh',
               maxWidth: '100vw'
             });
           }
          } else {
            if (this.isMobile) {
              this.dialogService.open(showContentFilesFromZip, {
               width: '98vw',
               height:'81vh',
               maxWidth: '100vw'
             });
           } else {
             this.dialogService.open(showContentFilesFromZip, {
               width: '40vw',
               height:'85vh',
               maxWidth: '100vw'
             });
           }
          }      
        });
        }   
      });
    });  
  }

  private readDataSheet(ws: any, startRow: number) {
    let datas = utils.sheet_to_json(ws, {header: 1, raw: false, range: startRow});
    let headDatas = datas[0];
    datas = datas.slice(1);

    for (let i = 0; i < this.data.length; i++) {
      this.data[i][this.headData.length] = datas.filter(x => x[12] == this.data[i][0])
    }
  }

  saveFileFromZip(file: ZipFile) {
    var zip = new JSZip();
    zip.loadAsync(this.blobForDownload).then(function (zip) {
      Object.keys(zip.files).forEach(function (filename) {
        if (file.name == filename) {
        zip.files[file.name].async('uint8array').then(function (fileData) {
           if (fileData) {          
              const blob = new Blob([fileData]);
              fileSaver.saveAs(blob, file.fileName);
            }
          })
        }    
      })
    })
  }

  shareFile(fileUpload: FileUpload) {
    fetch(fileUpload.url)
    .then(res => res.blob())
    .then(blob => {
      if (!this.ngNavigatorShareService.canShare()) {
        alert(`This service/api is not supported in your Browser`);
        return;
      }

      if (this.isTxt(fileUpload.name)) {
        this.ngNavigatorShareService.share({
          title: fileUpload.name,
          text: fileUpload.name,
          files: [
            new File([blob], fileUpload.name, {type: 'text/plain'}),
          ]
        }).then( (response) => {
          console.log(response);
        })
        .catch( (error) => {
          console.log(error);
        });
      } else if (this.isPdf(fileUpload.name)) {
        this.ngNavigatorShareService.share({
          title: fileUpload.name,
          text: fileUpload.name,
          files: [
            new File([blob], fileUpload.name, {type: 'application/pdf'}),
          ]
        }).then( (response) => {
          console.log(response);
        })
        .catch( (error) => {
          console.log(error);
        });
      } else {
        this.ngNavigatorShareService.share({
          title: fileUpload.name,
          text: fileUpload.name,
          files: [
            new File([blob], fileUpload.name, {
              type: blob.type,
            }),
          ]
        }).then( (response) => {
          console.log(response);
        })
        .catch( (error) => {
          console.log(error);
        });
      }    
    });  
  }

  checkIsImage(path) {
    let imageExtentions = ['JPEG', 'JPG', 'PNG', 'GIF', 'TIFF']; // Array of image extention
    let n = path.lastIndexOf('.');
    let extention: string = path.toLocaleUpperCase().substring(n + 1);
    return imageExtentions.indexOf(extention) != -1;
  }

  isZip(path) {
    let extentionvideo = ['zip']; // Array of video extention
    let n = path.lastIndexOf('.');
    let extention: string = path.substring(n + 1);
    return extentionvideo.indexOf(extention) != -1;
  }

  isTxt(path) {
    let extentionvideo = ['txt']; // Array of video extention
    let n = path.lastIndexOf('.');
    let extention: string = path.substring(n + 1);
    return extentionvideo.indexOf(extention) != -1;
  }

  isPdf(path) {
    let extentionvideo = ['pdf']; // Array of pdf extention
    let n = path.lastIndexOf('.');
    let extention: string = path.substring(n + 1);
    return extentionvideo.indexOf(extention.toLocaleLowerCase()) != -1;
  }

  isExcel(path) {
    let extentionvideo = ['xlsx']; // Array of pdf extention
    let n = path.lastIndexOf('.');
    let extention: string = path.substring(n + 1);
    return extentionvideo.indexOf(extention.toLocaleLowerCase()) != -1;
  }

  isWord(path) {
    let extentionvideo = ['docx']; // Array of pdf extention
    let n = path.lastIndexOf('.');
    let extention: string = path.substring(n + 1);
    return extentionvideo.indexOf(extention.toLocaleLowerCase()) != -1;
  }

  deleteFile(file: FileUpload) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this file!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.uploadService.deleteFile(file);
        Swal.fire(
          'File has been deleted successfully',
          '',
          'success'
        )
      }
    })
  }

  onRightClick(event: MouseEvent, file: FileUpload) { 
    // preventDefault avoids to show the visualization of the right-click menu of the browser 
    event.preventDefault(); 

    // we record the mouse position in our object 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 

    // we open the menu 
    // we pass to the menu the information about our object 
    this.matMenuTrigger.menuData = {file: file};

    // we open the menu 
    this.matMenuTrigger.openMenu(); 
  }

  openMenuTrigger(event: MouseEvent, file: FileUpload) { 
    // preventDefault avoids to show the visualization of the right-click menu of the browser 
    event.preventDefault(); 

    // we record the mouse position in our object 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 

    // we open the menu 
    // we pass to the menu the information about our object 
    this.matMenuTrigger.menuData = {file: file};

    // we open the menu 
    this.matMenuTrigger.openMenu(); 
  }
  
  copyText(file: FileUpload){
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = file.fileNameWithoutType;
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

}