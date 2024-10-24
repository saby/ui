/**
 * @kaizen_zone ce2d78ce-ad75-44f2-a211-06e89b0e061a
 */
import { ReactElement } from 'react';
import { reactEventList } from 'UICore/Events';
import { mergeAttrs } from 'UICore/Executor';
import { FocusRoot } from 'UICore/Focus';
import { ChainOfRef, CreateOriginRef } from 'UICore/Ref';
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
    // с точки зрения ChildrenAsContent, FocusRoot должен быть как DOM элемент.
    return children.type === FocusRoot || typeof children.type === 'string';
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
    const chainOfRef = new ChainOfRef();
    for (const ref of [children.ref, nextRef, nextProps.forwardedRef]) {
        if (ref) {
            chainOfRef.add(new CreateOriginRef(ref));
        }
    }
    if (!chainOfRef.isEmpty()) {
        clonedChildPropsDOM.ref = chainOfRef.execute() as TRefType;
    }
    return clonedChildPropsDOM;
}
