import {
    forwardRef,
    memo,
    ForwardRefExoticComponent,
    ForwardedRef,
    cloneElement,
    ReactElement,
    JSXElementConstructor,
} from 'react';
import { reactEventList, checkWasabyEvent } from 'UICore/Events';
import { mergeAttrs } from 'UICore/Executor';
import { CreateOriginRef, ChainOfRef } from 'UICore/Ref';
import type { TInternalProps } from './props';

type TChildrenTypeChecker<
    P = unknown,
    T extends string | JSXElementConstructor<P> = string | JSXElementConstructor<P>
> = (children: ReactElement) => children is ReactElement<P, T>;

type TChildrenTypeModificator<
    P = unknown,
    T extends string | JSXElementConstructor<P> = string | JSXElementConstructor<P>
> = (children: ReactElement<P, T>, nextProps: unknown, forwardRef: ForwardedRef<unknown>) => P;

export class ChildrenPropsModificator {
    private childrenTypeCheckers: TChildrenTypeChecker[] = [];
    private childrenTypeModificators: TChildrenTypeModificator[] = [];

    constructor(private defaultChildrenTypeModificator: TChildrenTypeModificator) {}

    addChlidrenPropsModificator<P, T extends string | JSXElementConstructor<P>>(
        childrenTypeChecker: TChildrenTypeChecker<P, T>,
        childrenTypeModificator: TChildrenTypeModificator<P, T>
    ): void {
        this.childrenTypeCheckers.push(childrenTypeChecker);
        this.childrenTypeModificators.push(childrenTypeModificator);
    }

    modifyChildrenProps(
        children: ReactElement,
        nextProps: unknown,
        nextRef: ForwardedRef<unknown>
    ): unknown {
        for (let i = 0; i < this.childrenTypeCheckers.length; i++) {
            const childrenTypeChecker = this.childrenTypeCheckers[i];
            if (childrenTypeChecker(children)) {
                const childrenTypeModificator = this.childrenTypeModificators[i];
                return childrenTypeModificator(children, nextProps, nextRef);
            }
        }
        return this.defaultChildrenTypeModificator(children, nextProps, nextRef);
    }
}

type TRefType = ForwardedRef<HTMLElement>;

interface IClonedChildProps {
    [key: string]: Function | unknown;
    forwardedRef?: TRefType;
    ref?: TRefType;
    attrs?: Record<string, unknown>;
}

interface IInternalPropsWithWasabyChildren extends TInternalProps {
    children: ReactElement<IClonedChildProps> & {
        ref?: TRefType;
    };
    content: unknown;
}

function defaultModifyChildrenProps(
    children: ReactElement<IClonedChildProps, JSXElementConstructor<IClonedChildProps>> & {
        ref?: TRefType;
    },
    nextProps: IInternalPropsWithWasabyChildren,
    nextRef: TRefType
): IInternalPropsWithWasabyChildren {
    const clonedChildProps = {};
    const nextPropsKeys = Object.keys(nextProps);
    for (const nextPropsKey of nextPropsKeys) {
        if (nextPropsKey === 'children' || nextPropsKey === 'content') {
            // В children и content в nextProps лежит то, что сейчас модицицируем. Если не отфильтровать, контент может бесконечно начать рисовать сам себя.
            continue;
        }
        const nextPropsValue = nextProps[nextPropsKey];
        if (
            nextPropsValue &&
            !checkWasabyEvent(nextPropsValue) &&
            checkWasabyEvent(children.props[nextPropsKey])
        ) {
            // Не нужно перетирать хороший колбек проп васаби ивентом. Компонент скорее всего этого не ожидает.
            continue;
        }
        clonedChildProps[nextPropsKey] = nextPropsValue;
    }

    if (!nextRef) {
        return clonedChildProps;
    }
    // Классовый компонент, функциональный компонент без forwardRef, wml-шаблон.
    if (typeof children.type === 'function') {
        clonedChildProps.forwardedRef = joinRefs(children.props.forwardedRef, nextRef);
        return clonedChildProps;
    }
    clonedChildProps.ref = joinRefs(children.ref, nextRef);
    return clonedChildProps;
}
export const childrenPropsModificator = new ChildrenPropsModificator(defaultModifyChildrenProps);

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
    clonedChildPropsDOM.ref = joinRefs(children.ref, nextRef);
    return clonedChildPropsDOM;
}

childrenPropsModificator.addChlidrenPropsModificator<IClonedChildProps, string>(
    isDOMTypeElementChild,
    modifyDomChildrenProps
);

export function joinRefs(refFromProps: TRefType, forwardedRef: TRefType): TRefType {
    if (refFromProps && forwardedRef) {
        return new ChainOfRef()
            .add(new CreateOriginRef(refFromProps))
            .add(new CreateOriginRef(forwardedRef))
            .execute();
    }
    return refFromProps || forwardedRef;
}

type TChildrenAsContent = ForwardRefExoticComponent<IInternalPropsWithWasabyChildren> & {
    isChildrenAsContent?: boolean;
};

function areEqualShallow(a: object, b: object) {
    for (const key in a) {
        if (!(key in b) || a[key] !== b[key]) {
            return false;
        }
    }
    for (const key in b) {
        if (!(key in a) || a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}
export const ChildrenAsContent: TChildrenAsContent = memo(
    forwardRef(function ChildrenAsContentInternal(
        props: IInternalPropsWithWasabyChildren,
        ref: TRefType
    ) {
        const clonedChildProps = childrenPropsModificator.modifyChildrenProps(
            props.children,
            props,
            ref
        ) as IClonedChildProps;
        return cloneElement(props.children, clonedChildProps);
    }),
    function propsAreEqual(
        prevProps: IInternalPropsWithWasabyChildren,
        nextProps: IInternalPropsWithWasabyChildren
    ) {
        const prevProps2 = { ...prevProps, children: undefined };
        const nextProps2 = { ...nextProps, children: undefined };
        return areEqualShallow(prevProps2, nextProps2);
    }
);
ChildrenAsContent.isChildrenAsContent = true;
ChildrenAsContent.displayName = 'ChildrenAsContent';
