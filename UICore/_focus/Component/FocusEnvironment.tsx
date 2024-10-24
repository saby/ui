/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import { ReactElement, PropsWithChildren, useRef, useCallback, CSSProperties, memo } from 'react';
import { startDOMFocusSystem, stopDOMFocusSystem } from '../DOM/initFocusSystem';

export default memo(
    function FocusEnvironment(props: PropsWithChildren<{}>): ReactElement {
        const rootElement = useRef<HTMLDivElement>();
        const callbackRef = useCallback(function updateRootElement(
            curElement: HTMLDivElement
        ): void {
            if (curElement) {
                startDOMFocusSystem(curElement);
                rootElement.current = curElement;
                return;
            }
            if (rootElement.current) {
                stopDOMFocusSystem(rootElement.current);
            }
        },
        []);

        const styleRef = useRef<CSSProperties>();
        if (!styleRef.current) {
            styleRef.current = {
                display: 'contents',
                height: '100%',
                width: '100%',
            };
        }

        return (
            <div ref={callbackRef} style={styleRef.current}>
                <span className="vdom-focus-in" tabIndex={1} />
                {props.children}
                <span className="vdom-focus-out" tabIndex={0} />
            </div>
        );
    },
    (prevProps, nextProps) => {
        return prevProps.children === nextProps.children;
    }
);
