import * as template from 'wml!ReactUnitTest/_jsx/ConvertContentToElement/CustomContentFromWml';
import { Control, TemplateFunction } from 'UI/Base';

export default class CustomContentFromWml extends Control {
    protected _template: TemplateFunction = template;
}
