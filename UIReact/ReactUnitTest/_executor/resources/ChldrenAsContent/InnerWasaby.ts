import { ForwardedRef } from 'react';
import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!ReactUnitTest/_executor/resources/ChldrenAsContent/InnerWasaby');

export default class InnerWasaby extends Control<{
    className?: string;
    forwardedRef?: ForwardedRef<HTMLElement>;
}> {
    protected _template: TemplateFunction = template;
}
