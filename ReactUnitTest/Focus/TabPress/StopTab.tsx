import { ReactElement, useRef, useLayoutEffect, KeyboardEvent } from 'react';

interface IStopTabProps {
    shouldStopTabPress: boolean;
}
export default function StopTab(props: IStopTabProps): ReactElement {
    const firstInputRef = useRef<HTMLInputElement>();
    useLayoutEffect(() => {
        firstInputRef.current.focus();
    }, []);
    function onKeyDownHandler(event: KeyboardEvent<HTMLDivElement>): void {
        if (props.shouldStopTabPress) {
            event.stopPropagation();
            event.preventDefault();
        }
    }
    return (
        <div onKeyDown={onKeyDownHandler}>
            <div>
                <input type="text" id="firstInputElement" ref={firstInputRef} />
            </div>
            <div>
                <input type="text" id="secondInputElement" />
            </div>
        </div>
    );
}
