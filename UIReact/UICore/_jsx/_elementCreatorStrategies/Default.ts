import { ReactElement, JSXElementConstructor } from 'react';
import { ChainOfRef } from 'UICore/Ref';
import {
    IClonedChildProps,
    ChildrenPropsModificatorStratagy,
    IInternalPropsWithWasabyChildren,
    TRefType,
} from '../ChildrenPropsModificator';

/**
 * Создание стратегии модификации пропсов по умолчанию.
 * Как правило, здесь чистый реакт компонент вставляется как children Васаби контрола в tsx.
 * My.tsx
 * <WasabyControl>
 *     <ReactButton className="pureReactButton" />
 * </WasabyControl>
 * @private
 */
export const defaultStrategy = new ChildrenPropsModificatorStratagy(
    shouldUseItByDefault,
    defaultModifyChildrenProps
);

function shouldUseItByDefault(children: ReactElement): children is ReactElement {
    return !!children;
}

function defaultModifyChildrenProps(
    children: ReactElement<IClonedChildProps, JSXElementConstructor<IClonedChildProps>> & {
        ref?: TRefType;
    },
    nextProps: IInternalPropsWithWasabyChildren,
    nextRef: TRefType
): IInternalPropsWithWasabyChildren {
    const clonedChildProps = {} as IInternalPropsWithWasabyChildren;
    const nextPropsKeys = Object.keys(nextProps);
    const curPropsKeys = new Set(Object.keys(children.props));
    for (const nextPropsKey of nextPropsKeys) {
        if (nextPropsKey === 'children' || nextPropsKey === 'content') {
            // В children и content в nextProps лежит то, что сейчас модицицируем. Если не отфильтровать, контент может бесконечно начать рисовать сам себя.
            continue;
        }
        const nextPropsValue = nextProps[nextPropsKey];
        if (nextPropsKey === 'className' && children.props.className) {
            clonedChildProps[nextPropsKey] = `${nextPropsValue} ${children.props.className}`;
            continue;
        }
        // Контент не должен перетирать пропсы, которые объявлены явно в tsx.
        if (curPropsKeys.has(nextPropsKey)) {
            continue;
        }
        clonedChildProps[nextPropsKey] = nextPropsValue;
    }

    if (!nextRef) {
        return clonedChildProps;
    }
    // Классовый компонент, функциональный компонент без forwardRef, wml-шаблон.
    if (typeof children.type === 'function') {
        clonedChildProps.forwardedRef = ChainOfRef.both(children.props.forwardedRef, nextRef);
        return clonedChildProps;
    }
    clonedChildProps.ref = ChainOfRef.both(children.ref, nextRef);
    return clonedChildProps;
}
