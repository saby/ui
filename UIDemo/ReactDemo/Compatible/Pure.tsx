import { ReactElement, useState, forwardRef } from 'react';
import * as CoreCompound from 'Core/CompoundContainer';

export default forwardRef(function Pure(): ReactElement {
    const [count, setCount] = useState(0);
    return (
        <div>
            <h2>CompoundContainer внутри чистого React контрола</h2>
            <button
                onClick={() => {
                    return setCount(count + 1);
                }}
            >
                Изменить значение в CompoundContainer
            </button>
            <CoreCompound
                component="UIDemo/ReactDemo/Compatible/WS3Component"
                componentOptions={{
                    text: count,
                }}
            />
        </div>
    );
});
