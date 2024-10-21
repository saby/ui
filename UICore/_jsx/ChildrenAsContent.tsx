/**
 * @kaizen_zone ce2d78ce-ad75-44f2-a211-06e89b0e061a
 */
import { forwardRef, memo, ForwardRefExoticComponent, cloneElement, Children } from 'react';
import {
    childrenPropsModificatorSingleton,
    TRefType,
    IInternalPropsWithWasabyChildren,
} from './ChildrenPropsModificator';

type TChildrenAsContent = ForwardRefExoticComponent<IInternalPropsWithWasabyChildren> & {
    isChildrenAsContent?: boolean;
};

/**
 * Компонент, позволяющий отрисовать реакт элемент, который:
 * 1. Объявлен в tsx как children Wasaby контрола.
 * 2. Используются в wml как _options.content
 *
 * Например:
 *
 * My.tsx
 * <WasabyControl>
 *     <SomeChildren className="classNameFromTsx" />
 * </WasabyControl>
 *
 * WasabyControl.wml
 * <div class="myWasabyControl">
 *    <ws:partial template="{{_options.content}}" attr:class="attrClassFromWml" />
 * </div>
 *
 * @private
 */
export const ChildrenAsContent: TChildrenAsContent = memo(
    forwardRef(function ChildrenAsContentInternal(
        props: IInternalPropsWithWasabyChildren,
        ref: TRefType
    ) {
        return Children.map(props.children, (child) => {
            const clonedChildProps = childrenPropsModificatorSingleton.modifyChildrenProps(
                child,
                props,
                ref
            );
            return cloneElement(child, clonedChildProps);
        });
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
