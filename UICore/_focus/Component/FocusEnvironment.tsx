/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import {
    useRef,
    useCallback,
    ElementType,
    ComponentPropsWithoutRef,
    ReactNode,
    ForwardedRef,
} from 'react';
import { startDOMFocusSystem, stopDOMFocusSystem } from '../DOM/initFocusSystem';

interface IFocusEnvironmentOwnProps<T extends ElementType> {
    as?: T;
    forwardedRef?: ForwardedRef<any>;
    children: ReactNode;
}
type TFocusEnvironmentProps<T extends ElementType> = IFocusEnvironmentOwnProps<T> &
    Omit<ComponentPropsWithoutRef<T>, keyof IFocusEnvironmentOwnProps<T>>;

/**
 * Компонент инициализации окружения системы фокусов.
 * Не рассчитан на использование в wml шаблонах.
 * @public
 */
// eslint-disable-next-line
const FocusEnvironment = <T extends ElementType = 'div'>(
    props: TFocusEnvironmentProps<T>
): JSX.Element => {
    const { as: RootElement = 'div', children, forwardedRef, ...rest } = props;
    const rootElement = useRef<HTMLElement>();
    const updateForwardedRef = useCallback(
        (curElement: HTMLElement | null): void => {
            if (!forwardedRef) {
                return;
            }
            if (typeof forwardedRef === 'function') {
                forwardedRef(curElement);
                return;
            }
            forwardedRef.current = curElement;
        },
        [forwardedRef]
    );
    const callbackRef = useCallback(
        function updateRootElement(curElement: HTMLElement | null): void {
            updateForwardedRef(curElement);
            if (curElement) {
                const fixedCurElement = curElement.parentElement as HTMLElement;
                startDOMFocusSystem(fixedCurElement);
                rootElement.current = fixedCurElement;
                return;
            }
            if (rootElement.current) {
                stopDOMFocusSystem(rootElement.current);
            }
        },
        [updateForwardedRef]
    );

    return (
        <RootElement ref={callbackRef} {...rest}>
            <span className="vdom-focus-in" tabIndex={1} />
            {props.children}
            <span className="vdom-focus-out" tabIndex={0} />
        </RootElement>
    );
};

FocusEnvironment.displayName = 'FocusEnvironment';

export default FocusEnvironment;
