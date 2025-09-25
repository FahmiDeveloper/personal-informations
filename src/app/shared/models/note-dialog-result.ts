import { Note } from "./note.model";

export interface NoteDialogResult {
    note: Note;
    delete?: boolean;
}