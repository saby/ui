/**
 * Библиотека событий
 * @includes WasabyEvents UICore/_events/WasabyEvents
 * @includes Notify UICore/_events/Notify
 * @includes Hooks UICore/_events/Hooks
 */

export {
    default as WasabyEvents,
    REACT_FAKE_CONTROL,
    TWasabyEvent,
    TTemplateEventObject,
    TEventObject,
    TReactEvent,
} from './_events/WasabyEvents';
export { default as TouchEvents } from './_events/TouchEvents';
export { callNotify, getArgs, notifyFromReact as __notifyFromReact } from './_events/Notify';
export { default as NotifyWrapper } from './_events/NotifyWrapper';
export { isCustomEvent } from './_events/DetectCustomEvent';
export { default as EventSubscriber } from './_events/EventSubscriber';
export { resolveEventName } from './_events/PrepareWasabyEvent';
export { reactEventList, wasabyEventIntersection } from './_events/ReactEventList';
export { useWasabyEventObject, withWasabyEventObject } from './_events/useWasabyEventObject';
