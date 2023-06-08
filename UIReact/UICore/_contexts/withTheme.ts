import { useContext, ComponentType, createElement, ReactElement } from 'react';
import { Optional } from './Optional';
import { getWasabyContext } from './WasabyContext';
import { Logger } from 'UICommon/Utils';

interface IThemableComponent {
    theme: string;
}

/**
 * Принимает компонент и возвращает обёртку над ним, которая получает тему из контекста и передаёт в опции.
 * Соответственно, строковый проп theme должен быть частью API этого компонента.
 * Нужно использовать в тех случаях, когда в чистом реактовском классе нужно значение темы.
 * Для функциональных компонентов лучше пользоваться хуком {@link useTheme}.
 * @public
 * @example
 * <pre>
 *    interface IButtonProps {
 *        onClick: (e: Event) => void;
 *        theme: string;
 *    }
 *    class Button extends React.Component<IButtonProps> {
 *       // ...код кнопки
 *    }
 *    export default withTheme<IButtonProps>(Button);
 * </pre>
 * @param WrappedComponent Компонент, который нужно обернуть.
 * @see useTheme
 */
export function withTheme<T extends IThemableComponent = IThemableComponent>(
    WrappedComponent: ComponentType<T>
): (
    props: Optional<T, keyof IThemableComponent>
) => ReactElement<T & { theme: string }> {
    const displayName =
        WrappedComponent.displayName || WrappedComponent.name || 'Component';

    const ComponentWithTheme = (
        props: Optional<T, keyof IThemableComponent>
    ) => {
        const themeValue = useTheme();

        if (typeof props.theme !== 'undefined' && props.theme !== themeValue) {
            Logger.error(
                `[${displayName}] Значение опции theme переданное в опции не совпадает со значением из контекста (опции: ${props.theme}, контекст: ${themeValue}). Задание опции theme через опцию устарело, используйте контекст.`
            );
        }

        return createElement(WrappedComponent, {
            theme: themeValue,
            ...(props as T),
        });
    };

    ComponentWithTheme.displayName = `withTheme(${displayName})`;

    return ComponentWithTheme;
}

/**
 * Хук для получения значения темы. Если компонент может вставляться в Wasaby шшаблон, нужно передать props.
 * @public
 */
export function useTheme(props: Partial<IThemableComponent> = {}): string {
    const themeFromContext = useContext(getWasabyContext()).theme;
    return props.theme ?? themeFromContext;
}
