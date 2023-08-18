import * as React from 'react';
import { AdaptiveContainer, DEFAULT_BREAKPOINTS, useAdaptiveMode } from 'UI/Adaptive';
import PercentAdaptiveContainer from './PercentAdaptiveContainer';

function Text(props) {
    return <div style={{ marginTop: '10px' }}>{props.text}</div>;
}

function InnerReact(props) {
    const adaptiveMode = useAdaptiveMode();
    return (
        <div style={{ border: '1px solid' }}>
            {adaptiveMode.container.clientWidth.up(props.value)
                ? props.value + ' and higher'
                : 'less than ' + props.value}
        </div>
    );
}

function AdaptToContainer(props, ref) {
    const sm = DEFAULT_BREAKPOINTS.sm;
    const md = DEFAULT_BREAKPOINTS.md;
    const lg = DEFAULT_BREAKPOINTS.lg;
    return (
        <div ref={ref}>
            <Text text={'breakpoint = ' + sm} />

            <Text text={'Без настроек (зависит от body):'} />
            <InnerReact value={sm} />

            <Text text={'div (width = 500px):'} />
            <div style={{ width: '500px' }}>
                <AdaptiveContainer width={500}>
                    <InnerReact value={sm} />
                </AdaptiveContainer>
            </div>

            <Text text={`div (width = ${sm}px):`} />
            <div style={{ width: sm + 'px' }}>
                <AdaptiveContainer width={sm}>
                    <InnerReact value={sm} />
                </AdaptiveContainer>
            </div>

            <Text text={`div (width = ${md}px):`} />
            <div style={{ width: md + 'px' }}>
                <AdaptiveContainer width={md}>
                    <InnerReact value={sm} />
                </AdaptiveContainer>
            </div>

            <Text text={`div (width = ${lg}px):`} />
            <div style={{ width: lg + 'px' }}>
                <AdaptiveContainer width={lg}>
                    <InnerReact value={sm} />
                </AdaptiveContainer>
            </div>

            <Text text={'div (width = 50%):'} />
            <div style={{ width: '50%' }}>
                <PercentAdaptiveContainer percent={50}>
                    <InnerReact value={sm} />
                </PercentAdaptiveContainer>
            </div>
        </div>
    );
}
export default React.forwardRef(AdaptToContainer);
