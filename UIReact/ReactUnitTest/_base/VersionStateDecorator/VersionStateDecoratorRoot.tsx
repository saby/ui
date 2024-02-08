import { useState, useCallback } from 'react';
import DecoratedComponent from './DecoratedComponent';

export default function VersionStateDecoratorRoot(): JSX.Element {
    const [text, setText] = useState<string>('init');
    const changeText = useCallback(() => {
        setText('changed');
    }, []);
    return (
        <div>
            <DecoratedComponent text={text} />
            <div>
                <button onClick={changeText}>changeText</button>
            </div>
        </div>
    );
}
