import Dashboard from './Dashboard';
import { forwardRef, useCallback, useState } from 'react';
import { AdaptiveContainer, useAdaptiveMode } from 'UI/Adaptive';
import useResizeObserver from './useResizeObserver';

const MARGIN_WIDTH = 100;
export default forwardRef(function Main(props: any, ref: any) {
    const adaptiveMode = useAdaptiveMode();
    const onResize = useCallback((target: HTMLDivElement) => {
        setWidth(target.clientWidth);
    }, []);
    const resizeRef = useResizeObserver(onResize);
    const [width, setWidth] = useState(adaptiveMode.container.clientWidth.value - 2 * MARGIN_WIDTH);

    return (
        <div ref={ref}>
            <div>{width}px</div>
            <div
                ref={resizeRef}
                className={'main tw-@container'}
                style={{ resize: 'horizontal', overflow: 'auto' }}
            >
                <AdaptiveContainer width={width}>
                    <Dashboard columnsCount={3} />
                </AdaptiveContainer>
            </div>
        </div>
    );
});
