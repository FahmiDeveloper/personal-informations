import { Component, OnDestroy, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';

import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';

import { TaskFormComponent } from './task-form/task-form.component';

import { TodoListService } from 'src/app/shared/services/to-do-list.service';

import { Todo } from 'src/app/shared/models/to-do-list.model';

@Component({
  selector: 'to-do-list',
  templateUrl: './to-do-list.component.html',
  styleUrls: ['./to-do-list.scss']
})

export class ToDoListComponent implements OnInit, OnDestroy {

  isDesktop = false;
  isTablet = false;
  isMobile = false;
  dragIsDisabled = true;

  todos: Todo[] = [];
  editingTaskId = '';

  subscriptionForGetAllToDoList: Subscription;

  constructor(
    private todoService: TodoListService, 
    public dialog: MatDialog,
    private deviceService: DeviceDetectorService
  ) {}

  ngOnInit() {
    this.isDesktop = this.deviceService.isDesktop();
    this.isTablet = this.deviceService.isTablet();
    this.isMobile = this.deviceService.isMobile();

    this.subscriptionForGetAllToDoList = this.todoService.getTodos().subscribe((data) => {
      this.todos = data.sort((a, b) => (a.order || 0) - (b.order || 0));
      this.todos.forEach(task => {
        task.editingTaskId = task.id;
        if (task.date == this.checkIfToday(new Date())) {
          task.range = 'Today';
        } else if (this.checkIfTomorrow(task.date)) {
          task.range = 'Tomorrow';
        } else {
          task.range = task.date;
        }
      })
    });
  }

  checkIfToday(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');  
    return `${year}-${month}-${day}`;
  }

  checkIfTomorrow(taskDate: string): boolean {
    let elementDate: Date = new Date(taskDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); 
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    elementDate.setHours(0, 0, 0, 0);
    return elementDate.getTime() === tomorrow.getTime();
  }

  checkPassedTask(taskDate: string): boolean {
    let elementDate: Date = new Date(taskDate);
    return elementDate.getTime() <  new Date().getTime();
  }

  addTodo() {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: this.isMobile ?'98vw' : '',
      maxWidth: '100vw',
      data: { todo: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveAdd(result);
      }
    });
  }

  saveAdd(todo: Todo) {
    if (todo.title.trim()) {
      const addTodo: Todo = { 
        title: todo.title,
        completed: false, 
        date: todo.date,
        order: this.todos.length
      };
      this.todoService.addTodo(addTodo).then(() => {
        Swal.fire(
          'New task added successfully',
          '',
          'success'
        );
      });
    }
  }

  editTodo(todo: Todo) {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: this.isMobile ?'98vw' : '',
      maxWidth: '100vw',
      data: { todo: { ...todo } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveEdit(result);
      }
    });
  }

  saveEdit(todo: Todo) {
    if (todo.title.trim()) {
      const updatedTodo: Todo = { 
        ...todo, 
        title: todo.title, 
        date: todo.date 
      };
      this.todoService.updateTodo(updatedTodo).then(() => {
        Swal.fire(
          'Task has been updated successfully',
          '',
          'success'
        );
      });
    }
  }

  deleteTodo(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this task!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.todoService.deleteTodo(id);
        Swal.fire(
          'Task has been deleted successfully',
          '',
          'success'
        )
      }
    })
  }

  drop(event: CdkDragDrop<Todo[]>) {
    moveItemInArray(this.todos, event.previousIndex, event.currentIndex);

    // Update Firestore with new order
    this.todos.forEach((todo, index) => {
      todo.order = index;
      this.todoService.updateTodo(todo);
    });
  }

  onCheckboxChange(checked: boolean, todo: Todo): void {
    if (checked == true) {
      todo.completed = true;
    } else {
      todo.completed = false;
    }
    this.todoService.updateTodo(todo);
  }

  ngOnDestroy() {
    this.subscriptionForGetAllToDoList.unsubscribe();
  }

}