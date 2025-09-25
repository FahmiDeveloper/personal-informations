import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import Swal from 'sweetalert2';

import { NoteService } from 'src/app/shared/services/note.service';

import { Note } from 'src/app/shared/models/note.model';

@Component({
  selector: 'note-form-for-tablet',
  templateUrl: './note-form-for-tablet.component.html',
  styleUrls: ['./note-form-for-tablet.scss']
})

export class NoteFormForTabletComponent implements OnInit {

  arrayNotes: Note[];
  keywordsListCopieForForm: string[];
  keywordsListForForm: string[] = [];

  note: Note = new Note();

  keywordForSearch = '';

  @ViewChild('searchInput') inputElement!: ElementRef;
  
  constructor(
    public noteService: NoteService,
    public dialogRef: MatDialogRef<NoteFormForTabletComponent>
  ) {}

  ngOnInit() {
    this.keywordsListForForm = [];
    this.keywordsListForForm = this.keywordsListCopieForForm;
  }

  save() {
    if (this.note.key) {

      this.noteService.update(this.note.key, this.note);

      Swal.fire(
        'Note data has been updated successfully',
        '',
        'success'
      )

    } else {

      if (this.arrayNotes[0] && this.arrayNotes[0].numRefNote) this.note.numRefNote = this.arrayNotes[0].numRefNote + 1;
      else this.note.numRefNote = 1;

      this.noteService.create(this.note);

      Swal.fire(
      'New note added successfully',
      '',
      'success'
      )

    }
    this.close();
  }

  filterOptions() {
    this.keywordsListForForm = [];
    if (this.keywordForSearch) {
      this.keywordsListForForm = this.keywordsListCopieForForm.filter(keyword => keyword.toLowerCase().includes(this.keywordForSearch.toLowerCase()));
    } else {
      this.keywordsListForForm = this.keywordsListCopieForForm;
    }
  }

  newKeyword() {
    Swal.fire({
      title: 'New keyword',
      input: 'text',
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.note.keyword = result.value;
        this.keywordsListForForm.push(result.value);
      }
    })
  }

  onSelectOpened(isOpened: boolean) {
    if (isOpened) {
      setTimeout(() => {
        this.inputElement.nativeElement.focus();
      });
    }
  }

  close() {
    this.dialogRef.close();
  }

}