import InnerReact1 from './InnerReact1';
import Wasaby1 from './Wasaby1';
import * as React from 'react';

function MainReact1(props, ref) {
    const [i, seti] = React.useState(0);
    function clickHandler() {
        seti(i + 1);
    }
    return (
        <Wasaby1 value={i}>
            <div>
                <button onClick={clickHandler}>+1</button>
                <InnerReact1 value={i} fref={ref}></InnerReact1>
            </div>
        </Wasaby1>
    );
}
export default React.memo(React.forwardRef(MainReact1));
