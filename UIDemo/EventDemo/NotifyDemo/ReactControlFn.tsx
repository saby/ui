/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import * as React from 'react';

interface IProps {
    onDidMount: (val: string) => void;
    changeVal: () => void;
}

const ReactControl = React.forwardRef((props: IProps, _ref) => {
    const handleClick = React.useCallback(() => {
        props.changeVal();
    }, [props]);

    React.useEffect(() => {
        props.onDidMount('React MyComponent Fn');
    }, []);

    return (
        <div onClick={handleClick}>React MyComponent Fn</div>
    );
});

export default React.memo(ReactControl);