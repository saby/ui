import { ComponentType, createElement, ReactElement, useContext } from 'react';
import { getWasabyContext } from 'UICore/Contexts';
import { AdaptiveModeType } from './AdaptiveModeClass';

/**
 * Принимает компонент и возвращает обёртку над ним, которая получает adaptiveMode из контекста и передаёт в опции.
 * Нужно использовать в тех случаях, когда в чистом реактовском классе нужно значение adaptiveMode для настройки адаптивности.
 * Для функциональных компонентов лучше пользоваться хуком {@link useAdaptiveMode}.
 * @public
 * @example
 * <pre>
 *    class Button extends React.Component {
 *       // ...код кнопки
 *    }
 *    export default withAdaptiveMode(Button);
 * </pre>
 * @param WrappedComponent Компонент, который нужно обернуть.
 * @see useAdaptiveMode
 */
export function withAdaptiveMode<T>(
    WrappedComponent: ComponentType<T>
): (props: T) => ReactElement<T> {
    const displayName =
        WrappedComponent.displayName || WrappedComponent.name || 'Component';

    const ComponentWithAdaptiveMode = (props: T) => {
        const adaptiveMode = useAdaptiveMode();
        return createElement(WrappedComponent, {
            adaptiveMode,
            ...(props as T),
        });
    };

    ComponentWithAdaptiveMode.displayName = `withAdaptiveMode(${displayName})`;

    return ComponentWithAdaptiveMode;
}

/**
 * Хук для получения adaptiveMode.
 * @public
 */
export function useAdaptiveMode(): AdaptiveModeType {
    return useContext(getWasabyContext()).adaptiveMode;
}
