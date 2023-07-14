import { ForwardedRef } from 'react';
import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import template = require('wml!ReactUnitTest/_executor/resources/ChldrenAsContent/WasabyContentInRoot');

// Почему-то не работает forwardedRef в инверфейсе UI/Base:Control
interface IWasabyContentInRootOptions extends IControlOptions {
    forwardedRef: ForwardedRef<HTMLElement>;
}

export default class WasabyContentInRoot extends Control<IWasabyContentInRootOptions> {
    protected _template: TemplateFunction = template;
}
