import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/UpdatingAndHooks/Middle';

export default class Middle extends Control {
    _template: TemplateFunction = template;
    middleValue: number = 0;

    protected _afterMount(options?: {}, contexts?: any): void {
        super._afterMount(options, contexts);
        this.middleValue++;
    }

    render(empty?: any, attributes?: any): any {
        this.props.order.push('render middle control ' + this.middleValue);
        return super.render(empty, attributes);
    }

    protected _afterRender(oldOptions?: {}, oldContext?: any): void {
        super._afterRender(oldOptions, oldContext);
        this.props.order.push('afterRender middle control ' + this.middleValue);
        if (this.middleValue !== 3) {
            this.middleValue++;
        }
    }
}
