/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import { ReactElement, ReactNode, forwardRef, ForwardedRef } from 'react';
import type { TFocusChangedCallback } from './IFocusComponent';
import { useFocusAreaProps } from './useFocusAreaProps';
import { getFocusContext } from './FocusContext';

export type TFocusRef = ForwardedRef<HTMLElement>;

/**
 * Интерфейс общих пропсов FocusArea и FocusRoot.
 * @interface UICore/_focus/IFocusAreaProps
 * @public
 * @see UICore/_focus/FocusArea
 * @see UICore/_focus/FocusRoot
 */
export interface IFocusAreaProps {
    onActivated?: TFocusChangedCallback;
    onDeactivated?: TFocusChangedCallback;
    tabIndex?: number | string;
    cycling?: 'true' | 'false' | boolean;
    autofocus?: 'true' | 'false' | boolean;
    unclickable?: boolean;
    children?: ReactNode;
    ref?: TFocusRef;
}

/**
 * @name UICore/_focus/IFocusAreaProps#onActivated
 * @cfg {TFocusChangedCallback}
 */

/**
 * @name UICore/_focus/IFocusAreaProps#onDeactivated
 * @cfg {TFocusChangedCallback}
 */

/**
 * @name UICore/_focus/IFocusAreaProps#tabIndex
 * @cfg {number}
 */

/**
 * @name UICore/_focus/IFocusAreaProps#cycling
 * @cfg {boolean}
 */

/**
 * @name UICore/_focus/IFocusAreaProps#autofocus
 * @cfg {boolean}
 */

/**
 * @name UICore/_focus/IFocusAreaProps#unclickable
 * @cfg {boolean}
 */

// В идеале этот проп только для внутреннего использования.
// Реакт внутри васаби мы безусловно оборачиваем в FocusArea.
// Не будем заставлять доводить контекст до FocusRoot, это не всегда необходимо.
interface INoErrorUnusedProps {
    noErrorUnusedFocusProps?: boolean;
}

/**
 * @class UICore/_focus/FocusArea
 * @implements UICore/_focus/IFocusAreaProps
 * @public
 * @remark
 * {@link https://n.sbis.ru/article/ff0c466c-2b19-4e61-9bf1-d44df43802d4 Статья по использованию}
 */
export default forwardRef(function FocusArea(
    props: IFocusAreaProps & INoErrorUnusedProps,
    ref: TFocusRef
): ReactElement {
    const { Provider } = getFocusContext();
    const focusPropsValue = useFocusAreaProps(props, ref);

    if (props.noErrorUnusedFocusProps) {
        focusPropsValue.getFocusProps();
    }

    return <Provider value={focusPropsValue}>{props.children}</Provider>;
});
