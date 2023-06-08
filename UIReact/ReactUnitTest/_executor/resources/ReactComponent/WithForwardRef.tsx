import { useState, forwardRef } from 'react';

const WithForwardRef = forwardRef(() => {
    const [value, setValue] = useState(0);
    return (
        <button
            onClick={() => {
                return setValue(value + 1);
            }}
        >
            {value}
        </button>
    );
});

export default WithForwardRef;
