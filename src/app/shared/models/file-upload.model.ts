export class FileUpload {

  key?: string;
  name?: string;
  url?: string;
  file?: File;
  typeFileId?: number;
  fileNameWithoutType?: string;
  contextFile?: number;
  numRefFile?: number;
  
  constructor(file: File, typeFileId: number, contextFile: number, numRefFile: number) {
    this.file = file;
    this.typeFileId = typeFileId;
    this.contextFile = contextFile;
    this.numRefFile = numRefFile;
  }
  
}

export interface TypesFiles {
  id: number,
  title: string,
  type: string,
  icon: string
}

export interface ZipFile {
  readonly name: string;
  readonly dir: boolean;
  readonly date: Date;
  readonly data: any;
  fileName: string;
}