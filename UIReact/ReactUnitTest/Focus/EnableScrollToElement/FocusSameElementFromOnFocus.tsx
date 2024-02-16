import { PropsWithChildren, useCallback, useEffect, useRef } from 'react';

export default function FocusSameElementFromOnFocus({
    children,
}: PropsWithChildren<{}>): JSX.Element {
    const inputRef = useRef<HTMLInputElement>();
    const needAnotherOneFocus = useRef<boolean>(true);
    useEffect(() => {
        inputRef.current.focus();
    }, []);
    const onFocus = useCallback(() => {
        if (needAnotherOneFocus.current) {
            needAnotherOneFocus.current = false;
            inputRef.current.focus();
        }
    }, []);
    return (
        <div>
            <div>
                <input type="text" ref={inputRef} onFocus={onFocus} />
            </div>
            {children}
        </div>
    );
}
