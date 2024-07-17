import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import template = require('wml!ReactUnitTest/_executor/resources/ChildrenAsContent/WasabyWithItemClickEvent');

interface IWasabyWithItemClickEventOptions extends IControlOptions {
    wasabyEventHandler: Function;
}

export default class WasabyWithItemClickEvent extends Control<IWasabyWithItemClickEventOptions> {
    _template: TemplateFunction = template;
    _itemClickHandler(): void {
        this._options.wasabyEventHandler();
    }
}
