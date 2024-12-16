import { useEffect, useRef, useState } from 'react';
import { FocusRoot, activate } from 'UI/Focus';

export default function RestoreFocusRootReact() {
    const rootElementRef = useRef(null);
    const [shouldShowInput, setShouldShowInput] = useState(true);
    useEffect(() => {
        const container = rootElementRef.current;
        if (container) {
            activate(container);
        }
    }, []);
    return (
        <FocusRoot className="focusRootReact" as="div" ref={rootElementRef}>
            {shouldShowInput && (
                <input
                    type="text"
                    data-qa="Сфокусированное поле ввода"
                    onClick={() => setShouldShowInput(false)}
                />
            )}
        </FocusRoot>
    );
}
