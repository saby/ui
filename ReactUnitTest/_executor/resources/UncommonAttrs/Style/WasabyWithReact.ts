import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!ReactUnitTest/_executor/resources/UncommonAttrs/Style/WasabyWithReact');
import { wasabySize } from './constants';

export default class WasabyWithReact extends Control {
    protected _template: TemplateFunction = template;
    protected _wasabySize: number = wasabySize;
}
