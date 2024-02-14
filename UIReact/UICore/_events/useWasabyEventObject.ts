export function useWasabyEventObject(callbackFn) {
    callbackFn.saveWasabyEventObject = true;
    return callbackFn;
}

export function withWasabyEventObject(callbackFn) {
    return useWasabyEventObject(callbackFn);
}
