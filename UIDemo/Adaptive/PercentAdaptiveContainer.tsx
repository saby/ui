import { AdaptiveContainer, useAdaptiveMode } from 'UI/Adaptive';

export default function PercentAdaptiveContainer({ percent, children }) {
    const adaptiveMode = useAdaptiveMode();
    const width = Math.trunc(
        adaptiveMode.container.clientWidth.value * (parseInt(percent, 10) / 100)
    );
    return <AdaptiveContainer width={width}>{children}</AdaptiveContainer>;
}
