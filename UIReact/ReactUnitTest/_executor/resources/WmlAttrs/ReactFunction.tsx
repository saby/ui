import * as React from 'react';

interface IProps {
    attrs?: {
        'data-qa'?: string;
    };
}

const ReactFunction = React.forwardRef(function ReactFunction(
    props: IProps,
    ref?
): React.ReactElement {
    return <div data-qa={props.attrs['data-qa']}>react function</div>;
});

export default ReactFunction;
