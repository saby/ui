import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import Children from './Children';
import * as template from 'wml!ReactUnitTest/_stateReceiver/Controls/Parent';

interface IParentOptions extends IControlOptions {
    ref: (instance: Parent) => void;
}
export default class Parent extends Control<IParentOptions> {
    _template: TemplateFunction = template;

    _children: {
        children: Children;
    };

    getChildrenKey(): string {
        return this._children?.children.getReceivedStateKey();
    }
}
