import * as React from 'react';
import type { LegacyRef } from 'react';

import { delimitProps, clearEvent } from 'UICore/Jsx';

function ReactControl(props: any): React.ReactElement {
    const {
        // @ts-ignore
        clearProps,
        $wasabyRef,
        userAttrs,
    } = delimitProps(props) as {
        clearProps: any;
        $wasabyRef: LegacyRef<HTMLDivElement>;
        userAttrs: object;
    };
    clearEvent(props, ['onClick']);

    const _onCounterClick = (): void => {
        props.pushToQueue('click in react');
        props.onClick();
    };

    const _onCounterMouseDown = (): void => {
        props.onMouseDown();
    };

    return (
        <div
            ref={$wasabyRef}
            onClick={_onCounterClick}
            onMouseDown={_onCounterMouseDown}
            id="reactElement"
        >
            react control
        </div>
    );
}

export default React.memo(ReactControl);
