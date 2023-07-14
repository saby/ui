import { Control, IControlOptions, TemplateFunction } from 'UI/Base';
import template = require('wml!UIDemo/CompatibleDemo/WasabyEnv/Events/Case1/WasabyControl');

class WasabyControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    _date: Date = new Date(2017, 8, 28, 12, 12, 0, 0);

    static _styles: string[] = ['UIDemo/CompatibleDemo/CompatibleDemo'];
}
export default WasabyControl;
