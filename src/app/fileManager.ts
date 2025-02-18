export enum FileType {
  IMG,
  TXT,
}

export class FileManager {
  protected files: Map<string, string>;
  protected types: Map<string, FileType>;
  protected stateChangeListeners: (() => void)[] = [];

  constructor() {
    this.files = new Map<string, string>();
    this.types = new Map<string, FileType>();
  }

  private readFileAsync = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target!.result as string);
      };
      if (file.type !== "text/plain" && file.type != "application/json") {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  public async addFiles(files: File[]) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileContent = await this.readFileAsync(file);
      this.files.set(file.name, fileContent);
      this.types.set(
        file.name,
        file.type == "text/plain" || file.type == "application/json"
          ? FileType.TXT
          : FileType.IMG,
      );
    }

    for (let listener of this.stateChangeListeners) {
      listener();
    }
  }

  public addTextFile(
    name: string,
    content: string,
    overwrite: boolean = false,
  ) {
    if (this.files.has(name) && !overwrite) {
      throw new Error("File already exists");
    }
    this.files.set(name, content);
    this.types.set(name, FileType.TXT);
    for (let listener of this.stateChangeListeners) {
      listener();
    }
  }

  public removeFile(file: string) {
    this.files.delete(file);
    for (let listener of this.stateChangeListeners) {
      listener();
    }
  }

  public getAllFileNames(): string[] {
    return Array.from(this.files.keys());
  }

  public getContent(fileName: string): string {
    if (!this.files.has(fileName)) {
      throw new Error('File  "' + fileName + '" does not exist');
    }
    return this.files.get(fileName)!;
  }

  public isTextFile(fileName: string): boolean {
    return this.types.get(fileName) == FileType.TXT;
  }

  public addListener(listener: () => void): void {
    this.stateChangeListeners.push(listener);
  }

  public getSymbol(fileName: string): string {
    if (this.types.get(fileName) == FileType.TXT) {
      return "🖹";
    } else if (this.types.get(fileName) == FileType.IMG) {
      return "🖼";
    } else {
      return "🖹";
    }
  }
}
