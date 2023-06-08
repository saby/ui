/**
 * Класс, который вызывает один раз функцию за цикл.
 * @public
 */
export class Runner {
    private _didStart: boolean;
    private _callback: Function;
    constructor(callback: Function) {
        this._callback = callback;
    }
    exec(...props: unknown[]): void {
        if (this._didStart) {
            return;
        }
        this._callback(...props);
        this._didStart = true;
    }
    reset(): boolean {
        this._didStart = false;
        return this._didStart;
    }
}
