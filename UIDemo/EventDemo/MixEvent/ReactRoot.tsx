import { forwardRef, memo } from 'react';
import { default as WasabyHOC } from './WasabyHOC';
import { default as ReactControl } from './ReactControl';

const Control = forwardRef((_, ref: any): JSX.Element => {
    const myHandler = () => {
        // do something
    };

    return (
        <div ref={ref}>
            <div>React Root Control</div>
            <h3>Вставляем wasaby HOC control</h3>
            <WasabyHOC
                // @ts-ignore
                id="click2"
                onUserEvent={myHandler}
            >
                <ReactControl />
            </WasabyHOC>
            <h3>Вставляем react control без HOC</h3>
            <ReactControl id="click3" onUserEvent={myHandler} />
        </div>
    );
});
export default memo(Control);
