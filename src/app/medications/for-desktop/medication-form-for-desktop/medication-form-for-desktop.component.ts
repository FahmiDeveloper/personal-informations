import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { DatePipe } from '@angular/common';

import Swal from 'sweetalert2';
import { BehaviorSubject } from 'rxjs';

import { MedicationService } from 'src/app/shared/services/medication.service';
import { DiseaseService } from 'src/app/shared/services/disease.service';

import { Medication, Unit } from 'src/app/shared/models/medication.model';
import { Disease } from 'src/app/shared/models/disease.model';

@Component({
  selector: 'medication-form-for-desktop',
  templateUrl: './medication-form-for-desktop.component.html',
  styleUrls: ['./medication-form-for-desktop.scss'],
  providers: [DatePipe]
})

export class MedicationFormForDesktopComponent implements OnInit {

  arrayMedications: Medication[];
  arrayDiseases: Disease[];

  medication: Medication = new Medication();
  diseaseSelected: Disease = new Disease();

  selectedUnit: string;

  basePath = '/PicturesMedications';
  progressValue = new BehaviorSubject<number | null>(null);
  selectedFile: File | null = null;
  
  formControl = new FormControl('', [Validators.required]);

  units: Unit[] = [
    {unitName: ''},
    {unitName: 'DT'},
    {unitName: 'DT.'},
    {unitName: 'Mill'}
  ];

  constructor(
    public medicationService: MedicationService,
    public diseaseService: DiseaseService,
    private firestore: AngularFirestore,
    private datePipe: DatePipe,
    public dialogRef: MatDialogRef<MedicationFormForDesktopComponent>
  ) {}

  ngOnInit() {
    if (this.medication.key) {
      this.diseaseSelected = this.arrayDiseases.find(disease => disease.id == this.medication.diseaseId);
    }
  }

  save() {
    this.medication.diseaseId = this.diseaseSelected.id;
    this.medication.medicationFor = this.diseaseSelected.diseaseName;

    if (this.medication.key) {
      this.medicationService.update(this.medication.key, this.medication);

      Swal.fire(
        'Medication data has been updated successfully',
        '',
        'success'
      )

    } else {
      if (this.arrayMedications[0] && this.arrayMedications[0].numRefMedication) this.medication.numRefMedication = this.arrayMedications[0].numRefMedication + 1;
      else this.medication.numRefMedication = 1;

      this.medicationService.create(this.medication);

      Swal.fire(
      'New medication added successfully',
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
          await this.firestore.collection('PicturesMedications').add({
            name: this.selectedFile.name,
            content: fileData,
            type: this.selectedFile?.type,
            uploadedAt: this.datePipe.transform(new Date(), 'dd/MM/yyyy HH:mm'),
            url: `data:${this.selectedFile?.type};base64,${fileData}`
          });
          this.progressValue.next(100);
          clearInterval(interval);
          this.medication.urlPicture = `data:${this.selectedFile?.type};base64,${fileData}`;
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
      this.medication.urlPicture = '';
    }
  }

  getErrorMessage() {
    return this.formControl.hasError('required') ? 'Required field' :'';
  }

  close() {
    this.dialogRef.close();
  }

  newDisease() {
    Swal.fire({
      title: 'New disease',
      input: 'text',
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        let disease: Disease = new Disease();
        disease.id = (this.arrayDiseases[0] && this.arrayDiseases[0].id) ? this.arrayDiseases[0].id + 1 : 1;
        disease.diseaseName = result.value;

        this.arrayDiseases.push(disease);

        this.arrayDiseases = this.arrayDiseases.sort((n1, n2) => n2.id - n1.id);

        this.diseaseSelected = disease;

        this.diseaseService.create(disease);

        Swal.fire(
          'New disease added successfully',
          '',
          'success'
        )
      }
    })
  }

  editDisease(diseaseSelected: Disease) {
    Swal.fire({
      title: 'Edit disease',
      input: 'text',
      inputValue: diseaseSelected.diseaseName,
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        diseaseSelected.diseaseName = result.value;

        this.diseaseService.update(diseaseSelected.key, diseaseSelected);
        
        Swal.fire(
          'Disease data has been updated successfully',
          '',
          'success'
        )
      }
    })
  }

  deleteDisease(diseaseKey) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this disease!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.diseaseService.delete(diseaseKey);
        this.arrayDiseases.forEach((disease, index) => {
          if(disease.key === diseaseKey) this.arrayDiseases.splice(index,1);
        });
        Swal.fire(
          'Disease has been deleted successfully',
          '',
          'success'
        )
      }
    })
  }

  onSelectUnit() {
    if (this.medication.price) this.medication.price = this.medication.price + this.selectedUnit;
  }

}