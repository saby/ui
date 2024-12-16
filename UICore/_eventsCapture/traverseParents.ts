/**
 * @kaizen_zone 756abe02-446a-441d-96fd-3b64239d74fc
 */
export function traverseParents<T extends HTMLElement>(
    fn: (currentElem: T) => boolean,
    container: T,
    context: string = ''
) {
    const closestPopupElem =
        context === 'global' ? null : container.parentElement?.closest('.controls-Popup');

    let currentElem = container as T;
    while (
        currentElem &&
        currentElem !== closestPopupElem &&
        (currentElem._$eventHook !== true ||
            (currentElem._$eventHook === true && currentElem === container)) &&
        currentElem !== document.documentElement &&
        currentElem !== document.body
    ) {
        const result = fn(currentElem);
        if (result) {
            break;
        }
        currentElem = currentElem.parentElement;
    }
}
