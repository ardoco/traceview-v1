export class FileManager {

    protected files : Map<string,string>;
    protected stateChangeListeners : (() => void)[] = [];

    constructor() {
        this.files = new Map<string,string>();
    }

    public addFile(name : string, content : string, overwrite : boolean = false) {
        if (this.files.has(name) && !overwrite) {
            throw new Error("File already exists");
        }
        this.files.set(name, content);
        for (let listener of this.stateChangeListeners) {
            listener();
        }
    }

    public removeFile(file : string) {
        this.files.delete(file);
        for (let listener of this.stateChangeListeners) {
            listener();
        }
    }

    public getAllFileNames() : string[] {
        return Array.from(this.files.keys());
    }

    public getContent(fileName : string) : string {
        if (!this.files.has(fileName)) {
            throw new Error("File does not exist");
        }
        return this.files.get(fileName)!;
    }

    public addListener(listener : () => void) : void {
        this.stateChangeListeners.push(listener);
    }
}