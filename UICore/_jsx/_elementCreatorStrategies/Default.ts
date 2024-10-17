/**
 * @kaizen_zone ce2d78ce-ad75-44f2-a211-06e89b0e061a
 */
import { ReactElement, JSXElementConstructor } from 'react';
import { isComponentClass, isForwardRef } from 'UICore/Executor';
import { ChainOfRef, CreateOriginRef } from 'UICore/Ref';
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
    // forwardRef рядом, вставленный в васаби, должен возвращать ссылку на элемент. Смешиваем все рефы туда.
    if (isForwardRef(children.type)) {
        const chainOfRef = new ChainOfRef();
        for (const ref of [
            children.ref,
            children.props.forwardedRef,
            nextRef,
            nextProps.forwardedRef,
        ]) {
            if (ref) {
                chainOfRef.add(new CreateOriginRef(ref));
            }
        }
        if (!chainOfRef.isEmpty()) {
            clonedChildProps.ref = chainOfRef.execute();
        }
        return clonedChildProps;
    }
    // в случае классового компонента не нужно смешивать ref и forwardedRef. ref будет ссылкой на компонент.
    if (isComponentClass(children.type)) {
        clonedChildProps.ref = ChainOfRef.both(children.ref, nextRef);
        clonedChildProps.forwardedRef = ChainOfRef.both(
            children.props.forwardedRef,
            nextProps.forwardedRef
        );
        return clonedChildProps;
    }
    // Функциональный компонент без forwardRef.
    const chainOfRef = new ChainOfRef();
    for (const ref of [children.props.forwardedRef, nextRef, nextProps.forwardedRef]) {
        if (ref) {
            chainOfRef.add(new CreateOriginRef(ref));
        }
    }
    if (!chainOfRef.isEmpty()) {
        clonedChildProps.forwardedRef = chainOfRef.execute();
    }
    return clonedChildProps;
}
