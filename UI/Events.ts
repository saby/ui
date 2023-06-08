/**
 * @kaizen_zone a35eec2e-f16e-4783-9297-975d0fadc26b
 */
/**
 * Библиотека событий
 * @library UI/Events
 * @includes CoreEvents UICore/Events
 * @includes CommonEvents UICommon/Events
 * @includes EventUtils UICommon/_events/EventUtils
 * @public
 */

export {
    WasabyEvents,
    getArgs,
    __notifyFromReact
} from 'UICore/Events';
export {
    useWasabyEventObject,
    withWasabyEventObject,
} from 'UICore/Events';

export { Subscriber, EventUtils, SyntheticEvent } from 'UICommon/Events';
