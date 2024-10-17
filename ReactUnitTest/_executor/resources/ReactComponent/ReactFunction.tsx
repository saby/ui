import * as React from 'react';

const ReactFunction = React.forwardRef(function ReactFunction(
    props,
    ref?
): React.ReactElement {
    const isReact = 'Is React Function';

    return <div>{isReact}</div>;
});

export default ReactFunction;
