import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!ReactUnitTest/_nodeCollector/RootControlOpenerLowerHisParent');
import LowerOpener from './LowerOpener';

export default class RootControlOpenerLowerHisParent extends Control {
    protected _template: TemplateFunction = template;
    protected savedOpener: LowerOpener;
    protected className: string = 'firstMountClassName';
    protected setOpener(newOpener: LowerOpener): void {
        this.savedOpener = newOpener;
        this.className = 'setOpenerClassName';
    }
    _beforeMount(): void {
        this.setOpener = this.setOpener.bind(this);
    }
}
