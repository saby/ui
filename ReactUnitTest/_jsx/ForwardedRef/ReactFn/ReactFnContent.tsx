import { forwardRef, Ref } from 'react';

export default forwardRef(function ReactFnContent(
    props: any,
    forwardedRef: Ref<HTMLDivElement>
): JSX.Element {
    return <props.content forwardedRef={forwardedRef} />;
});
