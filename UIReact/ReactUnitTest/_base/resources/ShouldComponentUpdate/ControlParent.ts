import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ShouldComponentUpdate/ControlParent';
import ControlChild from './ControlChild';

export default class ControlParent extends Control {
    _template: TemplateFunction = template;
    _children: {
        child: ControlChild;
    };
    protected _timeToMountChild: number = ControlParent.timeToMountChild;
    protected _testOption: object = {
        updated: false,
    };

    protected _beforeMount(): Promise<void> | void {
        // eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-unused-expressions
        new Promise((resolve) => {
            setTimeout(() => {
                this._testOption = {
                    updated: true,
                };
                resolve();
            }, ControlParent.timeToChangeOption);
        });
    }

    static readonly timeToMountChild: 30;
    static readonly timeToChangeOption: 15;
}
