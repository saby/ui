import { forwardRef, memo } from 'react';

const Control = forwardRef((props: { onUserEvent?: Function }, ref: any): JSX.Element => {
    return (
        <div ref={ref}>
            <div>React Control</div>
            <button id="clear" onClick={() => props.onUserEvent?.()}>
                call userEvent
            </button>
        </div>
    );
});
export default memo(Control);
