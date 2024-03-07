export abstract class Closeable {

    private closeListeners : (() => void)[] = [];

    protected shouldClose() : void {
        for (let listener of this.closeListeners) {
            listener();
        }
    }
    
    public addCloseListener(listener : () => void) : void {
        this.closeListeners.push(listener);
    }
}