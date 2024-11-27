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

    // костыль чтобы блокировка работала правильно
    // проблема в том, что рандомная лишняя перерисовка приводит к нарушениб пордяка обработчиков
    // из-за этого в некоторых сценариях событие блокировки регистриурется после оригинального события
    // можно надо сделать публичный метод в prepareWasabyEvent, который позволит управлять пордяком подписок
    // однако, в таком случае мы не может отказать от системы событий wasaby
    // что приводит к тому что BodyScrollHOC надо или внедрять в логику ScrollContainer или добавлять дополнительный div
    const isCapturePhase = useCallback(() => {
        const req = process && process.domain && process.domain.req;
        const href = req ? req.originalUrl : location.href;
        let result = false;
        const blacklist = [/class\.sbis\.ru/, /class\.saby\.ru/];
        blacklist.find((badPathname) => {
            if (href.search(badPathname) !== -1) {
                result = true;
                return true;
            }
        });
        return result;
    }, []);

    const handlerCreate = useCallback((e) => {
        // скролл на боди выключен или заморожен
        if (!ScrollOnBodyStore.read('enabled') || !scrollOnBodyUnfrozen) {
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
                // добавляют нативную подписку внутри скролл конетйнера, в адаптиве она нестреляет,
                // т.к. происходит остановка события на самом скролл конейнере
                // пока правим по месте, надо будет придумать более универсальное решение
                if (_e.target.className.includes('js-controls-GridColumnScroll_mirror')) {
                    return;
                }
                _e.stopImmediatePropagation();
            };
            // надо гарантировать вызов блокировки оригинального обработчика, вне зависимости от порядка регистрации событий
            context._container.firstChild.addEventListener(
                eventName,
                blockOriginFn,
                isCapturePhase()
            );
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
