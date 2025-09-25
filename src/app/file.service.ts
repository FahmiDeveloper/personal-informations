import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private currentFilePath = 'currentFile/currentFile';

  constructor(private storage: AngularFireStorage) {}

  uploadCurrentFile(file: File): Promise<void> {
    const fileRef = this.storage.ref(this.currentFilePath);
    return this.storage.upload(this.currentFilePath, file)
      .then(() => console.log('File uploaded'));
  }

  getCurrentFileUrl(): Observable<string | null> {
    const fileRef = this.storage.ref(this.currentFilePath);
    return fileRef.getDownloadURL(); // returns Observable<string>
  }
}