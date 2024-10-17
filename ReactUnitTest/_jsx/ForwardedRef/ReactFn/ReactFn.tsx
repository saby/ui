import { forwardRef, Ref } from 'react';

export default forwardRef(function ReactFn(
    props: { hasContainer: boolean },
    forwardedRef: Ref<HTMLDivElement>
): JSX.Element {
    const text = !!forwardedRef && props.hasContainer ? 'ok' : 'not ok';
    return <div ref={forwardedRef}>{text}</div>;
});
