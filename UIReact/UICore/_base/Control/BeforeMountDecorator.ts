import ReceivedState from './ReceivedState';
import ThemeController, { IThemeControllerConfig } from './ThemeController';

export default class BeforeMountDecorator {
    private _receivedState: ReceivedState;
    private _themeController: ThemeController;
    private _beforeMountPromises: Promise<unknown>[] = [];
    /**
     * Набор промисов дочерних контролов, которые нужно подождать (потому что они или их дети строились асинхронно).
     * Таким образом будет поддержано правило, что _afterMount и _componentDidMount родителя срабатывает только
     * когда сработали все хуки дочерних контролов (как этом было при wasaby-inferno)
     */
    private _childrenPromises: Promise<unknown>[] = [];

    constructor() {
        this.registerAsyncChild = this.registerAsyncChild.bind(this);
    }

    initStateReceiver(moduleName: string, RSKey: string): void {
        this._receivedState = new ReceivedState(moduleName, RSKey);
    }

    getReceivedState<T>(): T | undefined {
        if (this._receivedState) {
            return this._receivedState.ejectReceivedState<T>();
        }
        return undefined;
    }

    initThemeController(themeControllerConfig: IThemeControllerConfig): void {
        this._themeController = new ThemeController(themeControllerConfig);
    }

    updateTheme(themeName: string): void {
        if (this._themeController) {
            this._themeController.updateTheme(themeName)?.then(() => {
                return undefined;
            });
        }
    }

    processBeforeMount<T>(
        result: Promise<T | void> | T | void,
        cb: (resultData: T | unknown) => void
    ): boolean {
        let asyncInProgress: boolean = false;

        if (this._receivedState) {
            this._receivedState.saveReceivedState(result);
        }

        if (result && (result as Promise<unknown>).then) {
            // если promise не хакнут (нет resolvedObj) или находится в ожидании завершения, тогда добавляем
            if (!result.resolvedObj || result.resolvedObj.state === 'pending') {
                this._beforeMountPromises.push(
                    (result as Promise<unknown>).then(cb)
                );
                asyncInProgress = true;
            }
        }

        if (this._themeController) {
            const cssLoading: Promise<void> | null =
                this._themeController.updateTheme();
            if (cssLoading) {
                this._beforeMountPromises.push(cssLoading);
            }
        }

        if (!asyncInProgress) {
            cb(null);
        }

        return asyncInProgress;
    }

    registerAsyncChild(childPromise: Promise<unknown>): void {
        this._childrenPromises?.push(childPromise);
    }

    clearAsyncChild(fullClear?: boolean): void {
        if (fullClear) {
            return void delete this._childrenPromises;
        }

        this._childrenPromises = [];
    }

    hasAsync(): boolean {
        return !!this._beforeMountPromises.concat(this._childrenPromises || [])
            .length;
    }

    waitMyOwnAsyncMount(): Promise<void> {
        return this._waitAsyncMount(
            this._beforeMountPromises.concat(this._childrenPromises)
        ).then(() => {
            /** Накопленную инф. удаляем. В ходе вызова setState могут возникнуть новые потомки, из-за if */
            this._beforeMountPromises = [];
            this.clearAsyncChild();
        });
    }

    waitMyChildrenAsyncMount(): Promise<void> {
        return this._waitAsyncMount(this._childrenPromises).then(() => {
            /** Накопленную инф. удаляем. В ходе вызова setState могут возникнуть новые потомки, из-за if */
            this.clearAsyncChild();
        });
    }

    /**
     * Для текущего контрола процесс ожидания перед вызовом _afterMount вмещает в себя 3 составляющих:
     * Promise из _beforeMount прикладного кода, если он есть
     * Promise из загрузчика тем (формируется вместе с Promise из _beforeMount прикладного кода)
     * Promise.all от всех дочерних контролов, которые следуют точно таким же правилам.
     */
    private _waitAsyncMount(promisesToWait: Promise<unknown>[]): Promise<void> {
        if (!promisesToWait.length) {
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            return Promise.all(promisesToWait).finally(() => {
                resolve();
            });
        });
    }

    triggerAfterMount<T extends { onAfterMount?: Function }>(props: T): void {
        props.onAfterMount?.();
    }

    triggerAfterUpdate<T extends { onAfterUpdate?: Function }>(props: T): void {
        props.onAfterUpdate?.();
    }
}
