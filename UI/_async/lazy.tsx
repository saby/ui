import { ReactNode, FunctionComponent } from 'react';
import Async from './Async';

/**
 * Интерфейс компонента-обертки, которая создается методом {@link lazy}
 * @see lazy
 * @public
 */
export interface ILazyProps extends Record<string, any> {
    children?: ReactNode;
    /**
     * Колбек, который будет вызван после построения загруженного компонента
     */
    onComponentLoad?: () => {};
}

/**
 * Метод создания обертки для асинхронной загрузки переданного компонента
 * @param factory Функция-обертка для обеспечения похожего интерфейса с react.lazy
 */
export function lazy(factory: () => FunctionComponent<ILazyProps>): FunctionComponent<ILazyProps> {
    return factory();
}

/**
 * Функция создающая компонент обертку для динамичной загрузки переданного компонента по имени
 * @param componentName Название компонента
 */
export function importer(componentName: string): FunctionComponent<ILazyProps> {
    const Lazy = function (props: ILazyProps) {
        return (
            <Async
                componentName={componentName}
                componentProps={{ ...props, children: undefined, onComponentLoad: undefined }}
                onComponentLoad={props.onComponentLoad}
            >
                {props.children}
            </Async>
        );
    };
    Lazy.displayName = 'UI/Async:lazy';
    return Lazy;
}
