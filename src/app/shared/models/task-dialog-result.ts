import { Task } from "./task.model";

export interface TaskDialogResult {
    task: Task;
    delete?: boolean;
}