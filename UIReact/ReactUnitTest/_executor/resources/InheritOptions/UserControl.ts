import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/InheritOptions/UserControl';
import * as defaultItemTemplate from 'wml!ReactUnitTest/_executor/resources/InheritOptions/ItemTemplate';

export default class UserControl extends Control {
    _template: TemplateFunction = template;

    static getDefaultOptions(): Partial<unknown> {
        return {
            itemTemplate: defaultItemTemplate,
        };
    }
}
