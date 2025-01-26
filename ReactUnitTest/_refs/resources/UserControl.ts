import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_refs/resources/UserControl';

interface IMyId {
    data: string;
}
export default class UserControl extends Control {
    _template: TemplateFunction = template;
    _myId: IMyId;

    _afterMount(): void {
        this._myId = { data: 'myID' };
    }

    getInstanceId(): string {
        return this._myId.data;
    }
}
