import { Control } from 'UICore/Base';
import { TemplateFunction } from 'UI/Base';
import * as template from 'wml!UIDemo/ReactDemo/Loading/LoadingApp';

export default class LoadingApp extends Control {
    // tslint:disable-next-line:no-any
    constructor(props: any, context: any) {
        super(props, context);
    }
    protected _template: TemplateFunction = template;
}
