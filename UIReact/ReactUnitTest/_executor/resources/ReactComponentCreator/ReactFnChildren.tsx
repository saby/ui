import { forwardRef, Ref } from 'react';

export default forwardRef(function ReactFn(
    props: { children: any },
    _: Ref<HTMLElement>
): JSX.Element {
    return props.children;
});
