import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!UIDemo/ReactDemo/Updating/ControlChildReactive';

export default class ControlChildReactive extends Control {
    _template: TemplateFunction = template;
    protected value: number[];

    protected _beforeMount(options): void {
        this.value = options.value;
    }

    _beforeUpdate(options): void {
        if (JSON.stringify(this.value) === JSON.stringify(options.value)) {
            return;
        }
        setTimeout(() => {
            this.value = options.value;
            this._notify('valueChanged', [options.value]);
        }, 1);
    }

    getValue(): number[] {
        return this.value;
    }

    setValue(val: number[]): void {
        this.value = val;
    }

    onClick() {
        // следующий порядок вызовов важен
        this._forceUpdate();
        this.setValue([0]);
        this._notify('valueChanged', [[0]]);
    }
}
