import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuTrigger } from '@angular/material/menu';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import * as Prism from 'prismjs';

import { NoteFormDesktopComponent } from './note-form-desktop/note-form-desktop.component';

import { NoteService } from 'src/app/shared/services/note.service';

import { Note } from 'src/app/shared/models/note.model';

@Component({
  selector: 'notes-for-desktop',
  templateUrl: './notes-for-desktop.component.html',
  styleUrls: ['./notes-for-desktop.scss']
})

export class NotesForDesktopComponent implements OnInit, AfterViewChecked, OnDestroy {

  notesList: Note[] = [];
  notesListCopie: Note[] = [];

  p = 1;
  keywordForSearch = '';
  isTablet: boolean;
  keywordSelected = '';
  contentCode = '';
  keywordsList: string[] = [];
  keywordsListCopie: string[] = [];
  keywordsListCopieForForm: string[] = [];
  codeUsedContentList: string[] = [];
  showCodeUsed = false;

  menuTopLeftPosition =  {x: '0', y: '0'} 

  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger: MatMenuTrigger;
  @ViewChild('searchInput') inputElement!: ElementRef;

  subscriptionForGetAllNotes: Subscription;
  subscriptionForGetAllNotesForAdd: Subscription;
  subscriptionForGetAllKeywordsNotes: Subscription;

  constructor(
    public noteService: NoteService,
    public dialogService: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.getAllKeywordsNotes();
    this.getAllNotes();
    this.getAllNotesForAdd();
  }

  ngAfterViewChecked() {
    Prism.highlightAll();
  }

  getAllKeywordsNotes() {
    this.subscriptionForGetAllKeywordsNotes = this.noteService
    .getAll()
    .subscribe((notes: Note[]) => {

      this.keywordsList = [];
      this.keywordsListCopie = [];
      this.keywordsListCopieForForm = [];
         
      notes.forEach(note => {
        if (!this.keywordsList.includes(note.keyword)) {
          this.keywordsList.push(note.keyword);
          this.keywordsListCopie.push(note.keyword);
          this.keywordsListCopieForForm.push(note.keyword);
        }
      })
    });
  }

  getAllNotes() {

    this.subscriptionForGetAllNotes = this.noteService
    .getAll()
    .subscribe((notes: Note[]) => {

      if (this.showCodeUsed) {
        if (this.contentCode) {
          this.notesList = notes.filter(note => note.keyword == 'Code used' && note.contentCode.toLowerCase().includes(this.contentCode.toLowerCase()));
        }
        else {
          this.notesList = notes.filter(note => note.keyword == 'Code used');
        }
      }
      
      else if (this.keywordSelected) {
        this.notesList = notes.filter(note => note.keyword !== 'Code used' && note.keyword == this.keywordSelected);
      }

      else {
        if (this.contentCode) this.contentCode = '';
        this.notesList = notes.filter(note => note.keyword !== 'Code used').sort((n1, n2) => n2.numRefNote - n1.numRefNote);
      }

      this.notesList = this.showCodeUsed || this.keywordSelected ? this.notesList.sort((n1, n2) => n1.numRefNote - n2.numRefNote) : this.notesList.sort((n1, n2) => n2.numRefNote - n1.numRefNote);
      
    });
  }

  getAllNotesForAdd() {
    this.subscriptionForGetAllNotesForAdd = this.noteService
    .getAll()
    .subscribe((notesForAdd: Note[]) => {

      this.notesListCopie = notesForAdd.sort((n1, n2) => n2.numRefNote - n1.numRefNote); 
           
    });
  }

  OnPageChange(){
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  newNote() {
    let config: MatDialogConfig = {panelClass: "dialog-responsive"}
    const dialogRef = this.dialogService.open(NoteFormDesktopComponent, config);

    dialogRef.componentInstance.arrayNotes = this.notesListCopie;
    dialogRef.componentInstance.keywordsListCopieForForm = this.keywordsListCopieForForm;
  }

  editNote(note?: Note) {
    let config: MatDialogConfig = {panelClass: "dialog-responsive"}
    const dialogRef = this.dialogService.open(NoteFormDesktopComponent, config);
    
    dialogRef.componentInstance.note = note;
    dialogRef.componentInstance.keywordsListCopieForForm = this.keywordsListCopieForForm;
  }

  deleteNote(noteKey) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this content note!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.noteService.delete(noteKey);
        Swal.fire(
          'Note has been deleted successfully',
          '',
          'success'
        )
      }
    })
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

  viewPath(path: string) {
    window.open(path);
  }

  onRightClick(event: MouseEvent, note: Note) { 
    // preventDefault avoids to show the visualization of the right-click menu of the browser 
    event.preventDefault(); 

    // we record the mouse position in our object 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 

    // we open the menu 
    // we pass to the menu the information about our object 
    this.matMenuTrigger.menuData = {note: note};

    // we open the menu 
    this.matMenuTrigger.openMenu(); 
  }

  filterOptions() {
    this.keywordsList = [];
    if (this.keywordForSearch) {
      this.keywordsList = this.keywordsListCopie.filter(keyword => keyword.toLowerCase().includes(this.keywordForSearch.toLowerCase()));
    } else {
      this.keywordsList = this.keywordsListCopie;
      if (this.keywordSelected) this.keywordSelected = '';
      this.getAllNotes();
    }
  }

  onSelectOpened(isOpened: boolean) {
    if (isOpened) {
      setTimeout(() => {
        this.inputElement.nativeElement.focus();
      });
    }
  }

  showContentCodeList(contentCodeList) {
    this.dialogService.open(contentCodeList, {width: '1000px'});

    this.codeUsedContentList = [];
    
    this.notesList.forEach(note => {
      if (!this.codeUsedContentList.includes(note.contentCode)) {
        this.codeUsedContentList.push(note.contentCode);
      }
    });
  }

  ngOnDestroy() {
    this.subscriptionForGetAllNotes.unsubscribe();
    this.subscriptionForGetAllNotesForAdd.unsubscribe()
  }

}