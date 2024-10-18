/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { delimitProps, createElement, TJsxProps } from 'UICore/Jsx';
import { default as Wasaby } from './Wasaby';

type TContentProps = {};

function ReactHOC(props: TJsxProps<TContentProps>): JSX.Element {
    return <Wasaby {...props} additionName="reactHOC" id="reactHOC" />;
}

export default React.forwardRef((props, _) => {
    return <ReactHOC {...props} />;
});
