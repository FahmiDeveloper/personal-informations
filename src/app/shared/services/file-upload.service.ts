import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { FileUpload } from '../models/file-upload.model';

@Injectable({
  providedIn: 'root'
})

export class FileUploadService {

  private basePath = '/Files';

  constructor(private db: AngularFireDatabase, private storage: AngularFireStorage, private firestore: AngularFirestore) {}

  pushFileToStorage(fileUpload: FileUpload): Observable<number | undefined> {
    const filePath = `${this.basePath}/${fileUpload.file.name}`;
    const storageRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, fileUpload.file);
    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        storageRef.getDownloadURL().subscribe(downloadURL => {
          fileUpload.url = downloadURL;
          fileUpload.name = fileUpload.file.name;
          this.saveFileData(fileUpload);
        });
      })
    ).subscribe();
    return uploadTask.percentageChanges();
  }

  private saveFileData(fileUpload: FileUpload): void {
    this.db.list(this.basePath).push(fileUpload);
  }

  getFiles(): AngularFireList<FileUpload> {
    return this.db.list(this.basePath);
  }

  deleteFile(fileUpload: FileUpload): void {
    this.deleteFileDatabase(fileUpload.key)
      .then(() => {
        // this.deleteFileStorage(fileUpload.name);
        this.deleteFileFromFireStore(fileUpload.name);
      })
      .catch(error => console.log(error));
  }

  private deleteFileDatabase(key: string): Promise<void> {
    return this.db.list(this.basePath).remove(key);
  }

  private deleteFileStorage(name: string): void {
    const storageRef = this.storage.ref(this.basePath);
    storageRef.child(name).delete();
  }

  async deleteFileFromFireStore(fileName: string): Promise<void> {
    try {
      const querySnapshot = await this.firestore
        .collection('Files')
        .ref.where('name', '==', fileName)
        .get();

      querySnapshot.forEach(async (doc) => {
        await doc.ref.delete();
      });
    } catch (error) {
      console.error('Error deleting document by name from Firestore:', error);
    }
  }
  
}