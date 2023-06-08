/**
 */

export interface ITouchEvent extends TouchEvent {
    touches: TouchList;
    clientX: number;
    clientY: number;
    addedToClickState?: boolean;
}

export interface IEventState extends Event {
    time: number;
    location: ITouchLocation | null;
    target: EventTarget;
}

export interface ITouchLocation {
    x: number;
    y: number;
}
export interface ILongTapEvent extends Event {
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
    screenX: number;
    screenY: number;
}

export class WasabyTouchEvent {
    private static initEventHandlers = {};

    static getTouchLocation(event: ITouchEvent): ITouchLocation {
        const data = event.touches ? event.touches[0] : event;
        return {
            x: data.clientX,
            y: data.clientY,
        };
    }

    static hasEventData(eventState: IEventState): EventTarget {
        return eventState && eventState.target;
    }

    static initEventState(
        event: ITouchEvent,
        eventState: IEventState,
        initHandler: Function,
        handlerName: string
    ): IEventState {
        if (handlerName && initHandler) {
            // collect information about event
            this.initEventHandlers[handlerName] = initHandler;
        }
        eventState.time = Date.now();
        eventState.location = this.getTouchLocation(event);
        eventState.target = event.target;
        return eventState;
    }

    /// Обработка события
    static stopInitializedHandler(): void {
        // eslint-disable-next-line guard-for-in
        for (const reset in this.initEventHandlers) {
            // @ts-ignore
            this.initEventHandlers[reset].resetState();
        }
    }
}
