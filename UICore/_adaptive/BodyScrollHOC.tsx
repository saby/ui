/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
import type { MutableRefObject, LegacyRef, RefCallback, PropsWithChildren } from 'react';
import { useEffect, useRef, cloneElement, forwardRef, useCallback } from 'react';
import { scrollOnBodyUnfrozen } from './ScrollOnBody';
import { default as ScrollOnBodyStore } from './ScrollOnBodyStore';

type TRefsType = MutableRefObject<unknown> | LegacyRef<unknown> | undefined | null;
export default forwardRef(function BodyScrollHOC(
    props: PropsWithChildren<unknown>,
    ref: LegacyRef<unknown> | undefined | null
): JSX.Element {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const _events = new WeakMap();

    const mergedRef = useCallback((refs: TRefsType[]): RefCallback<unknown> => {
        return (value) => {
            refs.forEach((ref) => {
                if (typeof ref === 'function') {
                    ref(value);
                } else if (ref != null) {
                    (ref as React.MutableRefObject<unknown | null>).current = value;
                }
            });
        };
    }, []);

    const fullRef = mergedRef([wrapperRef, ref]);

    useEffect(() => {
        const handlerCreate = (e) => {
            if (!ScrollOnBodyStore.read('enabled')) {
                return;
            }
            const wasabyEvent = e.detail[0];
            const eventsForProxy = e.detail[1];
            const context = wasabyEvent._nativeEvent.detail.control;
            // события в scrollContainer регистрируют не на сам контейнер, а на превого его ребенка
            // поэтому извлекаем из оттуда
            if (
                context._container.firstChild.firstChild.scrollHeight < window.visualViewport.height
            ) {
                return;
            }
            const _ev = {};
            for (const i of Object.keys(eventsForProxy)) {
                const eventName = i.split(':')[1];
                const eventHandler = function (e) {
                    if (!scrollOnBodyUnfrozen) {
                        return;
                    }
                    const args = e.detail ? e.detail : arguments;
                    eventsForProxy[i].apply(context, [...args]);
                };
                window.document.addEventListener(eventName, eventHandler);
                // блокируем оригинальную подписку на событий, чтобы не стрелять событием 2 раза при включенном скролле на боди
                const blockOriginFn = (e) => {
                    e.stopPropagation();
                };
                context._container.firstChild.addEventListener(eventName, blockOriginFn);
                _ev[eventName] = eventHandler;
            }
            _events.set(context, _ev);
            context.__scrollOnBody = true;
            e.stopPropagation();
        };

        const handlerRemove = (e) => {
            // отписку надо делать всегда не смотря на фичу,
            // т.к. при переходе на страницы из черного списка надо удалить подписки с боди
            const eventObject = e._nativeEvent || e;
            const context = eventObject.detail.control;
            if (
                context._container.firstChild.firstChild.scrollHeight < window.visualViewport.height
            ) {
                return;
            }
            const _ev = _events.get(context);
            if (!_ev) {
                return;
            }
            for (const i of Object.keys(_ev)) {
                window.document.removeEventListener(i, _ev[i]);
            }
            _events.delete(context);
            e.stopPropagation();
        };
        wrapperRef.current?.addEventListener('createChildrenScroll', handlerCreate);
        wrapperRef.current?.addEventListener('destroyChildrenScroll', handlerRemove);
        return () => {
            wrapperRef.current?.removeEventListener('createChildrenScroll', handlerCreate);
            wrapperRef.current?.removeEventListener('destroyChildrenScroll', handlerRemove);
        };
    }, []);
    return (
        <div style={{ display: 'contents', width: '100%', height: '100%' }} ref={fullRef}>
            {props.children}
        </div>
    );
});
