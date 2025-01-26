/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
/**
 * @kaizen_zone ce2d78ce-ad75-44f2-a211-06e89b0e061a
 */
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
    const attrs = inProps.attrs as Record<string, any>;
    const context = inProps.context as Record<string, any>;
    const clearProps = {
        ...inProps,
        attrs: undefined,
        context: undefined,
    };
    if (needDeleteClassName(attrs)) {
        // Как правило clearProps просто бездумно прокидывают дальше в "ребенка".
        // Поэтому удаляем className из clearProps.
        delete clearProps.className;
    }

    // необходимо удалять $wasabyRef,
    // если оставлять $wasabyRef = undefined, то в ReactComponent.ts forwardedRef не создается
    delete clearProps.$wasabyRef;
    delete clearProps.forwardedRef;

    const events: Record<string, Function> = {};
    for (const eventName of reactEventList) {
        const event = clearProps[eventName as keyof T & TInternalProps];
        if (event) {
            events[eventName] = event as unknown as Function;
            delete clearProps[eventName as keyof T & TInternalProps];
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

export function clearEvent(props: TInternalProps<any>, eventForClear: string[]): void {
    // возможно ситуация когда react контрол может вставляться как внутри react, так и внутри wasaby
    // в случае react $wasabyRef не существует и чистить его не надо
    props.$wasabyRef?.clear(EVENT_HANDLER_TYPE, eventForClear);
}

function needDeleteClassName(attrs: Record<string, any> | undefined): boolean {
    if (attrs && attrs.hasOwnProperty('className')) {
        // clearProps.className необходимо удалять только если есть props.attrs.className
        return true;
    }
    return false;
}
