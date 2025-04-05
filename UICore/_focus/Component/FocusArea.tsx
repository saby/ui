/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import { ReactElement, ReactNode, forwardRef, ForwardedRef, RefObject } from 'react';
import type { TFocusChangedCallback } from './IFocusComponent';
import { useFocusAreaProps, IUNSAFENoErrorUnusedProps } from './useFocusAreaProps';
import { getFocusContext } from './FocusContext';
import type { IFocusHTMLElement } from 'UICommon/Focus';

export type TFocusRef = ForwardedRef<HTMLElement>;
type TFocusParentRef = RefObject<HTMLElement | null>;

/**
 * Интерфейс общих пропсов FocusArea и FocusRoot
 * @public
 * @see UICore/_focus/Component/FocusArea
 * @see UICore/_focus/Component/FocusRoot
 */
export interface IFocusAreaProps {
    /**
     * Callback который будет зваться при активации области
     */
    onActivated?: TFocusChangedCallback;
    /**
     * Callback который будет зваться при деактивации области
     */
    onDeactivated?: TFocusChangedCallback;
    /**
     * локальное значение tabindex в пределах родительской облатси
     */
    tabIndex?: number | string;
    /**
     * нужно ли зацикливать обход по табу
     */
    cycling?: 'true' | 'false' | boolean;
    /**
     * нужно ли при активации отдавать предпочтение данной области в обход табиндексов
     */
    autofocus?: 'true' | 'false' | boolean;
    /**
     * нужно ли запретить фокусировку по клику
     */
    unclickable?: boolean;
    children?: ReactNode;
    ref?: TFocusRef;
    focusParentRef?: TFocusParentRef;
}

export const focusParentRefName = 'focus-parent-ref';

export interface IFocusAreaElement extends IFocusHTMLElement {
    [focusParentRefName]?: TFocusParentRef;
}

/**
 * Контрол, который пробрасывает настройки механизма фокусов до ближайшего FocusRoot
 * @remark
 * {@link https://n.sbis.ru/article/ff0c466c-2b19-4e61-9bf1-d44df43802d4 Статья по использованию}
 * @class UICore/Focus:FocusArea
 * @public
 * @category ReactComponent
 */
export default forwardRef(function FocusArea(
    props: IFocusAreaProps & IUNSAFENoErrorUnusedProps,
    ref: TFocusRef
): ReactElement {
    const { Provider } = getFocusContext();
    const focusPropsValue = useFocusAreaProps(props, ref);

    return <Provider value={focusPropsValue}>{props.children}</Provider>;
});
