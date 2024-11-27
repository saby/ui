import { useState, forwardRef } from 'react';

const WithForwardRef = forwardRef<HTMLDivElement>((_, ref) => {
    const [value, setValue] = useState(0);
    return (
        <div ref={ref}>
            <button
                onClick={() => {
                    return setValue(value + 1);
                }}
            >
                {value}
            </button>
        </div>
    );
});

export default WithForwardRef;
