/**
 * Инструмент для принятия решения о необходимости обновления контрола.
 * Инкапсулирует в себя часть логики метода shouldComponentUpdate из базового Wasaby контрола
 * Способна только принимать решение о необходимости перерисовки без запуска активностей.
 * Не учитывает наличие прикладных методов _shouldUpdate, поскольку не знает ничего об инстансе
 */

/** Функция, которая возвращает результат вычисления необходимости обновления */
type updateReasonGetter = () => boolean;
/**
 * Текущие известные функции для расчета необходимости обновления
 * @private
 */
interface IReasonGetters {
    hasChangesState: updateReasonGetter;
    hasChangesAttrs: updateReasonGetter;
    hasChangesOptions: updateReasonGetter;
    hasChangesInternalOptions: updateReasonGetter;
}

/**
 * @private
 * @property {boolean} needUpdate
 * @property {boolean} canContinueExecute
 */
interface IShouldComponentUpdateResult {
    needUpdate: boolean;
    canContinueExecute: boolean;
    isOptionsChanged: boolean;
}

export default class ShouldComponentUpdateDecorator {
    private _reasonGettersMap: IReasonGetters;
    /** Замаунчен ли сейчас контрол? */
    private _mounted: boolean;
    /** Была ли необходимость к обновлению до окончания маунтинга */
    private _optionsChangedDuringMount: boolean;

    reset(mounted: boolean): ShouldComponentUpdateDecorator {
        delete this._reasonGettersMap;
        this._mounted = mounted;

        return this;
    }

    addReason(
        reasonGettersMap: IReasonGetters
    ): ShouldComponentUpdateDecorator {
        this._reasonGettersMap = reasonGettersMap;
        return this;
    }

    fireForceUpdate(method: () => void): void {
        if (this._optionsChangedDuringMount) {
            this._optionsChangedDuringMount = false;
            method();
        }
    }

    exec(): IShouldComponentUpdateResult {
        const hasChangesOptions = this._reasonGettersMap.hasChangesOptions();
        const hasChangesState = this._reasonGettersMap.hasChangesState();
        const hasChangesAttrs = this._reasonGettersMap.hasChangesAttrs();
        const hasChangesInternalOptions =
            this._reasonGettersMap.hasChangesInternalOptions();

        if (!this._mounted && hasChangesOptions) {
            this._optionsChangedDuringMount = true;
        }

        if (this._mounted && this._optionsChangedDuringMount) {
            this._optionsChangedDuringMount = false;

            return {
                needUpdate: true,
                canContinueExecute: true,
                isOptionsChanged: hasChangesOptions,
            };
        }

        if (
            !hasChangesState &&
            !hasChangesAttrs &&
            !hasChangesOptions &&
            !hasChangesInternalOptions
        ) {
            return {
                needUpdate: false,
                canContinueExecute: false,
                isOptionsChanged: hasChangesOptions,
            };
        }

        if (hasChangesState) {
            return {
                needUpdate: true,
                canContinueExecute: false,
                isOptionsChanged: hasChangesOptions,
            };
        }

        return {
            needUpdate: true,
            canContinueExecute: true,
            isOptionsChanged: hasChangesOptions,
        };
    }
}
