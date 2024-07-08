/**
 * @kaizen_zone ce2d78ce-ad75-44f2-a211-06e89b0e061a
 */
import * as React from 'react';
import { isReactElement } from 'UICore/Executor';

type ContentFunctionalComponent<P> = (props: P, _) => JSX.Element | null;

/**
 * Хок для подготовки контентной опции, для создания контентной опции.
 * Необходим, что бы при каждой перерисовке функция не была создана заново.
 * И при любом обновлении не проихсодила размонтирование DOMElement и создание заново.
 * @param contentOption контентная опция
 * @param refDetectProps props чью ссылочную целостность нужно отслеживать, для пересоздания контейнтной опции
 */
export function useContent<P = unknown>(
    contentOption: ContentFunctionalComponent<P>,
    refDetectProps: unknown[] = []
): ContentFunctionalComponent<P> {
    return React.useMemo(() => {
        return contentOption.length === 2
            ? React.forwardRef<unknown, P>(contentOption)
            : contentOption;
    }, refDetectProps);
}

const SKIP_MEMO_KEYS = ['_$internal', '_$events', '_$blockOptionNames', '_$attributes'];
/**
 * Временная функция, для расчёта свойств в useContent
 * Она должна из props должна получить все свойства,
 * которые при измекнении по ссылке обязательно должны перегенерировать контентную опцию.
 * В контентных опциях часто используются Record и RecrodSet. При их мзенении нужно заново создать функцию контентной опции.
 * Либо же, если контеная опция приходит в props то при её изменении так же нужно перегенерировать.
 * @param props
 * @private
 */
export function calcUseMemoProps<T = Record<string, unknown>>(props: T): unknown[] {
    const result = [];
    for (const key in props) {
        if (SKIP_MEMO_KEYS.includes(key)) {
            continue;
        }
        if (!props[key]) {
            continue;
        }
        if (props[key] && !!props[key].isDataArray) {
            const contentOptionsText = props[key].array[0].func.toString();
            if (contentOptionsText.indexOf('[native code]') !== -1) {
                continue;
            }
            result.push(contentOptionsText);
            continue;
        }
        if (props[key].constructor.toString().indexOf('[native code]') !== -1) {
            continue;
        }
        if (!props[key].constructor) {
            continue;
        }

        result.push(props[key]);
    }

    return result;
}

/**
 * Преобразует контентный проп в реакт элемент.
 * Используется, когда неизвестно, придёт контент - это компонент (включая васаби контрол или шаблон) или элемент.
 * @public
 * @example
 * <pre>
 *    import { convertContentToElement } from 'UICore/Jsx'
 *    import { cloneElement } from 'react'
 *    function ReactComponent(props) {
 *        const contentElement = convertContentToElement(props.customContent);
 *        const contentClassName = contentElement.props.className || '';
 *        const elementWithClassName = cloneElement(contentElement, {
 *            className: 'myClassName ' + contentClassName
 *        });
 *        return <div>{elementWithClassName}</div>;
 *    }
 * </pre>
 */
export function convertContentToElement<P extends {} = {}>(
    content: React.ComponentType<P> | React.ReactElement<P>
): React.ReactElement<P> {
    if (isReactElement(content)) {
        return content;
    }
    return React.createElement(content);
}
