import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UIDemo/ReactDemo/Updating/ControlParentReactive';

export default class ControlParentReactive extends Control {
    _template: TemplateFunction = template;
    protected value: number[] = [0, 1];
}
