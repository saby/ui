import { Control } from 'UICore/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ErrorBoundaryTest/CrashedControl';
import { TemplateFunction } from 'UICommon/_base/Control';

export const functionNameForTestStack = 'crashWasHere';
export const errorMessage = 'I Crashed';

function getRenderValue(): void {
    throw new Error(errorMessage);
}

Object.defineProperty(getRenderValue, 'name', { value: functionNameForTestStack });

export default class CrashedControl extends Control {
    _template: TemplateFunction = template;

    render(): unknown {
        return getRenderValue();
    }
}
