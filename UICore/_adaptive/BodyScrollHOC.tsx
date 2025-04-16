/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
import type { LegacyRef, PropsWithChildren } from 'react';
import type { TCustomEvent } from 'UICore/Events';
import { useEffect, forwardRef, useCallback } from 'react';
import { scrollOnBodyUnfrozen } from './ScrollOnBody';
import { default as ScrollOnBodyStore } from './ScrollOnBodyStore';
import { location as evnLocation } from 'Application/Env';

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
        const href = evnLocation.href;
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
        const _ev: Record<string, Function> = {};
        for (const i of Object.keys(eventsForProxy)) {
            const eventName = i.split(':')[1];
            const eventHandler = function (event: TCustomEvent) {
                if (!scrollOnBodyUnfrozen) {
                    return;
                }
                const args = event.detail ? event.detail : arguments;
                eventsForProxy[i].apply(context, [...args]);
            };
            bodyScrollContainer.addEventListener(eventName, eventHandler as EventListener);
            // блокируем оригинальную подписку на событий, чтобы не стрелять событием 2 раза при включенном скролле на боди
            const blockOriginFn = (e: TCustomEvent) => {
                // добавляют нативную подписку внутри скролл конетйнера, в адаптиве она нестреляет,
                // т.к. происходит остановка события на самом скролл конейнере
                // пока правим по месте, надо будет придумать более универсальное решение
                const target = e.target;
                if (
                    isValidTarget(target) &&
                    target.className.includes('js-controls-GridColumnScroll_mirror')
                ) {
                    return;
                }
                e.stopImmediatePropagation();
                // запускаем событие дальше, если это возможно,
                // сделано так, потому что оригинальная подписка на скролл контейнере все еще есть и ее надо пропустить
                // но мы все еще должны вызвать обработчик, который перенесли с контейнера на body
                if (
                    e.currentTarget instanceof HTMLElement &&
                    e.currentTarget.parentElement &&
                    e.createEvent
                ) {
                    const nextDispatchTraget = e.currentTarget.parentElement;
                    nextDispatchTraget.dispatchEvent(e.createEvent());
                }
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

function isValidTarget(target: EventTarget | null): target is Element {
    return !!(target && (target as Element).className);
}
