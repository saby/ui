import { ForwardedRef } from 'react';
import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!ReactUnitTest/_executor/resources/ChildrenAsContent/InnerWasaby');

export default class InnerWasaby extends Control<{
    className?: string;
    forwardedRef?: ForwardedRef<HTMLElement>;
    text?: string;
}> {
    protected _template: TemplateFunction = template;
}
