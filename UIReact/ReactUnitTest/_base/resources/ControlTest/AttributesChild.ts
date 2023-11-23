import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/AttributesChild';

export default class AttributesChild extends Control {
    _template: TemplateFunction = template;
    protected _beforeMount(): Promise<void> {
        return new Promise<void>((resolve) => {
            resolve();
        });
    }
}
