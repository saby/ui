/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { delimitProps, TJsxProps } from 'UICore/Jsx';

type TContentProps = {};

function OtherReactControl(props: TJsxProps<TContentProps>): JSX.Element {
    return (
        <div
            id="reactControl"
            onClick={(e) => {
                return props.onValuechanged(e, 'bind handler react control');
            }}
        >
            bind call
        </div>
    );
}

function ReactControl(props: TJsxProps<TContentProps>): JSX.Element {
    const { $wasabyRef } = delimitProps(props);
    return (
        <div ref={$wasabyRef}>
            <OtherReactControl {...props} />
        </div>
    );
}

export default React.forwardRef((props, _) => {
    return <ReactControl {...props} />;
});
