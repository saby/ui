import { forwardRef, ReactElement } from 'react';

interface IProps {
    className?: string;
    'data-qa'?: string;
}

// prettier-ignore
const ReactFunction = forwardRef(function ReactFunction(props: IProps, ref?): ReactElement {
    return (
        <div className={props.className} data-qa={props['data-qa']}>
            react function
        </div>
    );
});

export default ReactFunction;
