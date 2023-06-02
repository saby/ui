/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import {
    forwardRef,
    DetailedHTMLProps,
    HTMLAttributes,
    ElementType,
    PropsWithChildren,
    useCallback,
    ForwardedRef,
} from 'react';
import { IFocusAreaProps } from './FocusArea';
import { useFocusAreaProps } from './useFocusAreaProps';
import { useFocusCallbacks } from './useFocusCallbacks';
import { FocusContextValue, getFocusContext } from './FocusContext';

/**
 * @interface UICore/_focus/IFocusRootProps
 * @public
 */
/**
 * @name UICore/_focus/IFocusRootProps#as
 * @cfg {string} имя тега FocusRoot
 */
interface IFocusRootProps {
    as?: ElementType;
}

type THTMLAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

const delegatesTabfocusFlagName = 'ws-delegates-tabfocus';
const createsContextFlagName = 'ws-creates-context';
const unclickableFlagName = 'ws-no-focus';
const cyclingFlagName = 'ws-tab-cycling';

// Подразумевается, что строковые true и false отдаёт wasaby генератор, а в tsx удобнее использовать boolean.
// Проще поддержать и то, и то.
function booleanToString(
    value: 'true' | 'false' | boolean | undefined
): 'true' | 'false' | undefined {
    if (value === 'true' || value === true) {
        return 'true';
    }
    if (value === 'false' || value === false) {
        return 'false';
    }
}

const emptyFocusContextValue = new FocusContextValue();

/**
 * @class UICore/_focus/FocusRoot
 * @public
 * @implements UICore/_focus/IFocusRootProps
 * @implements UICore/_focus/IFocusAreaProps
 * @remark
 * {@link https://n.sbis.ru/article/ff0c466c-2b19-4e61-9bf1-d44df43802d4 Статья по использованию}
 */
export default forwardRef(function FocusRoot(
    props: PropsWithChildren<IFocusRootProps & THTMLAttributes & IFocusAreaProps>,
    ref: ForwardedRef<HTMLElement>
) {
    const {
        as: Component = 'div',
        tabIndex,
        onActivated,
        onDeactivated,
        cycling,
        autofocus,
        unclickable,
        children,
        ...rest
    } = props;
    const focusProps = useFocusAreaProps(props, ref).getFocusProps();
    const focusCallbacksRef = useFocusCallbacks(
        {
            onActivated: focusProps.onActivated,
            onDeactivated: focusProps.onDeactivated,
        },
        focusProps.ref
    );
    const focusRootRef = useCallback(
        function focusRef(root: HTMLElement): void {
            focusCallbacksRef(root);
            if (root) {
                root[delegatesTabfocusFlagName] = 'true';
                root[createsContextFlagName] = 'true';
                root[unclickableFlagName] = focusProps.unclickable;
                root[cyclingFlagName] = booleanToString(focusProps.cycling);
            }
        },
        [focusCallbacksRef, focusProps.unclickable, focusProps.cycling]
    );
    const { Provider } = getFocusContext();
    return (
        <Provider value={emptyFocusContextValue}>
            <Component
                ref={focusRootRef}
                ws-autofocus={booleanToString(focusProps.autofocus)}
                tabIndex={focusProps.tabIndex}
                {...rest}
            >
                {children}
            </Component>
        </Provider>
    );
});
