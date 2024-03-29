import * as React from 'react';

type ContentFunctionalComponent<P> = (props: P, _) => JSX.Element | null;

/**
 * Хок для подготовки контентной опции, для создания контентной опции.
 * Необходим, что бы при каждой перерисовке функция не была создана заного.
 * И при любом обновлении не проихсодила размонтирование DOMElement и создание заного.
 * @param contentOption контентная опция
 * @param refDetectProps props чью ссылочную целостность нужно отслеживать, для пересоздания контейнтной опции
 */
export function useContent<P = unknown>(
    contentOption: ContentFunctionalComponent<P>,
    refDetectProps: unknown[] = []
): ContentFunctionalComponent<P> {
    return React.useMemo(() => {
        return React.forwardRef<P>(contentOption);
    }, refDetectProps);
}

const SKIP_MEMO_KEYS = [
    '_$internal',
    '_$events',
    '_$blockOptionNames',
    '_$attributes',
];
/**
 * Временная функция, для расчёта свойств в useContent
 * Она должна из props должна получить все свойства,
 * которые при измекнении по ссылке обязательно должны перегенерировать контентную опцию.
 * В контентных опциях часто используются Record и RecrodSet. При их мзенении нужно заного создать функцию контентной опции.
 * Либо же, если контеная опция приходит в props то при её изменении так же нужно перегенерировать.
 * @param props
 * @private
 */
export function calcUseMemoProps<T = Record<string, unknown>>(
    props: T
): unknown[] {
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
