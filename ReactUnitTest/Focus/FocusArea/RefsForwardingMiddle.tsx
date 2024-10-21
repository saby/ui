import { FocusArea } from 'UICore/Focus';
import { ReactElement } from 'react';
import RefsForwardingBottom from './RefsForwardingBottom';
interface IRefsForwardingMiddleProps {
    refsTargetIdArr: string[];
}
export default function RefsForwardingMiddle(props: IRefsForwardingMiddleProps): ReactElement {
    const secondRef = (element: HTMLElement) => {
        if (element) {
            props.refsTargetIdArr.push(element.id + '_secondRef');
        }
    };
    return (
        <FocusArea ref={secondRef}>
            <RefsForwardingBottom refsTargetIdArr={props.refsTargetIdArr} />
        </FocusArea>
    );
}
