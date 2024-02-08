import { useRef, useCallback } from 'react';
import { focus } from 'UI/Focus';

interface IRoot5Props {
    getSecondFocusResult: (result: boolean) => void;
    onFirstFocus: () => void;
}

export default function Root5({
    getSecondFocusResult: onSecondFocusResult,
    onFirstFocus,
}: IRoot5Props): JSX.Element {
    const secondInputRef = useRef<HTMLInputElement>();
    const thirdInputRef = useRef<HTMLInputElement>();
    const noMoreCallFocus = useRef<boolean>();
    const onFirstFocusHandler = useCallback(() => {
        onFirstFocus();
        if (noMoreCallFocus.current) {
            return;
        }
        noMoreCallFocus.current = true;
        const result = focus(secondInputRef.current);
        onSecondFocusResult(result);
    }, [onFirstFocus, onSecondFocusResult]);
    const onSecondFocus = useCallback(() => {
        focus(thirdInputRef.current);
    }, []);
    return (
        <div>
            <input className="input1" type="text" onFocus={onFirstFocusHandler} />
            <input className="input2" type="text" onFocus={onSecondFocus} ref={secondInputRef} />
            <input className="input3" type="text" ref={thirdInputRef} />
            <input className="input4" type="text" />
        </div>
    );
}
