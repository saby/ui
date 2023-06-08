/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import getParentFocusComponents from './getParentFocusComponents';
import { TFocusComponent, IFocusChangedConfig } from './IFocusComponent';

export default function callFocusChangedCallbacks(
    fromElement: HTMLElement,
    toElement: HTMLElement,
    focusChangedConfig: IFocusChangedConfig
): void {
    if (fromElement === toElement) {
        return;
    }

    const fromParents: TFocusComponent[] =
        getParentFocusComponents(fromElement);
    const toParents: TFocusComponent[] = getParentFocusComponents(toElement);

    // Из-за внедрения колбеков для чистого реакта могут быть не очевидный порядок родителей.
    // Массив не очень большой, так что заметного замедления не будет.
    const uniqueFromParents = fromParents.filter((fromParent) => {
        return !toParents.includes(fromParent);
    });
    const uniqueToParents = toParents.filter((toParent) => {
        return !fromParents.includes(toParent);
    });

    // _$to используется в Controls/_compatiblePopup/CompoundAreaForNewTpl/CompoundArea
    const compatFocusChangedConfig = {
        _$to: toParents[0],
        ...focusChangedConfig,
    };

    for (let i = 0; i < uniqueFromParents.length; i++) {
        callDeactivatedCallback(
            uniqueFromParents[i],
            uniqueFromParents[i - 1],
            focusChangedConfig
        );
    }
    for (let i = 0; i < uniqueToParents.length; i++) {
        callActivatedCallback(
            uniqueToParents[i],
            uniqueToParents[i - 1],
            compatFocusChangedConfig
        );
    }
}

function callDeactivatedCallback(
    focusComponent: TFocusComponent,
    prevComponent: TFocusComponent,
    focusChangedConfig: IFocusChangedConfig
): void {
    if (focusComponent.isFocusCallbacksObject) {
        return focusComponent.onDeactivated?.(focusChangedConfig);
    }
    // @ts-ignore _container protected поле, так нельзя.
    if (
        !prevComponent ||
        prevComponent.isFocusCallbacksObject ||
        prevComponent._container !== focusComponent._container
    ) {
        // @ts-ignore _notify protected метод, так нельзя.
        focusComponent._notify?.('deactivated', [focusChangedConfig]);
    }
}

function callActivatedCallback(
    focusComponent: TFocusComponent,
    prevComponent: TFocusComponent,
    focusChangedConfig: IFocusChangedConfig
): void {
    if (focusComponent.isFocusCallbacksObject) {
        return focusComponent.onActivated?.(focusChangedConfig);
    }
    // @ts-ignore _container protected поле, так нельзя.
    if (
        !prevComponent ||
        prevComponent.isFocusCallbacksObject ||
        prevComponent._container !== focusComponent._container
    ) {
        // @ts-ignore _notify protected метод, так нельзя.
        focusComponent._notify?.('activated', [focusChangedConfig]);
    }
}
