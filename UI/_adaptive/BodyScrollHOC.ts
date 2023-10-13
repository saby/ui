import { Control, IControlOptions, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UI/_adaptive/BodyScrollHOC/BodyScrollHOC';

/**
 * Специальных HOC для переноса событий со scrollContainer на body в адаптиве
 * Следует оборачивать область которая должны приводить к прокрутке body, чтобы работали нативные механизмы браузера
 * Например, реестры или стековые окна
 * @public
 */

export default class BodyScrollHOC extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _events = {};

    protected _beforeMount() {}

    handlerCreate(e, eventsForProxy) {
        if (!this.context.isScrollOnBody) {
            return;
        }
        const context = e._nativeEvent.detail.control;
        if (context._container.firstChild.firstChild.scrollHeight < window.visualViewport.height) {
            return;
        }
        const _ev = {};
        for (const i of Object.keys(eventsForProxy)) {
            const eventName = i.split(':')[1];
            const eventHandler = eventsForProxy[i].bind(context);
            window.document.addEventListener(eventName, eventHandler);
            // удаляем оригинальную подписку на событий, чтобы не стрелять событием 2 раза при включенном скролле на боди
            context._$notifyEvents
                ?.get(context._container.firstChild)
                ?.get(eventName)
                ?.[
                    eventsForProxy[i].name + '$' + context._moduleName + '$' + context._instId
                ].removeListener();
            _ev[eventName] = eventHandler;
        }
        this._events[context] = _ev;
        context.__scrollOnBody = true;
        e.stopPropagation();
    }
    handlerRemove(e) {
        if (!this.context.isScrollOnBody) {
            return;
        }
        const context = e._nativeEvent.detail.control;
        const _ev = this._events[context];
        for (const i of Object.keys(_ev)) {
            window.document.removeEventListener(i, _ev[i]);
        }
        e.stopPropagation();
    }
}
