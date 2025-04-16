import { Storage, getWidth, getHeight } from './Aspects';

export interface IBodySizes {
    containerClientWidth: number;
    containerClientHeight: number;
}
const nop = () => {};

abstract class BodySizeTrackerAbstract {
    abstract check(cb: (params: IBodySizes) => void, tracker: boolean): () => void;
    static _$storage: any;
}

class BodySizeTrackerClient extends BodySizeTrackerAbstract {
    private domElementWithSizes: HTMLElement;
    private _cachedAspects: IBodySizes;
    constructor(domElementWithSizes?: HTMLElement) {
        super();
        this.domElementWithSizes = domElementWithSizes || document.body;
    }
    private _track(cb: (aspects: IBodySizes) => void) {
        // вычислить из куки избежав recalculate style не получится, могут быть ошибки
        // могут зайти на другую страницу с другими размерами и возьмется неправильное значение
        const bodyStyles = getComputedStyle(this.domElementWithSizes);
        const top = parseInt(bodyStyles.getPropertyValue('padding-top'), 10) || 0;
        const bottom = parseInt(bodyStyles.getPropertyValue('padding-bottom'), 10) || 0;
        const left = parseInt(bodyStyles.getPropertyValue('padding-left'), 10) || 0;
        const right = parseInt(bodyStyles.getPropertyValue('padding-right'), 10) || 0;
        const containerClientWidth = this.domElementWithSizes.clientWidth - left - right;
        const containerClientHeight = this.domElementWithSizes.clientHeight - top - bottom;

        if (this.domElementWithSizes === document.body) {
            // сохраняем только для SizeTracker зарегистрированного для document.body,
            // остальные зовутся с AdaptiveInitializer которые не должны писать в куку ничего,
            // это могут быть AdaptiveInitializer добавленные в createControl для совместимости,
            // или вообще построения adaptieveMode из fromJSON, это все не должно влиять на куку.
            // Кука обновляется только для одного трекера, зарегистрированного для корневого AdaptiveInitializer,
            // а у него передается элемент body в качестве отслеживаемого
            BodySizeTrackerClient.getStorage().set({
                containerClientWidth,
                containerClientHeight,
            });
        }

        if (
            !this._cachedAspects ||
            this._cachedAspects.containerClientWidth !== containerClientWidth ||
            this._cachedAspects.containerClientHeight !== containerClientHeight
        ) {
            this._cachedAspects = {
                containerClientWidth,
                containerClientHeight,
            };
        }

        cb(this._cachedAspects);
    }

    check(cb: (params: IBodySizes) => void, tracker: boolean): () => void {
        this._track(cb);
        if (typeof ResizeObserver === 'undefined') {
            return nop;
        }
        if (!tracker) {
            return nop;
        }

        const trackBinded = this._track.bind(this, cb);

        // create an Observer instance
        const resizeObserver = new ResizeObserver(trackBinded);

        // start observing a DOM node
        resizeObserver.observe(this.domElementWithSizes);
        return () => {
            resizeObserver.unobserve(this.domElementWithSizes);
        };
    }

    private static getStorage(): Storage {
        return BodySizeTrackerClient._$storage ?? Storage.getInstance();
    }
}

class BodySizeTrackerServer extends BodySizeTrackerAbstract {
    private _track(cb: (aspects: IBodySizes) => void) {
        const aspects = BodySizeTrackerServer.getStorage().get();
        const containerClientWidth = getWidth(aspects, 'containerClientWidth');
        const containerClientHeight = getHeight(aspects, 'containerClientHeight');
        cb({
            containerClientWidth,
            containerClientHeight,
        });
    }
    check(cb: (params: IBodySizes) => void, _tracker: boolean): () => void {
        this._track(cb);
        return nop;
    }

    private static getStorage(): Storage {
        return BodySizeTrackerServer._$storage ?? Storage.getInstance();
    }
}

export const BodySizeTracker =
    typeof window === 'undefined' ? BodySizeTrackerServer : BodySizeTrackerClient;
export type BodySizeTracker = BodySizeTrackerServer | BodySizeTrackerClient;
