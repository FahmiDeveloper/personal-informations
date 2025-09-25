export interface Todo {
  id?: string;
  title: string;
  completed: boolean;
  date: string;
  order?: number;
  range?: string;
  editingTaskId?: string;
}