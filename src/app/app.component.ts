import { Component } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dailycheck';
  public aufgaben: Observable<any>[] = [];
  email = '';
  password = '';
  user: firebase.User | null = null;
  selectedFile: File | null = null;
  fileName: string = '';

  images: { name: string, url: string }[] = [];

  constructor(afDb: AngularFireDatabase, private afAuth: AngularFireAuth, private firestore: AngularFirestore) {
    const itemsRef: AngularFireList<any> = afDb.list('Aufgaben');
    itemsRef.valueChanges().subscribe(
      x=> {this.aufgaben = x}
    );

    this.afAuth.authState.subscribe(user => {
      this.user = user;
    });
  }

   ngOnInit() {
    // Fetch all files from Firestore
    this.firestore.collection<FirestoreFile>('files').valueChanges({ idField: 'id' })
    .subscribe((files: FirestoreFile[]) => {
      this.images = files.map((file: FirestoreFile) => ({
        name: file.name,
        url: `data:${file.type};base64,${file.content}`
      }));
    });
  }

  async register() {
    try {
      const credential = await this.afAuth.createUserWithEmailAndPassword(this.email, this.password);
      console.log('Registered:', credential.user);
    } catch (error: any) {
      console.error('Registration error:', error.message);
    }
  }

  async login() {
    try {
      const credential = await this.afAuth.signInWithEmailAndPassword(this.email, this.password);
      console.log('Logged in:', credential.user);
    } catch (error: any) {
      console.error('Login error:', error.message);
    }
  }

  async logout() {
    await this.afAuth.signOut();
    console.log('User logged out');
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.fileName = this.selectedFile.name;
    }
  }

  uploadFile() {
    if (!this.selectedFile) {
      alert('No file selected!');
      return;
    }

    if (this.selectedFile.size > 1024 * 1024) {
      alert('File too large for Firestore. Max 1 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const fileData = e.target.result.split(',')[1]; // get Base64 part
      try {
        await this.firestore.collection('files').add({
          name: this.fileName,
          content: fileData,
          type: this.selectedFile?.type,
          uploadedAt: new Date()
        });
        alert('File uploaded to Firestore successfully!');
      } catch (err) {
        console.error(err);
        alert('Error uploading file!');
      }
    };
    reader.readAsDataURL(this.selectedFile);
  }
}

interface FirestoreFile {
  name: string;
  content: string;
  type: string;
}
