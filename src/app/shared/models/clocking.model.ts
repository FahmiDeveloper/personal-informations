export class Clocking {
  key: string;
  dateClocking: string;
  timeClocking: string;
  clockingNbr: number;
  note: string;
  numRefClocking: number;
  day: string; 
  restVacationDays: number;
  subjectId: number;
  dateEndVaction: string;
}

export interface MonthsList {
  monthNbr: string;
  monthName: string;
}

export interface SubjectList {
  id: number;
  subjectName: string;
}