import { useState, forwardRef, memo } from 'react';
import { default as PlatformControl } from './PlatformControl';
import { default as PlatformControlReact } from './PlatformControlReact';

const ReactControl = forwardRef((_, ref: any): JSX.Element => {
    const [result, setResult] = useState('');

    const myHandler = () => {
        setResult('some user logic');
    };

    const clear = () => {
        setResult('');
    };

    const platformControl = () => {
        return (
            <PlatformControl
                // @ts-ignore
                id="click2"
                onMySuperEvent={myHandler}
                customEvents={['onMySuperEvent']}
            />
        );
    };

    return (
        <div ref={ref}>
            <div>React User Control</div>
            <div id="clear" onClick={clear}>
                {result}
            </div>
            <h3>Вставляем wasaby platform control</h3>
            {platformControl}
            <h3>Вставляем react platform control</h3>
            <PlatformControlReact
                id="click3"
                onMySuperEvent={myHandler}
                customEvents={['onMySuperEvent']}
            />
        </div>
    );
});
export default memo(ReactControl);
