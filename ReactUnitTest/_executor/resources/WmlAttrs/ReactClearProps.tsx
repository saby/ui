import { forwardRef, ReactElement } from 'react';
import { delimitProps } from 'UICore/Jsx';
import ReactClearPropsChild from './ReactClearPropsChild';

interface IProps {
    className?: string;
    attrs?: {
        style?: {};
    };
}

// prettier-ignore
const ReactClearProps = forwardRef(function ReactClearProps(props: IProps, ref: any): ReactElement {
    const { clearProps } = delimitProps(props);
    return (
        <div className={props.className} style={props.attrs.style}>
            <ReactClearPropsChild {...clearProps} />
        </div>
    );
});

export default ReactClearProps;
