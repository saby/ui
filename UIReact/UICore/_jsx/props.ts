/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import type { TInternalProps } from 'UICore/Executor';
import { reactEventList } from 'UICore/Events';
import { EVENT_HANDLER_TYPE } from 'UICore/Ref';

export type { TInternalProps } from 'UICore/Executor';

export interface IDelimited<T = Record<string, any>> {
    clearProps: T;
    $wasabyRef: (node?: any) => void;
    userAttrs: Record<string, any>;
    context: Record<string, any>;
    events: Record<string, Function>;
}

/**
 * Функция разделения props на служебные и общие
 * @param inProps объект свойств, который будет модифицирован по ссылке
 * @public
 */
export function delimitProps<T>(inProps: T & TInternalProps): IDelimited<T> {
    const $wasabyRef = inProps.$wasabyRef;
    const attrs = inProps.attrs;
    const context = inProps.context;
    const clearProps = { ...inProps, attrs: undefined, context: undefined };
    // необходимо удалять $wasabyRef,
    // если оставлять $wasabyRef = undefined, то в ReactComponent.ts forwardedRef не создается
    delete clearProps.$wasabyRef;
    delete clearProps.forwardedRef;

    const events = {};
    for (const eventName of reactEventList) {
        if (eventName in clearProps) {
            events[eventName] = clearProps[eventName];
            delete clearProps[eventName];
        }
    }

    return {
        clearProps,
        $wasabyRef,
        userAttrs: attrs,
        context,
        events,
    };
}

export function clearEvent(
    props: TInternalProps<any>,
    eventForClear: string[]
): void {
    // возможно ситуация когда react контрол может вставляться как внутри react, так и внутри wasaby
    // в случае react $wasabyRef не существует и чистить его не надо
    props.$wasabyRef?.clear(EVENT_HANDLER_TYPE, eventForClear);
}
