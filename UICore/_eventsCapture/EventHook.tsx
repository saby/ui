/**
 * @kaizen_zone 756abe02-446a-441d-96fd-3b64239d74fc
 */
import { traverseParents } from './traverseParents';
import { EventCatchers } from './EventCatchers';
import {
    cloneElement,
    forwardRef,
    type ReactElement,
    Ref,
    RefObject,
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
} from 'react';
import { ChainOfRef } from 'UICore/Ref';
import { MyHTMLElement } from './interfaces';
import { isReactElement } from 'UICore/Executor';

/**
 * проверка элемента на видимость
 */
function isHidden(container?: HTMLElement): boolean {
    return !(container && container instanceof HTMLElement && document.body.contains(container));
}

/**
 * Опции контрола UI/EventCapture:EventHook
 * @public
 */
interface IProps {
    catchEvent: <T extends Event>(event: T) => boolean;
    context?: string;
    children: ReactElement;
    forwardedRef?: Ref<any>;
}

function EventHook(props: IProps, ref: Ref<unknown>) {
    const { catchEvent, context, children, forwardedRef, ...rest } = props;
    // нужно вызвать регистрацию только после обновления дома, и когда реф обновится
    const container = useRef<HTMLElement>();

    const register = useCallback(
        (currentCatchEvent) => {
            // не регистрируем для скрытых контролов. Почему-то на них тоже стреляет реф, из-за совместимости с васаби
            if (isHidden(container.current)) {
                return;
            }

            traverseParents<MyHTMLElement>(
                (currentElem): boolean => {
                    if (!container.current) {
                        return false;
                    }
                    currentElem._$eventCatchers =
                        currentElem._$eventCatchers || new EventCatchers();
                    currentElem._$eventCatchers.add({
                        catchEvent: currentCatchEvent,
                        container: container.current,
                    });
                    return false;
                },
                container.current as MyHTMLElement,
                context
            );
        },
        [container.current, context]
    );
    const unregister = useCallback(
        (currentCatchEvent) => {
            traverseParents<MyHTMLElement>(
                (currentElem: MyHTMLElement): boolean => {
                    currentElem._$eventCatchers?.remove(currentCatchEvent);
                    return false;
                },
                container.current as MyHTMLElement,
                context
            );
        },
        [container.current, context]
    );

    const prevCatchEvent = useRef<<T extends Event>(event: T) => boolean>();
    const eventHookRef = useCallback(
        function (elem: HTMLElement) {
            // нельзя пропускать ничего кроме html-элементов, иначе в container сохранится не то
            // при анмаунте при разрегистрации должен быть ровно тот элемент, на котором запускалась регистрация
            if (!isHidden(elem)) {
                container.current = elem;
                // if (!(elem instanceof HTMLElement)) {
                //     Logger.warn(
                //         'UI/EventsCapture:EventHook: необходимо прокинуть ref до корневого элемента'
                //     );
                // }

                if (prevCatchEvent.current !== catchEvent) {
                    if (prevCatchEvent.current) {
                        unregister(prevCatchEvent.current);
                    }
                    prevCatchEvent.current = catchEvent;
                    register(catchEvent);
                }
            } else {
                // todo это валит тесты. отписывает то что не надо.
                //  должен быть кейс когда меняется корневой элемент и надо у предыдущего отписаться
                //  нужны юниты на это, на утечки
                //unregister(prevCatchEvent.current);
            }
        },
        [catchEvent, register, unregister]
    );
    const finalRef = useMemo(() => {
        return ChainOfRef.both(ref, eventHookRef) as RefObject<HTMLElement>;
    }, [ref]);

    // надо позвать разрегистрацию до того как произойдет перерисовка и дом будет изменен,
    // чтобы могли пройтись по актуальному дому
    // todo а тут unregister не не надо в dependencies? если добавить - падает тест
    useLayoutEffect(() => {
        return () => {
            unregister(catchEvent);
        };
    }, [catchEvent]);

    if (isReactElement(children)) {
        return cloneElement(children, {
            ...rest,
            ref: finalRef,
        });
    }

    return cloneElement(children, {
        ...rest,
        ref: finalRef,
        forwardedRef,
    });
}
export default forwardRef(EventHook);
