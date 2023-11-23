import { Control, IControlOptions, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UI/_adaptive/BodyScrollHOC/BodyScrollHOC';

/**
 * Специальных HOC для переноса событий со scrollContainer на body в адаптиве
 * Следует оборачивать область которая должны приводить к прокрутке body, чтобы работали нативные механизмы браузера
 * Компонент работает только со scrollContainer
 * Например, реестры или стековые окна
 * @public
 */

export default class BodyScrollHOC extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _events = new WeakMap();

    protected _beforeMount() {}

    handlerCreate(e, eventsForProxy) {
        if (!this.context.isScrollOnBody) {
            return;
        }
        const context = e._nativeEvent.detail.control;
        // события в scrollContainer регистрируют не на сам контейнер, а на превого его ребенка
        // поэтому извлекаем из оттуда
        if (context._container.firstChild.firstChild.scrollHeight < window.visualViewport.height) {
            return;
        }
        const _ev = {};
        for (const i of Object.keys(eventsForProxy)) {
            const eventName = i.split(':')[1];
            const eventHandler = function (e) {
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
        this._events.set(context, _ev);
        context.__scrollOnBody = true;
        e.stopPropagation();
    }
    handlerRemove(e) {
        // отписку надо делать всегда не смотря на фичу,
        // т.к. при переходе на страницы из черного списка надо удалить подписки с боди
        const context = e._nativeEvent.detail.control;
        if (context._container.firstChild.firstChild.scrollHeight < window.visualViewport.height) {
            return;
        }
        const _ev = this._events.get(context);
        if (!_ev) {
            return;
        }
        for (const i of Object.keys(_ev)) {
            window.document.removeEventListener(i, _ev[i]);
        }
        this._events.delete(context);
        e.stopPropagation();
    }
}
