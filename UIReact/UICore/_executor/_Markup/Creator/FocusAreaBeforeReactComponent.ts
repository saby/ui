import { SyntheticEvent } from 'UICommon/Events';
import { TWasabyEvent } from 'UICore/Events';
import { IFocusChangedConfig, TFocusChangedCallback } from 'UICore/Focus';

type TFocusEventName = 'on:activated' | 'on:deactivated';
type TFocusEventObject = Partial<Record<TFocusEventName, TWasabyEvent[]>>;
const focusEventNames: TFocusEventName[] = ['on:activated', 'on:deactivated'];
const fakeFocusSyntheticEvent = new SyntheticEvent(null, {});

class FocusAreaBeforeReactComponent {
    private focusCallbacks: Record<string, TFocusChangedCallback>;
    executeFocusEventsObject(events: TFocusEventObject): TFocusEventObject {
        const focusEvents: TFocusEventObject = {};
        let hasFocusEvents: boolean;
        for (const focusEventName of focusEventNames) {
            if (events[focusEventName]) {
                hasFocusEvents = true;
                focusEvents[focusEventName] = events[focusEventName];
                delete events[focusEventName];
            }
        }
        if (hasFocusEvents) {
            return focusEvents;
        }
    }
    saveFocusEventsAsFocusCallbacks(focusAreaEvents: Record<string, Function>): void {
        if (focusAreaEvents.onActivated) {
            const onActivatedEventHandler = focusAreaEvents.onActivated;
            focusAreaEvents.onActivated = (cfg: IFocusChangedConfig) => {
                onActivatedEventHandler(fakeFocusSyntheticEvent, cfg);
            };
        }
        if (focusAreaEvents.onDeactivated) {
            const onDeactivatedEventHandler = focusAreaEvents.onDeactivated;
            focusAreaEvents.onDeactivated = (cfg: IFocusChangedConfig) => {
                onDeactivatedEventHandler(fakeFocusSyntheticEvent, cfg);
            };
        }
        this.focusCallbacks = focusAreaEvents as Record<string, TFocusChangedCallback>;
    }
    takeFocusCallbacks(): Record<string, TFocusChangedCallback> {
        const focusCallbacks = this.focusCallbacks;
        this.focusCallbacks = undefined;
        return focusCallbacks;
    }
}

export default new FocusAreaBeforeReactComponent();
