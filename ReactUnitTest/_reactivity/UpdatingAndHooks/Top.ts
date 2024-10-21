import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/UpdatingAndHooks/Top';

export default class Top extends Control {
    _template: TemplateFunction = template;
    topValue: number = 0;

    protected _afterMount(options?: {}, contexts?: any): void {
        super._afterMount(options, contexts);
        this.topValue++;
    }
    render(empty?: any, attributes?: any): any {
        this.props.order.push('render top control ' + this.topValue);
        return super.render(empty, attributes);
    }

    protected _afterRender(oldOptions?: {}, oldContext?: any): void {
        super._afterRender(oldOptions, oldContext);
        this.props.order.push('afterRender top control ' + this.topValue);
        if (this.topValue !== 3) {
            this.topValue++;
        }
    }
}
