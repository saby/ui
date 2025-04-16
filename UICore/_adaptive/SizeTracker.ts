/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
import { debounce } from 'Types/function';
import { IWindowSizes, WindowSizeTracker } from './WindowSizeTracker';
import { IBodySizes, BodySizeTracker } from './BodySizeTracker';

type TSizeTrackerCallback = (params: unknown) => void;

export interface ISizes extends Partial<IWindowSizes>, Partial<IBodySizes> {}

export class SizeTracker {
    private windowSizeTracker: WindowSizeTracker;
    private bodySizeTracker: BodySizeTracker;

    constructor(domElementWithSizes?: HTMLElement) {
        this.windowSizeTracker = new WindowSizeTracker(domElementWithSizes);
        this.bodySizeTracker = new BodySizeTracker(domElementWithSizes);
    }

    check(callback: TSizeTrackerCallback, tracker: boolean = false): () => void {
        // debounce нужен только на клиенте, чтобы не запускать пересчет размеров слишком часто
        const callbackDebounced =
            typeof window !== 'undefined' ? debounce(callback, 1000) : callback;
        let _windowSizes: Partial<IWindowSizes> = {};
        let _bodySizes: Partial<IBodySizes> = {};
        const stopWindowSizeChecking = this.windowSizeTracker.check((windowSizes) => {
            _windowSizes = windowSizes;
            callbackDebounced({
                ..._windowSizes,
                ..._bodySizes,
            });
        }, tracker);
        const stopBodySizeChecking = this.bodySizeTracker.check((bodySizes) => {
            _bodySizes = bodySizes;
            callbackDebounced({
                ..._windowSizes,
                ..._bodySizes,
            });
        }, tracker);
        callback({
            ..._windowSizes,
            ..._bodySizes,
        });
        return () => {
            stopWindowSizeChecking();
            stopBodySizeChecking();
        };
    }
}
