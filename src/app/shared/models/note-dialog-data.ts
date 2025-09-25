import { Note } from "./note.model";

export interface NoteDialogData {
    note: Partial<Note>;
    enableDelete: boolean;
}