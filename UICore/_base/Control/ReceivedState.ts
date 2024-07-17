/**
 * @kaizen_zone 0ccc023a-7640-4846-a9bd-1f6e7d28b903
 */
import { getStateReceiver } from 'Application/Env';
import { isInit } from 'Application/Initializer';
import { IStateReceiverMeta } from 'Application/State';

/**
 * Класс инкапсулирует в себя работу со StateReceiver для базового контрола
 * @private
 */
export default class ReceivedState {
    constructor(private _moduleName: string, private _RSKey: string) {}

    /**
     * Метод извлекает из StateReceiver состояние контрола
     * @param guess
     */
    ejectReceivedState<T>(guess: boolean = false): T {
        if (this.isServerSide() || !this._RSKey || !isInit()) {
            return;
        }

        const stateReceiver = getStateReceiver();
        if (!stateReceiver || !stateReceiver.register) {
            return;
        }

        let result;
        stateReceiver.unregister?.(this._RSKey);
        stateReceiver.register(
            this._RSKey,
            {
                getState: () => {
                    return undefined;
                },
                setState: (state) => {
                    result = state;
                },
            },
            guess
        );
        stateReceiver.unregister?.(this._RSKey);

        return result;
    }

    /**
     * Метод помещает в StateReceiver состояние контрола, полученное из _beforeMount
     * @param RSKey
     * @param moduleName
     * @param resultBeforeMount
     */
    saveReceivedState(resultBeforeMount: Promise<unknown> | unknown): void {
        if (!this.isServerSide() || !resultBeforeMount || !isInit()) {
            return;
        }

        const meta: IStateReceiverMeta = {
            ulid: this._RSKey,
            moduleName: this._moduleName,
        };
        if (resultBeforeMount instanceof Promise) {
            return getStateReceiver().register(meta, resultBeforeMount);
        }

        getStateReceiver().register(meta, {
            getState: () => {
                return resultBeforeMount as Record<string, unknown>;
            },
            setState: () => {
                return void 0;
            },
        });
    }

    /**
     * Отдельный метод для мока в тестах передачи данных с сервера на клиент.
     */
    isServerSide(): boolean {
        return typeof window === 'undefined';
    }
}