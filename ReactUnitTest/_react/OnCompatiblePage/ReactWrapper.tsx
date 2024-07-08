import * as React from 'react';

import { createElement, delimitProps } from 'UICore/Jsx';
import { TInternalProps } from 'UICore/Executor';

function Children(
    props: TInternalProps & { contentTemplate: unknown }
): JSX.Element {
    const content = createElement(props.contentTemplate);
    return <div>{content}</div>;
}

export default React.memo((props: TInternalProps) => {
    const { clearProps, $wasabyRef, userAttrs } = delimitProps(props);

    return (
        <div {...userAttrs} ref={$wasabyRef}>
            <Children {...clearProps} />
        </div>
    );
});
