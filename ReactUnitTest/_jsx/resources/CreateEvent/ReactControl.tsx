/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { createElement, delimitProps, TJsxProps } from 'UICore/Jsx';
import { default as WasabyControl } from 'ReactUnitTest/_jsx/resources/CreateEvent/WasabyControl';

function ReactControl(props: TJsxProps<any>): JSX.Element {
    const { $wasabyRef } = delimitProps(props);
    return (
        <div ref={$wasabyRef}>
            {createElement(
                WasabyControl,
                {},
                undefined,
                null,
                props.wasabyContext
            )}
        </div>
    );
}

export default React.forwardRef((props, _) => {
    return <ReactControl {...props} />;
});
