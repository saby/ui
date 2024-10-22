import { ReactElement, cloneElement, ComponentType } from 'react';
import { convertContentToElement } from 'UICore/Jsx';

interface IClassNamed {
    className?: string;
}

interface IInnerReactWithContentProps {
    customContent: ReactElement<IClassNamed> | ComponentType<IClassNamed>;
}

export default function InnerReactWithContent({
    customContent,
}: IInnerReactWithContentProps): ReactElement {
    const contentElement = convertContentToElement(customContent);
    const contentClassName = contentElement.props.className || '';
    const elementWithClassName = cloneElement(contentElement, {
        className: 'converterUserClassName ' + contentClassName,
    });
    return <div className="InnerReactWithContent">{elementWithClassName}</div>;
}
