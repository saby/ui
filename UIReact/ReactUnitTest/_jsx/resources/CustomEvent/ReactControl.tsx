/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { delimitProps, TJsxProps } from 'UICore/Jsx';
import { getArgs } from 'UICore/Events';
import { default as WasabyControl } from 'ReactUnitTest/_jsx/resources/CustomEvent/WasabyControl';

function ReactControl(props: TJsxProps<any>): JSX.Element {
    const { $wasabyRef } = delimitProps(props);
    const [value, setValue] = React.useState<string>('init');
    const myHandler = React.useCallback(function (e: CustomEvent) {
        setValue(getArgs(e)[1]);
    }, []);
    return (
        <div ref={$wasabyRef}>
            <div>{value}</div>
            <WasabyControl onMyEvent={myHandler} customEvents={['onMyEvent']} />
        </div>
    );
}

export default React.forwardRef((props, _) => {
    return <ReactControl {...props} />;
});
