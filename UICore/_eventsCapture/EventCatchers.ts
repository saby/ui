/**
 * @kaizen_zone 756abe02-446a-441d-96fd-3b64239d74fc
 */
type ICatchEvent = <T extends Event>(event: T) => boolean;
type IEventCatcher = [ICatchEvent, HTMLElement];

export class EventCatchers {
    private eventCatchers: IEventCatcher[] = [];
    add(eventCatcher: { catchEvent: ICatchEvent; container: HTMLElement }) {
        const index = this.eventCatchers.findIndex(([curCatchEvent, _container]) => {
            return curCatchEvent === eventCatcher.catchEvent;
        });
        if (index === -1) {
            this.eventCatchers.push([eventCatcher.catchEvent, eventCatcher.container]);
        }
    }
    getAll() {
        return this.eventCatchers;
    }
    remove(catchEvent: ICatchEvent) {
        const index = this.eventCatchers.findIndex(([curCatchEvent, _container]) => {
            return curCatchEvent === catchEvent;
        });
        if (index !== -1) {
            this.eventCatchers.splice(index, 1);
        }
    }
}
