import { ReactElement } from 'react';

interface IProps {
    className?: string;
}

export default function ReactClearPropsChild(props: IProps): ReactElement {
    return (
        <div className={props.className}>
            child
        </div>
    );
}
