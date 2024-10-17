import { ReactElement, cloneElement } from 'react';

const rootRef = function setCustomAttribute(element: HTMLElement) {
    if (element) {
        element.setAttribute('attr-from-ref', 'clonedRefAttr');
    }
};

export default function CloneContentAsChildren(props: { children: ReactElement }): ReactElement {
    return cloneElement(props.children, {
        forwardedRef: rootRef,
        ref: rootRef,
        $wasabyRef: rootRef,
        className: 'clonedClassName',
        'data-some-attr': 'clonedValueAttr',
    });
}
