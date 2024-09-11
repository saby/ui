import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_react/OnCompatiblePage/User/UserControl';

export default class UserControl extends Control {
    _template: TemplateFunction = template;
}
