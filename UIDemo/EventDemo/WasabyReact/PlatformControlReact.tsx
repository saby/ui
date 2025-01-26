import { forwardRef } from 'react';

interface IPlatformControlProps {
    id: string;
    onMySuperEvent: () => void;
    customEvents: string[];
}

const PlatformControlReact = forwardRef(
    (props: IPlatformControlProps, ref: any): JSX.Element => {
        const clickHandler = () => {
            props.onMySuperEvent();
        };
        return (
            <div id={props.id} ref={ref} onClick={clickHandler}>
                React Platform Control (click call callback mySuperEvent)
            </div>
        );
    }
);

export default PlatformControlReact;
