import { Control, IControlOptions, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UI/_adaptive/BodyScrollHOC/BodyScrollHOC';

export default class BodyScrollHOC extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected isScrollOnBody: boolean = false;

    protected _beforeMount() {
        if (this.context.isScrollOnBody) {
            // @ts-ignore
            this._children.content._isMasterScroll = true;
        }
    }
}
