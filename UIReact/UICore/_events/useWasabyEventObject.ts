/**
 * @kaizen_zone a35eec2e-f16e-4783-9297-975d0fadc26b
 */
import { REACT_FAKE_CONTROL } from './PrepareWasabyEvent';

export function useWasabyEventObject(callbackFn) {
    callbackFn.saveWasabyEventObject = true;
    callbackFn.control = callbackFn.control ?? REACT_FAKE_CONTROL;
    return callbackFn;
}

export function withWasabyEventObject(callbackFn) {
    return useWasabyEventObject(callbackFn);
}
