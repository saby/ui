import { REACT_FAKE_CONTROL } from './PrepareWasabyEvent';

export function useWasabyEventObject(callbackFn) {
    callbackFn.saveWasabyEventObject = true;
    callbackFn.control = callbackFn.control ?? REACT_FAKE_CONTROL;
    return callbackFn;
}

export function withWasabyEventObject(callbackFn) {
    return useWasabyEventObject(callbackFn);
}
