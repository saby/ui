import { Set } from 'Types/shim';
import { IVersionable } from 'Types/entity';
import { IControlOptions, skipChangedOptions } from 'UICommon/Base';
import { ObjectUtils } from 'UICommon/Utils';
import { cookie } from 'Env/Env';

export interface IVersionableArray {
    getArrayVersion?(): number;
    _arrayVersion?: number;
}

export interface IVersions {
    [property: string]: IVersions | number;
}

// TODO: Необходимо реализовать флаг, по которому будем определять этот интерфейс
//  Правка в кодогенерацию!
export interface ITemplate extends Object {
    func: Function;
    internal: IOptions;
}

// TODO: Необходимо реализовать флаг, по которому будем определять этот интерфейс
//  Правка в кодогенерацию!
export interface ITemplateArray extends Array<ITemplate> {
    isDataArray: boolean;
    array: ITemplate[];
}

// TODO: Необходимо реализовать флаг, по которому будем определять этот интерфейс
//  Правка в кодогенерацию!
export interface ITemplateObject extends ITemplate {
    isDataArray: boolean;
}

const isDebug = !!cookie.get('s3debug');
const EMPTY_STRING = '';
const EMPTY_OBJECT = {};
const DIRTY_CHECKING_PREFIX = '__dirtyCheckingVars_';
const IGNORE_CHANGING_FLAG = '_ignoreChanging';
const DEEP_CHECKING_FLAG = '_isDeepChecking';
const UNREACHABLE_GETTER_PATH_FLAG = '__UNREACHABLE_GETTER_PATH__';
// FIXME: Контролы. Костыль. Исправить.
const PREFER_VERSIONS_API_FLAG = '_preferVersionAPI';

export declare type TOptionValue =
    | IVersionable
    | IVersionableArray
    | ITemplateArray
    | ITemplateObject
    | Date
    | object
    | symbol
    | number
    | string
    | boolean
    | null
    | undefined;

export interface IManualObject extends Object {
    [property: string]: IManualObject | TOptionValue;
    [IGNORE_CHANGING_FLAG]?: boolean;
    [DEEP_CHECKING_FLAG]?: boolean;
}

export interface IOptions extends Object {
    [property: string]: IManualObject | TOptionValue;
}

export declare type TOptions = IOptions | IControlOptions;

function areBothNaN(a: number, b: number): boolean {
    return (
        typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b)
    );
}

function isDirtyChecking(property: string): boolean {
    return (
        typeof property === 'string' &&
        property.startsWith(DIRTY_CHECKING_PREFIX)
    );
}

function shouldIgnoreChanging(obj: IManualObject): boolean {
    return !!(obj && obj[IGNORE_CHANGING_FLAG]);
}

function shouldCheckDeep(obj: IManualObject): boolean {
    return !!(obj && obj[DEEP_CHECKING_FLAG]);
}

function isVersionable(obj: IVersionable): boolean {
    return !!(
        obj &&
        typeof obj === 'object' &&
        typeof obj.getVersion === 'function'
    );
}

function isVersionableArray(obj: IVersionableArray): boolean {
    return !!(
        obj &&
        Array.isArray(obj) &&
        typeof obj.getArrayVersion === 'function'
    );
}

function isTemplate(tmpl: ITemplate): boolean {
    return !!(
        tmpl &&
        typeof tmpl.hasOwnProperty === 'function' &&
        typeof tmpl.func === 'function' &&
        tmpl.hasOwnProperty('internal')
    );
}

function isTemplateArray(templateArray: ITemplateArray): boolean {
    const array = templateArray?.array;
    return (
        Array.isArray(array) &&
        array.every((tmpl) => {
            return isTemplate(tmpl);
        }) &&
        templateArray.isDataArray
    );
}

function isTemplateObject(tmpl: ITemplateObject): boolean {
    return isTemplate(tmpl) && tmpl.isDataArray;
}

function getTemplateInternal(tmpl: ITemplate): IOptions {
    return (tmpl && tmpl.internal) || EMPTY_OBJECT;
}

function hasUnreachableGetterPathFlag(obj: any): boolean {
    return !!(obj && obj[UNREACHABLE_GETTER_PATH_FLAG]);
}

function getInternalVersions(scope) {
    if (Object.isFrozen(scope)) {
        scope = { ...scope };
    }
    let innerVersions;
    if (scope._innerVersions) {
        innerVersions = scope._innerVersions;
    } else {
        innerVersions = collectObjectVersions(scope);
        Object.defineProperty(scope, '_innerVersions', {
            value: innerVersions,
            enumerable: false,
            configurable: false,
        });
    }
    return innerVersions;
}
export function collectObjectVersions(collection: TOptions): IVersions {
    const versions = {};
    if (typeof collection !== 'object' || collection === null) {
        return versions;
    }
    const keys = Object.keys(collection);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = collection[key];
        if (typeof value !== 'object') {
            continue;
        }
        if (isVersionable(value as IVersionable)) {
            versions[key] = (value as IVersionable).getVersion();
        } else if (isTemplateArray(value as ITemplateArray)) {
            const templateArray: ITemplateArray = (value.array ||
                value) as ITemplateArray;
            for (let idx = 0; idx < templateArray.length; ++idx) {
                const templateInternal = getTemplateInternal(
                    templateArray[idx]
                );
                const internalVersions = getInternalVersions(templateInternal);

                for (const innerKey in internalVersions) {
                    if (internalVersions.hasOwnProperty(innerKey)) {
                        versions[key + ';' + idx + ';' + innerKey] =
                            internalVersions[innerKey];
                    }
                }
            }
        } else if (isVersionableArray(value as IVersionableArray)) {
            versions[key] = (value as IVersionableArray).getArrayVersion();
        } else if (isTemplateObject(value as ITemplateObject)) {
            const templateObject: ITemplateObject = value as ITemplateObject;
            const templateInternal = getTemplateInternal(templateObject);
            const innerVersions = getInternalVersions(templateInternal);

            for (const innerKey in innerVersions) {
                if (innerVersions.hasOwnProperty(innerKey)) {
                    versions[key + ';;' + innerKey] = innerVersions[innerKey];
                }
            }
        } else if (isPossiblyScopeObject(key, value)) {
            const internalVersions = getInternalVersions(value);

            for (const innerKey in internalVersions) {
                if (internalVersions.hasOwnProperty(innerKey)) {
                    versions[innerKey] = internalVersions[innerKey];
                }
            }
        }
    }
    return versions;
}

// копия метода isPossiblyScopeObjects для одного поля
function isPossiblyScopeObject(property, value): boolean {
    return (
        isDirtyChecking(property) &&
        typeof value === 'object' &&
        value &&
        // у scope есть _$internal
        value._$internal &&
        // We don't need to check Date object internal properties
        !(value instanceof Date) &&
        !isVersionable(value)
    );
}

// TODO: Необходимо реализовать флаг, по которому будем определять scope-объекты.
//  Правка в кодогенерацию!
function isPossiblyScopeObjects(
    property: string,
    nextValue: TOptions,
    prevValue: TOptions
): boolean {
    return (
        isDirtyChecking(property) &&
        typeof prevValue === 'object' &&
        typeof nextValue === 'object' &&
        nextValue &&
        prevValue &&
        // We don't need to check Date object internal properties
        !(nextValue instanceof Date) &&
        !isVersionable(nextValue as unknown as IVersionable)
    );
}

function isTemplateArrayChanged(
    next: ITemplateArray,
    prev: ITemplateArray,
    versionsStorage: object = EMPTY_OBJECT,
    prefix: string = EMPTY_STRING,
    isCompound: boolean = false
): boolean {
    if ((next && !prev) || (!next && prev)) {
        return true;
    }
    if (!next && !prev) {
        return false;
    }
    if (next.length !== prev.length) {
        return true;
    }
    for (let kfn = 0; kfn < next.length; kfn++) {
        const localPrefix = prefix + ';' + kfn + ';';
        const ch = getChangedOptions(
            getTemplateInternal(next[kfn]),
            getTemplateInternal(prev[kfn]),
            false,
            versionsStorage,
            undefined,
            localPrefix,
            isCompound
        );
        if (ch) {
            return true;
        }
    }
    return false;
}
function isArrayChanged(
    next: unknown[],
    prev: unknown[],
    versionsStorage: object = EMPTY_OBJECT,
    prefix: string = EMPTY_STRING,
    isCompound: boolean = false
): boolean {
    if ((next && !prev) || (!next && prev)) {
        return true;
    }
    if (!next && !prev) {
        return false;
    }
    if (next.length !== prev.length) {
        return true;
    }
    for (let i = 0; i < next.length; i++) {
        const localPrefix = prefix + ';' + i + ';';
        const ch = getChangedOptions(
            next[i],
            prev[i],
            false,
            versionsStorage,
            undefined,
            localPrefix,
            isCompound
        );
        if (ch) {
            return true;
        }
    }
    return false;
}

function isTemplateObjectChanged(
    next: ITemplateObject,
    prev: ITemplateObject,
    versionsStorage: object = EMPTY_OBJECT,
    prefix: string = EMPTY_STRING,
    isCompound: boolean = false
): boolean {
    const localPrefix = prefix + ';' + ';';
    const ch = getChangedOptions(
        getTemplateInternal(next),
        getTemplateInternal(prev),
        false,
        versionsStorage,
        undefined,
        localPrefix,
        isCompound
    );
    return !!ch;
}

function getKeys(first: object, second: object): string[] {
    const keys = new Set<string>(ObjectUtils.getKeysWithPrototypes(first));
    const secondKeys = ObjectUtils.getKeysWithPrototypes(second);
    for (let j = 0; j < secondKeys.length; ++j) {
        keys.add(secondKeys[j]);
    }
    return Array.from(keys);
}

/**
 * Проверить, является ли некоторое значение контентной опцией.
 * @param value
 */
export function isContentOption(value: unknown): boolean {
    return (
        isTemplate(value as ITemplate) ||
        isTemplateObject(value as ITemplateObject) ||
        isTemplateArray(value as ITemplateArray)
    );
}

export function getChangedOptions(
    next: TOptions = EMPTY_OBJECT,
    prev: TOptions = EMPTY_OBJECT,
    ignoreDirtyChecking: boolean = false,
    versionsStorage: object = EMPTY_OBJECT,
    _: boolean = true,
    prefix: string = EMPTY_STRING,
    isCompound: boolean = false,
    blockOptionNames: string[] = [],
    isOptimizationEnabled: Boolean = false
): TOptions | Boolean {
    // В случае, если при вычислении internal выражений какое-либо из выражений невозможно было вычислить
    // по причине того, что это выражение вычислялось не в том контексте, то необходимо продолжить обновление
    // и вычислить internal-выражения в нужном контексте
    if (hasUnreachableGetterPathFlag(next)) {
        return { ...next };
    }

    for (const optionName of blockOptionNames) {
        if (typeof next[optionName] === 'object') {
            Object.defineProperty(next[optionName], '_$blockOption', {
                value: true,
                enumerable: false,
            });
        }
    }

    // TODO: ignoreDirtyChecking, isCompound вынести в битовый флаг
    // TODO: отказаться от префиксов в пользу древовидной структуры хранилища версий (сейчас словарь по сути)
    const properties = getKeys(next, prev);
    const changes = {};
    let hasChanges = false;
    let hasPrev;
    let hasNext;
    let isDirtyCheckingProperty;

    // если под дебагом, собираем измененные опции, если нет - можно сразу выходить из метода с результатом true
    // данная функция возвращает true, если можно выходить из метода сразу, иначе - false
    function markChanged(property, nextProperty) {
        if (isDebug || !isOptimizationEnabled) {
            hasChanges = true;
            changes[property] = nextProperty;
            return false;
        } else {
            return true;
        }
    }

    for (let i = 0; i < properties.length; ++i) {
        const property = properties[i];
        isDirtyCheckingProperty = isDirtyChecking(property);

        if (skipChangedOptions.has(property)) {
            continue;
        }

        const prevProperty = prev[property];
        const nextProperty = next[property];

        /**
         * Игнорируем переменные dirtyChecking для compoundControl
         * Эти переменные могут появиться только когда внутри VDom контрола
         * есть CompoundControl внутри которого в контентных опциях
         * есть контролы
         */
        if (ignoreDirtyChecking && isDirtyCheckingProperty) {
            continue;
        }
        // TODO: Сделать проверку изменения для контекстов
        //  https://online.sbis.ru/opendoc.html?guid=bb9a707f-b8fe-4b26-b2b3-874e060548c8
        hasPrev = prev.hasOwnProperty(property) || prevProperty !== undefined;
        hasNext = next.hasOwnProperty(property) || nextProperty !== undefined;

        if (hasPrev && hasNext /** Update */) {
            if (areBothNaN(prevProperty as number, nextProperty as number)) {
                continue;
            }
            /**
             * All objects in control's options are compared only by reference
             * (and version if it is supported). CompoundControl monitors
             * changes inside objects and/or arrays by itself
             */
            if (nextProperty === prevProperty) {
                if (
                    isVersionable(nextProperty as IVersionable) &&
                    versionsStorage
                ) {
                    const newVersion = (
                        nextProperty as IVersionable
                    ).getVersion();
                    if (versionsStorage[prefix + property] !== newVersion) {
                        if (markChanged(property, nextProperty)) {
                            return true;
                        }
                    }
                }
                if (
                    isVersionableArray(nextProperty as IVersionableArray) &&
                    versionsStorage
                ) {
                    const newVersion = (
                        nextProperty as IVersionableArray
                    ).getArrayVersion();
                    // возможно ситуация, когда на контентную опцию навешивается версионирование
                    // это связано с тем, что контентная опция является массивом
                    // но т.к. версионирование вешается снизу, то при поверке получаем ситуацию undefined !== 0
                    // из-за этого вызываются лишние перерисовки, для этого сделана жесткая проверка
                    if (
                        versionsStorage[prefix + property] !== undefined &&
                        versionsStorage[prefix + property] !== newVersion
                    ) {
                        if (markChanged(property, nextProperty)) {
                            return true;
                        }
                    }
                }
            } else {
                if (shouldIgnoreChanging(nextProperty as IManualObject)) {
                    continue;
                }
                if (!prevProperty) {
                    if (markChanged(property, nextProperty)) {
                        return true;
                    }
                    continue;
                }

                if (property === 'validators') {
                    // костыль - у валидаторов почему-то функции равны по ссылке,
                    // вероятно они при бинде пишутся в старые опции
                    if (markChanged(property, nextProperty)) {
                        return true;
                    }
                } else if (isTemplateArray(nextProperty as ITemplateArray)) {
                    if (
                        isTemplateArrayChanged(
                            (nextProperty?.array ||
                                nextProperty) as ITemplateArray,
                            (prevProperty?.array ||
                                prevProperty) as ITemplateArray,
                            versionsStorage,
                            prefix + property,
                            isCompound
                        )
                    ) {
                        if (markChanged(property, nextProperty)) {
                            return true;
                        }
                    }
                } else if (Array.isArray(nextProperty) && nextProperty) {
                    if (nextProperty?._$blockOption === true) {
                        if (
                            isArrayChanged(
                                nextProperty,
                                prevProperty,
                                versionsStorage,
                                prefix + property,
                                isCompound
                            )
                        ) {
                            if (markChanged(property, nextProperty)) {
                                return true;
                            }
                        }
                    } else {
                        if (markChanged(property, nextProperty)) {
                            return true;
                        }
                    }
                } else if (isTemplate(nextProperty as ITemplateObject)) {
                    // Inner template with internal options. We only need to check internal options
                    // cause function is bound and it can lead to useless redraws.
                    if (
                        isTemplateObjectChanged(
                            nextProperty as ITemplateObject,
                            prevProperty as ITemplateObject,
                            versionsStorage,
                            prefix + property,
                            isCompound
                        )
                    ) {
                        if (markChanged(property, nextProperty)) {
                            return true;
                        }
                    }
                } else if (
                    isVersionable(nextProperty as IVersionable) &&
                    nextProperty[PREFER_VERSIONS_API_FLAG]
                ) {
                    /*
                     * Есть такой кейс, когда объекты всегда новые, но они равны
                     * поставим флажок в объект, который заставит нас смотреть только на версию
                     * FIXME: исправить костыль
                     */
                    const newVersion = (
                        nextProperty as IVersionable
                    ).getVersion();
                    if (versionsStorage[prefix + property] !== newVersion) {
                        if (markChanged(property, nextProperty)) {
                            return true;
                        }
                    }
                } else if (
                    isPossiblyScopeObjects(property, nextProperty, prevProperty)
                ) {
                    // Object inside __dirtyChecking must be checked, it can be "scope=object" in subcontrol
                    const innerCh = getChangedOptions(
                        nextProperty,
                        prevProperty,
                        false,
                        versionsStorage,
                        true,
                        EMPTY_STRING,
                        isCompound
                    );
                    if (innerCh) {
                        if (markChanged(property, nextProperty)) {
                            return true;
                        }
                    }
                } else if (
                    shouldCheckDeep(nextProperty as IManualObject) &&
                    shouldCheckDeep(prevProperty as IManualObject)
                ) {
                    const innerCh = getChangedOptions(
                        nextProperty,
                        prevProperty,
                        true,
                        EMPTY_OBJECT,
                        true,
                        EMPTY_STRING,
                        isCompound
                    );
                    if (innerCh) {
                        if (markChanged(property, nextProperty)) {
                            return true;
                        }
                    }
                } else if (nextProperty?._$blockOption === true) {
                    const innerCh = getChangedOptions(
                        nextProperty,
                        prevProperty,
                        true,
                        EMPTY_OBJECT,
                        true,
                        EMPTY_STRING,
                        isCompound
                    );
                    if (innerCh) {
                        if (markChanged(property, nextProperty)) {
                            return true;
                        }
                    }
                } else {
                    if (markChanged(property, nextProperty)) {
                        return true;
                    }
                }
            }
        } else if (!hasPrev && hasNext /** Insertion */) {
            // Для compound control мы не должны отслеживать добавление/удаление опций, потому что
            // для измененных свойств происходит установка новых значений с помощью методов set{$propName}
            // или _setOption, и это свойство должно существовать.
            if (
                (next.hasOwnProperty(property) &&
                    !prev.hasOwnProperty(property) &&
                    !isCompound) ||
                isDirtyCheckingProperty
            ) {
                if (markChanged(property, nextProperty)) {
                    return true;
                }
            }
            // Такая же проверка должна быть на удаление старой опции. Но в таком случае ломаются юниты,
            // которые проверяют лишние перерисовки. Потому что в опциях иногда появляются служебные поля,
            // которые не надо добавлять в changedOptions.
            // Кейс описан в тесте "old option removed"
            // FIXME: раскомментить тест old option removed и поправить поведенине getChangedOptions
        } else if (hasPrev && !hasNext /** Removal */) {
            if (shouldIgnoreChanging(nextProperty as IManualObject)) {
                continue;
            }
            if (markChanged(property, nextProperty)) {
                return true;
            }
        }
    }
    return hasChanges ? changes : false;
}
