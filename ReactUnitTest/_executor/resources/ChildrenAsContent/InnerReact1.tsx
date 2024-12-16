import * as React from 'react';

function InnerReact1(props) {
    return <div ref={props.fref}>{props.value}</div>;
}

export default React.memo(InnerReact1);
