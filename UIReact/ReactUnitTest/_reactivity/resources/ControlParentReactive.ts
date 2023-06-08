import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_reactivity/resources/ControlParentReactive';

export default class ControlParentReactive extends Control {
    _template: TemplateFunction = template;
    protected value: number[] = [0, 1];
}
