import { Task } from "./task.model";

export interface TaskDialogData {
    task: Partial<Task>;
    enableDelete: boolean;
}