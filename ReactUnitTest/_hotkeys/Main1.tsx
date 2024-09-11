import { KeyHook } from 'UI/HotKeys';
import { constants } from 'Env/Env';
import { useCallback, useState } from 'react';
import * as React from 'react';

export default React.memo(function Main1() {
    const [value, setValue] = useState(0);
    const keyDownHandler = useCallback(() => {
        setValue(value + 1);
    }, []);
    return (
        <div onKeyDown={keyDownHandler}>
            <KeyHook defaultActions={[{ keyCode: constants.key.enter }]}>
                <div>обработчик keydown сработал: {value}</div>
            </KeyHook>
        </div>
    );
});
