/**
 * @kaizen_zone 756abe02-446a-441d-96fd-3b64239d74fc
 */
import { EventCatchers } from './EventCatchers';
import { SyntheticEvent } from 'UICommon/Events';

export interface MyHTMLElement extends HTMLElement {
    _$eventCatchers: EventCatchers;
    parentElement: HTMLElement;
}
interface IExtendEvent extends Event {
    handledByDispatcher: boolean;
}
export interface ISyntheticEvent extends SyntheticEvent {
    nativeEvent: IExtendEvent;
}

export type TEventHookFlag = {
    _$eventHook?: boolean;
};
