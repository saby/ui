/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
import type { LegacyRef, PropsWithChildren } from 'react';
import { useEffect, forwardRef, useCallback } from 'react';
import { scrollOnBodyUnfrozen } from './ScrollOnBody';
import { default as ScrollOnBodyStore } from './ScrollOnBodyStore';

const USER_CONTENT_SELECTOR = '[name="userContent"]';

export default forwardRef(function BodyScrollHOC(
    props: PropsWithChildren<JSX.Element>,
    _ref: LegacyRef<unknown> | undefined | null
): JSX.Element {
    const _events = new WeakMap();
    const bodyScrollContainer = window?.document;

    const handlerCreate = useCallback((e) => {
        if (!ScrollOnBodyStore.read('enabled')) {
            return;
        }
        const wasabyEvent = e.detail[0];
        const eventsForProxy = e.detail[1];
        const context = wasabyEvent._nativeEvent.detail.control;
        // события в scrollContainer регистрируют не на сам контейнер, а на первого его ребенка
        // поэтому извлекаем их от туда
        const userContent = context._container.querySelector(USER_CONTENT_SELECTOR);
        if (!window.visualViewport || userContent.scrollHeight < window.visualViewport?.height) {
            return;
        }
        const _ev = {};
        for (const i of Object.keys(eventsForProxy)) {
            const eventName = i.split(':')[1];
            const eventHandler = function (_e: Event) {
                if (!scrollOnBodyUnfrozen) {
                    return;
                }
                const args = e.detail ? e.detail : arguments;
                eventsForProxy[i].apply(context, [...args]);
            };
            bodyScrollContainer.addEventListener(eventName, eventHandler);
            // блокируем оригинальную подписку на событий, чтобы не стрелять событием 2 раза при включенном скролле на боди
            const blockOriginFn = (_e: Event) => {
                _e.stopImmediatePropagation();
            };
            context._container.firstChild.addEventListener(eventName, blockOriginFn);
            _ev[eventName] = eventHandler;
        }
        _events.set(context, _ev);
        context.__scrollOnBody = true;
        e.stopPropagation();
    }, []);

    const handlerRemove = useCallback((e) => {
        const eventObject = e._nativeEvent || e;
        const context = eventObject.detail.control;
        const userContent = context._container.querySelector(USER_CONTENT_SELECTOR);
        if (!window.visualViewport || userContent.scrollHeight < window.visualViewport.height) {
            return;
        }
        const _ev = _events.get(context);
        if (!_ev) {
            return;
        }
        for (const i of Object.keys(_ev)) {
            bodyScrollContainer.removeEventListener(i, _ev[i]);
        }
        _events.delete(context);
        e.stopPropagation();
    }, []);

    useEffect(() => {
        bodyScrollContainer?.addEventListener('createChildrenScroll', handlerCreate);
        bodyScrollContainer?.addEventListener('destroyChildrenScroll', handlerRemove);
        return () => {
            bodyScrollContainer?.removeEventListener('createChildrenScroll', handlerCreate);
            bodyScrollContainer?.removeEventListener('destroyChildrenScroll', handlerRemove);
        };
    }, []);

    return props.children as JSX.Element;
});
