/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { useTouches } from 'UICommon/Events';

function LongTapReact() {
    const longTapHandler = () => {
        alert(1);
    };
    const swipeHandler = () => {
        alert(2);
    };

    const touchEvents = useTouches(swipeHandler, longTapHandler);
    return <div {...touchEvents}>for long Tap</div>;
}

export default React.memo(LongTapReact);
