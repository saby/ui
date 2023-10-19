import { Control, IControlOptions, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UI/_adaptive/BodyScrollHOC/BodyScrollHOC';

export default class BodyScrollHOC extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _events = {};

    protected _beforeMount() {}

    handlerCreate(e, eventsForProxy, context) {
        if (!this.context.isScrollOnBody) {
            return;
        }
        if (context._container.firstChild.firstChild.scrollHeight < window.visualViewport.height) {
            return;
        }
        const _ev = {};
        for (const i of Object.keys(eventsForProxy)) {
            const eventName = i.split(':')[1];
            const eventHandler = eventsForProxy[i].bind(context);
            window.document.addEventListener(eventName, eventHandler);
            _ev[eventName] = eventHandler;
        }
        this._events[context] = _ev;
        context.__scrollOnBody = true;
        e.stopPropagation();
    }
    handlerRemove(e, context) {
        if (!this.context.isScrollOnBody) {
            return;
        }
        const _ev = this._events[context];
        for (const i of Object.keys(_ev)) {
            window.document.removeEventListener(i, _ev[i]);
        }
        e.stopPropagation();
    }

    protected_beforeUnmount() {
        // for (const i of Object.keys(this._events)) {
        //     window.document.removeEventListener(i, this._events[i])
        // }
    }
}
