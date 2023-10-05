import { forwardRef, ForwardedRef, ReactElement } from 'react';

interface IJ {
    passRef: boolean;
}
export default forwardRef(function ReactInRootOfWasaby(
    props: IJ,
    ref: ForwardedRef<HTMLDivElement>
): ReactElement {
    const rootRef = props.passRef ? ref : undefined;
    return <div ref={rootRef}>Simple component</div>;
});
