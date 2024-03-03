/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
import { ComponentType, Component, useContext } from 'react';
import { AdaptiveModeContext, TAdaptiveModeContext } from './AdaptiveModeContext';
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
export function withAdaptiveMode<T extends ComponentType>(WrappedComponent: T): T {
    const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    class ComponentWithAdaptiveMode extends Component<any, any> {
        _$child: any;
        constructor(props) {
            super(props);
            this.ref = this.ref.bind(this);
        }
        ref(node) {
            this._$child = node;
        }
        render() {
            return (
                // @ts-ignore
                <WrappedComponent
                    {...this.props}
                    ref={this.ref}
                    adaptiveMode={this.context?.adaptiveMode}
                />
            );
        }
        static readonly contextType: TAdaptiveModeContext = AdaptiveModeContext;
        static displayName: string = `withAdaptiveMode(${displayName})`;
    }

    // todo это костыль для попапов, они почему-то на флаг проверяют в BaseOpener:showDialog
    //  когда у них это поправится, можно будет откатить
    //  https://online.sbis.ru/opendoc.html?guid=74845e59-1af7-442e-aa63-6ac8b31d0af7&client=3
    // @ts-ignore
    ComponentWithAdaptiveMode.isReact = true;
    // многие задают этот метод для установки опций по умолчанию, этот метод используется в попапах для получения опций
    // @ts-ignore
    ComponentWithAdaptiveMode.getDefaultOptions = WrappedComponent.getDefaultOptions;
    // @ts-ignore
    ComponentWithAdaptiveMode._getDefaultOptions = WrappedComponent._getDefaultOptions;
    // альтернативный, правильный с точки зрения реакта способ задания опций по умолчанию
    // @ts-ignore
    ComponentWithAdaptiveMode.defaultProps = WrappedComponent.defaultProps;
    // @ts-ignore
    ComponentWithAdaptiveMode.getOptionTypes = WrappedComponent.getOptionTypes;
    // статическое поле для задания стилей
    // @ts-ignore
    ComponentWithAdaptiveMode._styles = WrappedComponent._styles;

    // @ts-ignore
    return ComponentWithAdaptiveMode;
}

/**
 * Хук для получения adaptiveMode.
 * @public
 */
export function useAdaptiveMode(): AdaptiveModeType {
    return useContext(AdaptiveModeContext)?.adaptiveMode;
}
