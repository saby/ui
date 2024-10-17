import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ControlTest/OptionsToStateReceiver';

export default class OptionsToStateReceiver extends Control {
    _template: TemplateFunction = template;

    // @ts-ignore
    protected _beforeMount(options: object): object {
        return {
            myData: 42,
            myOptions: { ...options },
        };
    }

    static defaultProps: { rskey: string } = {
        rskey: 'OptionsToStateReceiver',
    };
}
