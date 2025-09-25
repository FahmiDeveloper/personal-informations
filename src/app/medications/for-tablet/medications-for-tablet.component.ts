import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import * as fileSaver from 'file-saver';

import { MedicationFormForTabletComponent } from './medication-form-for-tablet/medication-form-for-tablet.component';

import { MedicationService } from 'src/app/shared/services/medication.service';
import { DiseaseService } from 'src/app/shared/services/disease.service';

import { Medication } from 'src/app/shared/models/medication.model';
import { Disease } from 'src/app/shared/models/disease.model';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'medications-for-tablet',
  templateUrl: './medications-for-tablet.component.html',
  styleUrls: ['./medications-for-tablet.scss']
})

export class MedicationsForTabletComponent implements OnInit, OnDestroy {

  medicationsList: Medication[] = [];
  medicationsListCopieForNewMedication: Medication[] = [];
  diseaseList: Disease[] = [];

  p = 1;

  diseaseSelectedId: number;
  pictureFile = '';
  FileName = '';
  medicationName = '';
  defaultElevation = 2;
  raisedElevation = 8;
  orientation = '';
  itemsPerPage: number;

  menuTopLeftPosition =  {x: '0', y: '0'} 

  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger: MatMenuTrigger;

  subscriptionForGetAllMedications: Subscription;
  subscriptionForGetAllDiseases: Subscription;
    
  constructor(
    public diseaseService: DiseaseService,
    public medicationService: MedicationService,
    public dialogService: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    if(window.innerHeight > window.innerWidth){
      this.orientation = 'Portrait';    
    } else {
      this.orientation = 'Landscape';
    }

    this.itemsPerPage = this.orientation == 'Portrait' ? 9 : 10 ;

    window.matchMedia("(orientation: portrait)").addEventListener("change", e => {
      const portrait = e.matches;
  
      if (portrait) {
        this.orientation = 'Portrait';
      } else {
        this.orientation = 'Landscape';
      }

      this.itemsPerPage = this.orientation == 'Portrait' ? 9 : 10 ;
    });
    this.getAllMedications();
    this.getAllDiseases();
  }

  getAllMedications() {
    this.subscriptionForGetAllMedications = this.medicationService
    .getAll()
    .subscribe((medications: Medication[]) => {

      this.medicationsListCopieForNewMedication = medications.sort((n1, n2) => n2.numRefMedication - n1.numRefMedication);

      if (this.medicationName) {
        this.medicationsList = medications
        .filter(medication => medication.medicationName.toLowerCase().includes(this.medicationName.toLowerCase()))
        .sort((n1, n2) => n2.numRefMedication - n1.numRefMedication);
      }
      else if (this.diseaseSelectedId) {
        this.medicationsList = medications
        .filter(medication => medication.diseaseId == this.diseaseSelectedId)
        .sort((n1, n2) => n2.numRefMedication - n1.numRefMedication);
      }
      else {
        this.medicationsList = medications.sort((n1, n2) => n2.numRefMedication - n1.numRefMedication)
      }

    });
  }

  getAllDiseases() {
    this.subscriptionForGetAllDiseases = this.diseaseService
    .getAll()
    .subscribe((diseases: Disease[]) => {
      this.diseaseList = diseases.sort((n1, n2) => n2.id - n1.id);
    });
  }

  OnPageChange(){
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  newMedication() {
    let config: MatDialogConfig = {panelClass: "dialog-responsive"}
    const dialogRef = this.dialogService.open(MedicationFormForTabletComponent, config);

    dialogRef.componentInstance.arrayMedications = this.medicationsListCopieForNewMedication;
    dialogRef.componentInstance.arrayDiseases = this.diseaseList;
  }

  editMedication(medication?: Medication) {
    let config: MatDialogConfig = {panelClass: "dialog-responsive"}
    const dialogRef = this.dialogService.open(MedicationFormForTabletComponent, config);
    
    dialogRef.componentInstance.medication = medication;
    dialogRef.componentInstance.arrayDiseases = this.diseaseList;
  }

  deleteMedication(medicationKey) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this medication!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.medicationService.delete(medicationKey);
        Swal.fire(
          'Medication has been deleted successfully',
          '',
          'success'
        )
      }
    })
  }

  viewPicture(medication: Medication, showPicture) {
    this.pictureFile = medication.urlPicture;
    this.FileName = medication.fileName.substring(0, medication.fileName.lastIndexOf("."));

    this.dialogService.open(showPicture, {
      width: '75vw',
      height:'70vh',
      maxWidth: '100vw'
    });
  }

  downloadPicture(medication: Medication) {
    fetch(medication.urlPicture)
    .then(res => res.blob()) // Gets the response and returns it as a blob
    .then(blob => {
      fileSaver.saveAs(blob, medication.fileName.substring(0, medication.fileName.lastIndexOf(".")));
    });
  }

  checkIsImage(urlFile: string): boolean {
    let imageExtentions = ['.jpeg', '.jpg', '.png', '.gif']; // Array of image extention
    if (urlFile.includes(imageExtentions[0]) || urlFile.includes(imageExtentions[1]) || urlFile.includes(imageExtentions[2]) || urlFile.includes(imageExtentions[3]))
    return true;
    else return false;
  }

  copyText(text: string){
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = text;
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

  viewMedicationFor(medicationFor: string) {
    Swal.fire({
      text: medicationFor,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Close'
    });
  }

  viewPrice(priceMedication: string) {
    Swal.fire({
      text: priceMedication ? priceMedication : '?',
      confirmButtonColor: '#d33',
      confirmButtonText: 'Close'
    });
  }

  viewUtilisation(utilisation: string) {
    Swal.fire({
      text: utilisation ? utilisation : '?',
      confirmButtonColor: '#d33',
      confirmButtonText: 'Close'
    });
  }

  openMenuTrigger(event: MouseEvent, medication: Medication) { 
    // preventDefault avoids to show the visualization of the right-click menu of the browser 
    event.preventDefault(); 

    // we record the mouse position in our object 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 

    // we open the menu 
    // we pass to the menu the information about our object 
    this.matMenuTrigger.menuData = {medication: medication};

    // we open the menu 
    this.matMenuTrigger.openMenu(); 
  }

  ngOnDestroy() {
    this.subscriptionForGetAllMedications.unsubscribe();
  }

}