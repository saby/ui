import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_events/resources/EventsTest/BeforeUnmountParent';

export default class BeforeUnmountParent extends Control {
    _template: TemplateFunction = template;
    protected childUnmounted: boolean = false;
    protected _innerChild: Control;

    _afterMount(): void {
        // эмулируем регистратор
        this._innerChild = this._children.child._children.inner;
    }

    _childUnmountHandler(): void {
        this.childUnmounted = true;
        this._innerChild = undefined;
    }
}
