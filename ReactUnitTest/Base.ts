import { Control } from 'UICore/Base';
import { IControlOptions } from 'UICommon/Base';

export interface ITestOptions extends IControlOptions {
    testName?: string;
    afterMountCallback?: Function;
    afterUpdateCallback?: Function;
}

export class TestBaseControl<
    IOptions extends ITestOptions = ITestOptions
> extends Control<IOptions> {
    testName: string = '';
    afterMountCallback: Function = null;
    afterUpdateCallback: Function = null;
    _beforeMount(options: ITestOptions): void {
        this.afterMountCallback = options.afterMountCallback;
        this.afterUpdateCallback = options.afterUpdateCallback;
        this.testName = options.testName;
    }
    _afterMount(): void {
        this.afterMountCallback?.(this);
    }
    _afterUpdate(): void {
        this.afterUpdateCallback?.(this);
    }
}
