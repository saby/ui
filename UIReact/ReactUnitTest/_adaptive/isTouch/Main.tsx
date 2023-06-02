import { useAdaptiveMode } from 'UI/Adaptive';

export default function Main() {
    const adaptiveMode = useAdaptiveMode();
    const isTouch = adaptiveMode.device.isTouch();
    return (
        <div id="main">
            {typeof isTouch === 'undefined'
                ? 'undefined'
                : isTouch
                ? 'true'
                : 'false'}
        </div>
    );
}