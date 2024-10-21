import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_templateCreator/Main5';

export default class Main4 extends Control {
    _template: TemplateFunction = template;

    protected _beforeMount(options?: {
        childTemplate: TemplateFunction;
    }): Promise<void> | void {
        this.childTemplate = options.childTemplate;
        return super._beforeMount(options);
    }

    childTemplate: TemplateFunction;
}
