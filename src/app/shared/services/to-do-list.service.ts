import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { Observable } from 'rxjs';

import { Todo } from '../models/to-do-list.model';

@Injectable({
  providedIn: 'root'
})
export class TodoListService {
  private collectionName = 'todos';

  constructor(private firestore: AngularFirestore) {}

  getTodos(): Observable<Todo[]> {
    return this.firestore.collection<Todo>(this.collectionName).valueChanges({ idField: 'id' });
  }

  addTodo(todo: Todo): Promise<void> {
    const id = this.firestore.createId();
    return this.firestore.collection(this.collectionName).doc(id).set({
      ...todo,
      id,
      date: todo.date,
      order: todo.order || 0
    });
  }

  updateTodo(todo: Todo): Promise<void> {
    return this.firestore.collection(this.collectionName).doc(todo.id).update({
      title: todo.title,
      completed: todo.completed,
      date: todo.date,
      order: todo.order
    });
  }

  deleteTodo(id: string): Promise<void> {
    return this.firestore.collection(this.collectionName).doc(id).delete();
  }
}