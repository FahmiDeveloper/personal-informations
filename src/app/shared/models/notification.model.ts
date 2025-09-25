export interface Notification {
  key?: string;
  date?: string;
  time?: string;
  subject?: string;
  formatDate?: string;
  notifSubjectDone?: boolean; 
  reminderKey?: string;
  reminderForId?: number;
}