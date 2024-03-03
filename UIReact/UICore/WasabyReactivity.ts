/**
 * @kaizen_zone cf0628a5-e0cb-4894-81b8-a7bba0fb4fce
 */
export { makeWasabyObservable, releaseProperties } from './_wasabyReactivity/MakeObservable';
export { pauseReactive } from './_wasabyReactivity/ReactiveUpdateManager';
export {
    useObservableOfVersion,
    observeVersionChange,
    unobserveVersionChange,
} from './_wasabyReactivity/VersionChangeObserver';
