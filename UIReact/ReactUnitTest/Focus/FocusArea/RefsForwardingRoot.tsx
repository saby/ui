import { FocusArea } from 'UICore/Focus';
import { ReactElement } from 'react';
import RefsForwardingMiddle from './RefsForwardingMiddle';

interface IRefsForwardingRootProps {
    refsTargetIdArr: string[];
}
export default function RefsForwardingRoot(props: IRefsForwardingRootProps): ReactElement {
    const firstRef = (element: HTMLElement) => {
        if (element) {
            props.refsTargetIdArr.push(element.id + '_firstRef');
        }
    };
    return (
        <div>
            <FocusArea ref={firstRef}>
                <RefsForwardingMiddle refsTargetIdArr={props.refsTargetIdArr} />
            </FocusArea>
        </div>
    );
}
