import { Record } from 'Types/entity';
import { Control, TemplateFunction } from 'UI/Base';
import { dafault as Child1 } from './Child1';
import * as template from 'wml!ReactUnitTest/_base/OptionsVersions/Parent';

export default class Parent extends Control {
    protected _template: TemplateFunction = template;

    protected _record: Record = new Record({
        rawData: {
            field: 'parent',
        },
    });

    getChild1(): Child1 {
        return this._children.child1;
    }
}
