import { CSSProperties } from 'react';
import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import template = require('wml!ReactUnitTest/_executor/resources/UncommonAttrs/Style/StyledWasaby');
import { wasabySize } from './constants';

interface IStyledWasabyOptions extends IControlOptions {
    style: CSSProperties;
}

export default class StyledWasaby extends Control<IStyledWasabyOptions> {
    protected _template: TemplateFunction = template;
    protected _wasabySize: number = wasabySize;
}
