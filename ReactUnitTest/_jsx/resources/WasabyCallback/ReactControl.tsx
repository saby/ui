/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { delimitProps, TJsxProps } from 'UICore/Jsx';

type TContentProps = {
    onEvent?: Function;
    isNoEvent?: boolean;
    isEvent?: boolean;
    isEmpty?: boolean;
};

function ReactControlEvent(props: TJsxProps<TContentProps>): JSX.Element {
    return (
        <div
            id="reactControlEvent"
            onClick={(e) => {
                return props.onEvent(e, 'reactValWithEvent', 'reactVal1WithEvent1');
            }}
        >
            React
        </div>
    );
}

function ReactControlNoEvent(props: TJsxProps<TContentProps>): JSX.Element {
    return (
        <div
            id="reactControlNoEvent"
            onClick={() => {
                return props.onEvent('reactVal', 'reactVal1');
            }}
        >
            React
        </div>
    );
}
function ReactControlEmpty(props: TJsxProps<TContentProps>): JSX.Element {
    return (
        <div
            id="reactControlEmpty"
            onClick={() => {
                return props.onEvent();
            }}
        >
            React
        </div>
    );
}

function ReactControl(props: TJsxProps<TContentProps>): JSX.Element {
    const { $wasabyRef } = delimitProps(props);
    return (
        <div ref={$wasabyRef}>
            {props.isEvent && <ReactControlEvent {...props} />}
            {props.isNoEvent && <ReactControlNoEvent {...props} />}
            {props.isEmpty && <ReactControlEmpty {...props} />}
        </div>
    );
}

export default React.forwardRef((props: TJsxProps<TContentProps>, _) => {
    return <ReactControl {...props} />;
});
