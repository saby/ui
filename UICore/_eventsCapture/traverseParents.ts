/**
 * @kaizen_zone 756abe02-446a-441d-96fd-3b64239d74fc
 */
import { TEventHookFlag } from './interfaces';

export function traverseParents<T extends HTMLElement>(
    fn: (currentElem: T) => boolean,
    container: T,
    context: string = ''
) {
    if (!container) {
        return;
    }
    const closestPopupElem =
        context === 'global' ? null : container.parentElement?.closest('.controls-Popup');

    let currentElem: T & TEventHookFlag = container as T & TEventHookFlag;
    while (
        currentElem &&
        currentElem !== closestPopupElem &&
        currentElem !== document.documentElement &&
        currentElem !== document.body
    ) {
        const result = fn(currentElem);
        if (result) {
            break;
        }
        currentElem = currentElem.parentElement as T & TEventHookFlag;
    }
}
