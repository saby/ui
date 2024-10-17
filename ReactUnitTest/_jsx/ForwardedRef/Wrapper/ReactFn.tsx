import { forwardRef, Ref } from 'react';
import Wasaby from './Wasaby';

export default forwardRef(function ReactFn(
    props: any,
    forwardedRef: Ref<HTMLElement>
): JSX.Element {
    if (props.content) {
        return <props.content forwardedRef={forwardedRef} />;
    }
    return (
        <Wasaby forwardedRef={forwardedRef} hasContainer={props.hasContainer} />
    );
});
