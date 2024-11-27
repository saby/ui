/**
 * @kaizen_zone 756abe02-446a-441d-96fd-3b64239d74fc
 */
import { traverseParents } from './traverseParents';
import { EventCatchers } from './EventCatchers';
import {
    cloneElement,
    forwardRef,
    type ReactNode,
    Ref,
    RefObject,
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
} from 'react';
import { ChainOfRef } from 'UICore/Ref';
import { Logger } from 'UICommon/Utils';
import { MyHTMLElement } from './interfaces';

/**
 * проверка элемента на видимость
 */
function isHidden(container?: HTMLElement): boolean {
    return !container || !document.body.contains(container);
}

/**
 * Опции контрола UI/EventCapture:EventHook
 * @public
 */
interface IProps {
    catchEvent: <T extends Event>(event: T) => boolean;
    context?: string;
    children: ReactNode;
}

function EventHook(props: IProps, ref: Ref<unknown>) {
    const { catchEvent, context, children, ...rest } = props;
    // нужно вызвать регистрацию только после обновления дома, и когда реф обновится
    const container = useRef<HTMLElement>();
    const eventHookRef = function (elem: HTMLElement) {
        if (elem) {
            container.current = elem;
            if (elem instanceof HTMLElement) {
                elem._$eventHook = true;
            } else {
                Logger.warn(
                    'UI/EventsCapture:EventHook: необходимо прокинуть ref до корневого элемента'
                );
            }
            register();
        }
    };
    // надо позвать разрегистрацию до того как произойдет перерисовка и дом будет изменен,
    // чтобы могли пройтись по актуальному дому
    useLayoutEffect(() => {
        return () => {
            unregister(container.current);
        };
    }, []);

    const finalRef = useMemo(() => {
        return ChainOfRef.both(ref, eventHookRef) as RefObject<HTMLElement>;
    }, [ref]);

    const register = useCallback(() => {
        // не регистрируем для скрытых контролов
        if (isHidden(container.current)) {
            return;
        }

        traverseParents<MyHTMLElement>(
            (currentElem): boolean => {
                if (!container.current) {
                    return false;
                }
                currentElem._$eventCatchers = currentElem._$eventCatchers || new EventCatchers();
                currentElem._$eventCatchers.add({
                    catchEvent,
                    container: container.current,
                });
                return false;
            },
            container.current as MyHTMLElement,
            context
        );
    }, [catchEvent, context, container.current]);
    const unregister = useCallback(
        (container) => {
            traverseParents<MyHTMLElement>(
                (currentElem: MyHTMLElement): boolean => {
                    currentElem._$eventCatchers?.remove(catchEvent);
                    return false;
                },
                container as MyHTMLElement,
                context
            );
        },
        [catchEvent, context, container.current]
    );

    return cloneElement(children, {
        ...rest,
        ref: finalRef,
    });
}
export default forwardRef(EventHook);
