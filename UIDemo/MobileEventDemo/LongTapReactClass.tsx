/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { TouchEventPolyfill } from 'UI/Events';

class ReactControl extends React.Component {
    private touchEvents;
    private longTapEvents;
    private swipeEvents;
    constructor(props) {
        super(props);
        this.longTapHandler = this.longTapHandler.bind(this);
        this.longTapHandler1 = this.longTapHandler1.bind(this);
        this.swipeHandler = this.swipeHandler.bind(this);
        this.touchEvents = new TouchEventPolyfill(this.swipeHandler, this.longTapHandler);
        this.longTapEvents = new TouchEventPolyfill(false, this.longTapHandler1);
        this.swipeEvents = new TouchEventPolyfill(this.swipeHandler, false);
    }

    longTapHandler() {
        alert(1);
    }
    swipeHandler() {
        alert(2);
    }

    longTapHandler1() {
        alert(3);
    }
    render() {
        return (
            <div>
                <div {...this.touchEvents.getTouches()}>for long Tap and swipe</div>
                <div {...this.longTapEvents.getTouches()}>for long Tap</div>
                <div {...this.swipeEvents.getTouches()}>for swipe event</div>
            </div>
        );
    }
}

export default ReactControl;
