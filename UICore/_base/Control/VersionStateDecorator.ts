/**
 * @kaizen_zone cf0628a5-e0cb-4894-81b8-a7bba0fb4fce
 */
// https://stackoverflow.com/questions/57510388/define-prefix-for-object-keys-using-types-in-typescript
// Тип для строки, начинающегося с определённого префикса. TPrefix - префикс, TKey - остальная часть строки.
type TAddPrefix<TKey, TPrefix extends string> = TKey extends string ? `${TPrefix}${TKey}` : never;

// Важно не указывать тип для fieldNamePrefix, чтобы typeof fieldNamePrefix был значением строки.
// Пробел в конце - потому что это разделитель, который точно не будет в начале имени поля, в отличие от "_".
const fieldNamePrefix = '$this$ ';

const emptyName = '$unnamed$';

// Имя служебного стейта версии версионированных полей.
type TFieldName = TAddPrefix<string, typeof fieldNamePrefix>;

// Экспортируемый интерфейс стейта для использования в компоненте.
export interface IVersionState extends Record<TFieldName, number> {
    // Общая версия, которая меняется при изменении любого поля.
    commonVersion?: number;
}

/**
 * Класс для легкого стейта изменения сложных полей.
 * Сами поля лежат и меняются где угодно, в стейте только их версия по имени.
 * @private
 */

export class VersionStateDecorator {
    private changedFieldNames: TFieldName[] = [];

    constructor() {
        this.setStateUpdater = this.setStateUpdater.bind(this);
    }

    addChangedFieldName(changedFieldName: string): void {
        this.changedFieldNames.push(`${fieldNamePrefix}${changedFieldName || emptyName}`);
    }
    // Возможность чистить имена изменённых полей, если компонент обновился без вызова апдейтера.
    clearChangedFieldNames(): void {
        this.changedFieldNames = [];
    }

    // Передаётся как первый аргумент в setState компонента.
    setStateUpdater(state: IVersionState): IVersionState {
        const nextState: IVersionState = {
            commonVersion: (state.commonVersion || 0) + 1,
        };
        for (const changedFieldName of this.changedFieldNames) {
            nextState[changedFieldName] = (state[changedFieldName] || 0) + 1;
        }
        this.clearChangedFieldNames();
        return nextState;
    }
    // Для использования в shouldComponentUpdate.
    hasChangesState(nextState: IVersionState, state: IVersionState): boolean {
        return nextState.commonVersion !== state.commonVersion;
    }
}
