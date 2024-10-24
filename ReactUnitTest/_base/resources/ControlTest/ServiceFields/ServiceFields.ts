import { Control, IControlChildren } from 'UICore/Base';
import { IControlOptions, TemplateFunction } from 'UICommon/Base';
import ServiceFieldsChild from './ServiceFieldsChild';

import template = require('wml!ReactUnitTest/_base/resources/ControlTest/ServiceFields/ServiceFields');

// Служеюные поля используются снаружи несмотря на их приватность
interface IHackedServiceFieldsChild {
    _logicParent: Control<IControlOptions>;
    _mounted: boolean;
    _unmounted: boolean;
    _destroyed: boolean;
}

interface IServiceFieldsChildren extends IControlChildren {
    serviceFieldsChild: ServiceFieldsChild;
}

export default class ServiceFields extends Control {
    readonly _template: TemplateFunction = template;
    _children: IServiceFieldsChildren;
    protected showChild: boolean = true;
    hideChild(): void {
        this.showChild = false;
    }
    getChild(): IHackedServiceFieldsChild {
        if ('serviceFieldsChild' in this._children) {
            return this._children
                .serviceFieldsChild as unknown as IHackedServiceFieldsChild;
        }
    }
}
