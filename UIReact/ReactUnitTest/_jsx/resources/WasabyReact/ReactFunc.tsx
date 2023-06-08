/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { delimitProps, createElement, TJsxProps } from 'UICore/Jsx';
import { default as Wasaby } from './Wasaby';

type TContentProps = {};

function ReactFunc(props: TJsxProps<TContentProps>): JSX.Element {
    const { $wasabyRef } = delimitProps(props);
    return createElement(Wasaby, {
        $wasabyRef,
        additionName: 'reactFunc',
        id: 'reactFunc',
    });
}

export default function (props, _) {
    return <ReactFunc {...props} />;
}
