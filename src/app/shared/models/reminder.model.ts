export class Reminder {
  key: string;
  date: string;
  time: string;
  subject: string;
  targetDate: string;
  day: string; 
  reminderNotDone: boolean;
  reminderFor: number;
}

export interface ReminderForList {
  id: number;
  reminderForName: string;
}