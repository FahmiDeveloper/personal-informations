export class Medication {
  key: string;
  medicationName: string;
  medicationFor: string;
  utilisation: string;
  numRefMedication: number;
  urlPicture: string;
  fileName: string;
  price: string;
  diseaseId: number
}

export interface Unit {
  unitName: string
}