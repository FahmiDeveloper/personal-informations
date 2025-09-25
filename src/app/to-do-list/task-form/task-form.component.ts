import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import * as moment from 'moment';

import { Todo } from 'src/app/shared/models/to-do-list.model';

@Component({
  selector: 'task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.scss']
})

export class TaskFormComponent implements OnInit{

  constructor(
    public dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { todo: Todo }
  ) {}

  ngOnInit(): void {
    if (!this.data.todo.id) this.data.todo.date = moment().format('YYYY-MM-DD');
  }

  onSave(): void {
    this.dialogRef.close(this.data.todo);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  
}