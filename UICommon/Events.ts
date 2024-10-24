/**
 * Библиотека событий
 * @library UICommon/Events
 * @includes CommonEvents UICommon/Events
 * @includes SyntheticEvent UICommon/_events/SyntheticEvent
 * @public
 */

export { FastTouchEndController } from './_events/Touch/FastTouchEndController';
export { ITouchEvent } from './_events/Touch/TouchEvents';
export { ITouchHandlers } from './_events/Touch/BuildTouchHandlers';
export { SwipeController } from './_events/Touch/SwipeController';
export { LongTapController } from './_events/Touch/LongTapController';
export { useTouches } from './_events/Touch/ReactTouch';
export { TouchEventPolyfill } from './_events/Touch/ReactTouchClasses';

export {
    IWasabyEventSystem,
    IEventConfig,
    IFixedEvent,
    ISyntheticEvent,
    TWasabyEvent,
    TWasabyBind,
    IWasabyEventBase,
    TEventObject,
    IHandlerInfo,
    IEventStartArray,
    TReactEvent,
    TTemplateEventObject,
    ITemplateEventBase,
    ITemplateBindEvent,
    TEventHandler,
    // TODO: удалить
    IWasabyEvent,
} from './_events/IEvents';
export * as EventUtils from './_events/EventUtils';
export * as Subscriber from './_events/Subscriber';

export { default as SyntheticEvent } from './_events/SyntheticEvent';
export { BuildTouchHandlers } from './_events/Touch/BuildTouchHandlers';
