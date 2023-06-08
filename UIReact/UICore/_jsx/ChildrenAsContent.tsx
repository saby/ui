import {
    forwardRef,
    memo,
    ForwardRefExoticComponent,
    ForwardedRef,
    useMemo,
    cloneElement,
} from 'react';
import { reactEventList } from 'UICore/Events';
import { mergeAttrs } from 'UICore/Executor';
import { CreateOriginRef, ChainOfRef } from 'UICore/Ref';
import type { TInternalProps } from './props';

type TRefType = ForwardedRef<HTMLElement>;

interface IClonedChildProps {
    [key: string]: Function | unknown;
    forwardedRef?: TRefType;
    ref?: TRefType;
    attrs?: Record<string, unknown>;
}

function joinRefs(refFromProps: TRefType, forwardedRef: TRefType): TRefType {
    if (refFromProps && forwardedRef) {
        return new ChainOfRef()
            .add(new CreateOriginRef(refFromProps))
            .add(new CreateOriginRef(forwardedRef))
            .execute();
    }
    return refFromProps || forwardedRef;
}

function addRefToClonedChildProps(
    clonedChildProps: IClonedChildProps,
    ref: TRefType,
    children: JSX.Element
) {
    if (!ref) {
        return;
    }
    // Классовый компонент, функциональный компонент без forwardRef, wml-шаблон.
    if (typeof children.type === 'function') {
        clonedChildProps.forwardedRef = ref;
        return;
    }
    clonedChildProps.ref = ref;
}

function calculateClonedChildProps(
    props: TInternalProps,
    ref: TRefType,
    children: JSX.Element
): IClonedChildProps {
    const isDOMTypeElementChild = typeof children.type === 'string';
    if (isDOMTypeElementChild) {
        const clonedChildPropsDOM: IClonedChildProps = mergeAttrs(
            children.props,
            props.attrs
        );
        for (const eventName of reactEventList) {
            const eventValue = props[eventName];

            // Если на элементе был обработчик одноимённого события из tsx - он пропадёт.
            // На данный момент в этой точке безопаснее всего оставить обработчик из wml.
            // Если понадобится - придётся вызвать оба. Но аккуратно с порядком.
            // И ещё с тем, что делать, если первый из двух обработчиков стопнет событие.
            if (eventValue) {
                clonedChildPropsDOM[eventName] = eventValue;
            }
        }
        if (ref) {
            clonedChildPropsDOM.ref = ref;
        }
        return clonedChildPropsDOM;
    }

    const clonedChildProps: IClonedChildProps = {
        ...props,
    };
    addRefToClonedChildProps(clonedChildProps, ref, children);
    return clonedChildProps;
}

type TChildrenAsContent = ForwardRefExoticComponent<TInternalProps> & {
    isChildrenAsContent?: boolean;
};

function areEqualShallow(a, b) {
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
        props: TInternalProps & { children: JSX.Element },
        ref: ForwardedRef<HTMLElement>
    ) {
        const refFromChildrenProps =
            props.children.props.forwarededRef || props.children.props.ref;
        const forwardedRef = useMemo(() => {
            return joinRefs(refFromChildrenProps, ref);
        }, [refFromChildrenProps, ref]);
        const clonedChildProps = calculateClonedChildProps(
            props,
            forwardedRef,
            props.children
        );
        if (clonedChildProps.children) {
            delete clonedChildProps.children;
        }
        return cloneElement(props.children, clonedChildProps);
    }),
    function (prevProps, nextProps) {
        const prevProps2 = { ...prevProps, children: undefined };
        const nextProps2 = { ...nextProps, children: undefined };
        return areEqualShallow(prevProps2, nextProps2);
    }
);
ChildrenAsContent.isChildrenAsContent = true;
