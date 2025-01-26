import { Control, TemplateFunction, IControlOptions } from 'UI/Base';

import template = require('wml!ReactUnitTest/_base/resources/ControlTest/ServiceFields/WasabyWithReactInRoot');

interface IWasabyWithReactInRoot extends IControlOptions {
    passRef: boolean;
}

export default class WasabyWithReactInRoot extends Control<IWasabyWithReactInRoot> {
    protected _template: TemplateFunction = template;
    getCurrentContainer(): HTMLElement {
        return this._container;
    }
}
