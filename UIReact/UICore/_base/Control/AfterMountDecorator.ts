export default class AfterMountDecorator {
    private _delayedEvents: Function[] = [];

    saveDelayedEvent(handler: Function): void {
        this._delayedEvents.push(handler);
    }

    executeDelayedEvent(): void {
        while (this._delayedEvents.length) {
            this._delayedEvents.shift()();
        }
    }
}
