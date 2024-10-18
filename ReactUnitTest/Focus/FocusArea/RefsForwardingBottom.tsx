import { FocusRoot } from 'UICore/Focus';
import { ReactElement } from 'react';
interface IRefsForwardingBottomProps {
    refsTargetIdArr: string[];
}
export default function RefsForwardingBottom(props: IRefsForwardingBottomProps): ReactElement {
    const thirdRef = (element: HTMLElement) => {
        if (element) {
            props.refsTargetIdArr.push(element.id + '_thirdRef');
        }
    };
    return <FocusRoot as="div" ref={thirdRef} id="targetRefsId" />;
}
