import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/Refs/ControlNodes/ItemsWrapper';

export default class ItemsWrapper extends Control {
    _template: TemplateFunction = template;
    protected _items = [{ value: 0 }, { value: 1 }, { value: 2 }];

    protected changeHandler(): void {
        this._items.splice(0, 1);
    }

    protected clickHandler(event: Event, value: number) {
        const args = [
            event.target.controlNodes[0].events['on:click'][0].args[0],
            value,
        ];
        this._notify('itemClick', args, { bubbling: true });
    }
}
