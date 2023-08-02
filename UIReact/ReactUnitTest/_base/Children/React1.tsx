import { forwardRef, ForwardedRef } from 'react';
interface IFnComponentProps {
    value: string;
}
function fnComponent(props: IFnComponentProps, ref: ForwardedRef<HTMLDivElement>) {
    return (
        <div id="reactFnComponentRoot" ref={ref}>
            {props.value}
        </div>
    );
}
export default forwardRef(fnComponent);
