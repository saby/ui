/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
export default class AfterMountDecorator {
    private _delayedEvents: Function[] = [];

    saveDelayedEvent(handler: Function): void {
        this._delayedEvents.push(handler);
    }

    executeDelayedEvent(): void {
        const delayedEvents = this._delayedEvents;
        this._delayedEvents = [];
        for (const handler of delayedEvents) {
            handler();
        }
    }
}
