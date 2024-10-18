/**
 * @kaizen_zone ce2d78ce-ad75-44f2-a211-06e89b0e061a
 */
import { TWasabyEvent } from 'UICore/Events';
import { TFocusChangedCallback } from 'UICore/Focus';

type TFocusEventName = 'on:activated' | 'on:deactivated';
type TFocusEventObject = Partial<Record<TFocusEventName, TWasabyEvent[]>>;
const focusEventNames: TFocusEventName[] = ['on:activated', 'on:deactivated'];

class FocusAreaBeforeReactComponent {
    private focusCallbacks?: Record<string, TFocusChangedCallback>;
    executeFocusEventsObject(events: TFocusEventObject): TFocusEventObject | undefined {
        const focusEvents: TFocusEventObject = {};
        let hasFocusEvents: true | undefined;
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
        this.focusCallbacks = focusAreaEvents as Record<string, TFocusChangedCallback>;
    }
    takeFocusCallbacks(): Record<string, TFocusChangedCallback> | undefined {
        const focusCallbacks = this.focusCallbacks;
        this.focusCallbacks = undefined;
        return focusCallbacks;
    }
}

export default new FocusAreaBeforeReactComponent();
