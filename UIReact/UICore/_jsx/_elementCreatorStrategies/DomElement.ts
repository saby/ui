import { ReactElement } from 'react';
import { reactEventList } from 'UICore/Events';
import { mergeAttrs } from 'UICore/Executor';
import { ChainOfRef } from 'UICore/Ref';
import {
    ChildrenPropsModificatorStratagy,
    TRefType,
    IClonedChildProps,
    IInternalPropsWithWasabyChildren,
} from '../ChildrenPropsModificator';

/**
 * Создание стратегии модификации пропсов DOM элемента.
 * My.tsx
 * <WasabyControl>
 *     <div className="domElement">domElement</div>
 * </WasabyControl>
 * @private
 */
export const domElementStrategy = new ChildrenPropsModificatorStratagy(
    isDOMTypeElementChild,
    modifyDomChildrenProps
);

function isDOMTypeElementChild(
    children: ReactElement
): children is ReactElement<IClonedChildProps, string> {
    return typeof children.type === 'string';
}

function modifyDomChildrenProps(
    children: ReactElement<IClonedChildProps, string> & {
        ref?: TRefType;
    },
    nextProps: IInternalPropsWithWasabyChildren,
    nextRef: TRefType
): IClonedChildProps {
    const clonedChildPropsDOM: IClonedChildProps = mergeAttrs(children.props, nextProps.attrs);
    for (const eventName of reactEventList) {
        const eventValue = nextProps[eventName];

        // Если на элементе был обработчик одноимённого события из tsx - он пропадёт.
        // На данный момент в этой точке безопаснее всего оставить обработчик из wml.
        // Если понадобится - придётся вызвать оба. Но аккуратно с порядком.
        // И ещё с тем, что делать, если первый из двух обработчиков стопнет событие.
        if (eventValue) {
            clonedChildPropsDOM[eventName] = eventValue;
        }
    }
    if (!nextRef) {
        return clonedChildPropsDOM;
    }
    clonedChildPropsDOM.ref = ChainOfRef.both(children.ref, nextRef);
    return clonedChildPropsDOM;
}
