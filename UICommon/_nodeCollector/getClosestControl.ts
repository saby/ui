import { IWrapHTMLElement, TControl } from './INodeCollector';
import { IControl } from 'UICommon/interfaces';

const isBrowserPlatform = typeof document !== 'undefined';

// TODO перевести всех пользователей на TControl, заменить getClosestControlInner на getClosestControl.
export function getClosestControl(target: HTMLElement): IControl {
    return getClosestControlInner(target) as unknown as IControl;
}

export function getClosestControlInner(target: IWrapHTMLElement): TControl {
    if (!isBrowserPlatform) {
        return;
    }
    let element: IWrapHTMLElement = target?.jquery ? target[0] : target;
    while (element && element !== document.documentElement && element !== document.body) {
        if (element._$controls && element._$controls.length) {
            return element._$controls[0].control;
        }
        if (element.wsControl && element.wsControl._container?.[0] === element) {
            return element.wsControl;
        }
        element = element.parentNode;
    }
}
