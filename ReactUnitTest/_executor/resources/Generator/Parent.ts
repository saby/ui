import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/Generator/Parent';

export default class Parent extends Control {
    _template: TemplateFunction = template;
    protected _testOption: string;
    // условный шаблон, получить такое возможно в случае вставки в Async c динамическим templateName
    protected _items = [{ itemTemplate: [''] }, { itemTemplate: [''] }];
}
