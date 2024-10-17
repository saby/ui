/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import { goUpByControlTree } from 'UICore/NodeCollector';
import { TFocusComponent } from './IFocusComponent';

function isAlive(focusComponent: TFocusComponent): boolean {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore может прийти совместимость.
    return (
        !(focusComponent._destroyed || focusComponent._isDestroyed) &&
        focusComponent._container
    );
}

export default function getParentFocusComponents(
    element: HTMLElement
): TFocusComponent[] {
    if (!element) {
        return [];
    }
    return (
        goUpByControlTree(
            element,
            undefined,
            true
        ) as unknown as TFocusComponent[]
    ).filter(isAlive);
}
