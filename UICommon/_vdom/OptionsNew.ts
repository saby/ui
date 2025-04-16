/**
 * Модуль, предоставляющий методы для определения изменившихся атрибутов, опций и internal выражений.
 */

import { Set } from 'Types/shim';
import { ObjectUtils, isDebug } from 'UICommon/Utils';
import { skipChangedOptions } from 'UICommon/Base';

import type {
    TExtended,
    IOptions,
    TInternalsCollection,
    TVersionsCollection,
} from './Types';

import {
    areBothNaN,
    isVersionable,
    isVersionableArray,
    isChildrenAsContent,
    shouldIgnoreChanging,
    shouldCheckDeep,
    shouldCheckVersions,
    shouldLazilyExit,
    installBlockOptionProperties,
    isBlockOption,
    getWS4ContentOptionInternals,
    isWS4ContentOption,
} from './Types';

const IS_DEBUG = isDebug();

const EMPTY_STRING = '';
const EMPTY_MAP = new Map();
const EMPTY_ARRAY: string[] = [];

function getObjectsKeys(a: object, b: object): string[] {
    const keys = new Set<string>(ObjectUtils.getKeysWithPrototypes(a));
    const secondKeys = ObjectUtils.getKeysWithPrototypes(b);

    for (let j = 0; j < secondKeys.length; ++j) {
        keys.add(secondKeys[j]);
    }

    return Array.from(keys);
}

function getMapKeys(a: TInternalsCollection, b: TInternalsCollection): number[] {
    return Array.from(new Set([...(a ?? EMPTY_MAP).keys(), ...(b ?? EMPTY_MAP).keys()]));
}

function isArrayChanged(
    nextArray: unknown[],
    prevArray: unknown[],
    versionsStorage: TVersionsCollection,
    isCompound: boolean = false,
    prefix: string = EMPTY_STRING
): boolean {
    if ((nextArray && !prevArray) || (!nextArray && prevArray)) {
        return true;
    }

    if (!nextArray && !prevArray) {
        return false;
    }

    if (nextArray.length !== prevArray.length) {
        return true;
    }

    for (let kfn = 0; kfn < nextArray.length; kfn++) {
        const localPrefix = prefix + ';' + kfn + ';';

        const hasChanges = getChangedOptionsPrivate(
            nextArray[kfn] as IOptions,
            prevArray[kfn] as IOptions,
            versionsStorage,
            EMPTY_ARRAY,
            false,
            isCompound,
            true,
            localPrefix
        );

        if (hasChanges) {
            return true;
        }
    }

    return false;
}

function isPossiblyScopeObjects(
    nextProperty: IOptions | TExtended,
    prevProperty: IOptions | TExtended
): boolean {
    return !!(
        typeof prevProperty === 'object' &&
        typeof nextProperty === 'object' &&
        nextProperty &&
        prevProperty &&
        // We don't need to check Date object internal properties
        !(nextProperty instanceof Date) &&
        !isVersionable(nextProperty)
    );
}

function isValueChanged(
    property: string | number,
    nextProperty: IOptions | TExtended,
    prevProperty: IOptions | TExtended,
    hasNextProperty: boolean,
    hasPrevProperty: boolean,
    versionsStorage: TVersionsCollection,
    ignoreDirtyChecking: boolean,
    isCompound: boolean,
    prefix: string,
    isDirtyCheckingProperty: boolean
): boolean {
    /**
     * Игнорируем переменные dirtyChecking для compoundControl
     * Эти переменные могут появиться только когда внутри VDom контрола
     * есть CompoundControl внутри которого в контентных опциях
     * есть контролы
     */
    if (ignoreDirtyChecking && isDirtyCheckingProperty) {
        return false;
    }

    const hasNext = hasNextProperty || nextProperty !== undefined;
    const hasPrev = hasPrevProperty || prevProperty !== undefined;

    if (hasPrev && hasNext /** Update */) {
        if (areBothNaN(prevProperty, nextProperty)) {
            return false;
        }

        /**
         * All objects in control's options are compared only by reference
         * (and version if it is supported). CompoundControl monitors
         * changes inside objects and/or arrays by itself
         */
        if (nextProperty === prevProperty) {
            if (isVersionable(nextProperty)) {
                const nextVersion = nextProperty.getVersion();

                if (versionsStorage.get(prefix + property) !== nextVersion) {
                    return true;
                }
            }

            if (isVersionableArray(nextProperty)) {
                const nextVersion = nextProperty.getArrayVersion();
                const prevVersion = versionsStorage.get(prefix + property);

                // возможно ситуация, когда на контентную опцию навешивается версионирование
                // это связано с тем, что контентная опция является массивом
                // но т.к. версионирование вешается снизу, то при поверке получаем ситуацию undefined !== 0
                // из-за этого вызываются лишние перерисовки, для этого сделана жесткая проверка
                if (prevVersion !== undefined && prevVersion !== nextVersion) {
                    return true;
                }
            }

            if (nextProperty && isChildrenAsContent(nextProperty)) {
                // На этом уровне не определить, нужно ли перерисовывать такой контент. Тут нет internal.
                // Поэтому тут перерисуем. Если что, перерисовку остановит сам ChildrenAsContent.
                return true;
            }

            return false;
        }

        if (shouldIgnoreChanging(nextProperty)) {
            return false;
        }

        if (!prevProperty) {
            return true;
        }

        if (property === 'validators') {
            // костыль - у валидаторов почему-то функции равны по ссылке,
            // вероятно они при бинде пишутся в старые опции
            return true;
        }

        if (isWS4ContentOption(prevProperty) && isWS4ContentOption(nextProperty)) {
            const nextInternals = getWS4ContentOptionInternals(nextProperty);
            const prevInternals = getWS4ContentOptionInternals(prevProperty);

            return !!getChangedInternalsPrivate(
                nextInternals,
                prevInternals,
                versionsStorage,
                false,
                isCompound,
                true,
                `${prefix}${property};`
            );
        }

        if (Array.isArray(nextProperty)) {
            if (isBlockOption(nextProperty)) {
                return isArrayChanged(
                    nextProperty,
                    prevProperty as unknown[],
                    versionsStorage,
                    isCompound,
                    prefix + property
                );
            }

            return true;
        }

        if (isVersionable(nextProperty) && shouldCheckVersions(nextProperty)) {
            // Есть такой кейс, когда объекты всегда новые, но они равны
            // поставим флажок в объект, который заставит нас смотреть только на версию
            const nextVersion = nextProperty.getVersion();

            return versionsStorage.get(prefix + property) !== nextVersion;
        }

        if (isDirtyCheckingProperty && isPossiblyScopeObjects(nextProperty, prevProperty)) {
            // Object inside __dirtyChecking must be checked, it can be "scope=object" in subcontrol
            return !!getChangedOptionsPrivate(
                nextProperty as IOptions,
                prevProperty as IOptions,
                versionsStorage,
                EMPTY_ARRAY,
                false,
                isCompound,
                true,
                EMPTY_STRING
            );
        }

        if (shouldCheckDeep(nextProperty) && shouldCheckDeep(prevProperty)) {
            return !!getChangedOptionsPrivate(
                nextProperty as IOptions,
                prevProperty as IOptions,
                EMPTY_MAP,
                EMPTY_ARRAY,
                true,
                isCompound,
                true,
                EMPTY_STRING
            );
        }

        if (isBlockOption(nextProperty)) {
            return !!getChangedOptionsPrivate(
                nextProperty as IOptions,
                prevProperty as IOptions,
                EMPTY_MAP,
                EMPTY_ARRAY,
                true,
                isCompound,
                true,
                EMPTY_STRING
            );
        }

        return true;
    }

    if (!hasPrev && hasNext /** Insertion */) {
        // Для compound control мы не должны отслеживать добавление/удаление опций, потому что
        // для измененных свойств происходит установка новых значений с помощью методов set{$propName}
        // или _setOption, и это свойство должно существовать.
        return (hasNextProperty && !hasPrevProperty && !isCompound) || isDirtyCheckingProperty;
    }

    if (hasPrev && !hasNext /** Removal */) {
        return !shouldIgnoreChanging(nextProperty);
    }

    return false;
}

function getChangedInternalsPrivate(
    next: TInternalsCollection,
    prev: TInternalsCollection,
    versions?: TVersionsCollection,
    ignoreDirtyChecking: boolean = false,
    isCompound: boolean = false,
    isOptimizationEnabled: boolean = false,
    prefix: string = EMPTY_STRING
): TInternalsCollection | boolean {
    // В случае, если при вычислении internal выражений какое-либо из выражений невозможно было вычислить
    // по причине того, что это выражение вычислялось не в том контексте, то необходимо продолжить обновление
    // и вычислить internal-выражения в нужном контексте
    if (shouldLazilyExit(next)) {
        return true;
    }

    /**
     * Игнорируем переменные dirtyChecking для compoundControl
     * Эти переменные могут появиться только когда внутри VDom контрола
     * есть CompoundControl внутри которого в контентных опциях
     * есть контролы
     */
    if (ignoreDirtyChecking) {
        return false;
    }

    const vVersions: TVersionsCollection = versions ?? EMPTY_MAP;

    const changes: TInternalsCollection = new Map<number, TExtended | IOptions>();
    let hasChanges = false;

    const properties = getMapKeys(next, prev);
    for (let i = 0; i < properties.length; ++i) {
        const property = properties[i];

        const nextProperty = next.get(property);
        const prevProperty = prev.get(property);

        const hasNextProperty = next.has(property);
        const hasPrevProperty = prev.has(property);

        const isChangedProperty = isValueChanged(
            property,
            nextProperty,
            prevProperty,
            hasNextProperty,
            hasPrevProperty,
            vVersions,
            ignoreDirtyChecking,
            isCompound,
            prefix,
            true
        );

        if (isChangedProperty) {
            if (isOptimizationEnabled) {
                return true;
            }

            hasChanges = true;
            changes.set(property, nextProperty);
        }
    }

    return hasChanges ? changes : false;
}

function getChangedOptionsPrivate(
    next: IOptions,
    prev: IOptions,
    versions: TVersionsCollection,
    blockOptionNames: string[],
    ignoreDirtyChecking: boolean,
    isCompound: boolean,
    isOptimizationEnabled: boolean,
    prefix: string
): IOptions | boolean {
    const vVersions: TVersionsCollection = versions ?? EMPTY_MAP;
    const vBlockOptionNames: string[] = blockOptionNames ?? EMPTY_ARRAY;

    const changes: IOptions = {};
    let hasChanges = false;

    installBlockOptionProperties(next, vBlockOptionNames);

    const properties = getObjectsKeys(next, prev);
    for (let i = 0; i < properties.length; ++i) {
        const property = properties[i];

        if (skipChangedOptions.has(property)) {
            continue;
        }

        const nextProperty = next[property];
        const prevProperty = prev[property];

        const hasNextProperty = next.hasOwnProperty(property);
        const hasPrevProperty = prev.hasOwnProperty(property);

        const isChangedProperty = isValueChanged(
            property,
            nextProperty,
            prevProperty,
            hasNextProperty,
            hasPrevProperty,
            vVersions,
            ignoreDirtyChecking,
            isCompound,
            prefix,
            false
        );

        if (isChangedProperty) {
            if (isOptimizationEnabled) {
                return true;
            }

            hasChanges = true;
            changes[property] = nextProperty;
        }
    }

    return hasChanges ? changes : false;
}

export function getChangedInternals(
    next: TInternalsCollection,
    prev: TInternalsCollection,
    versions: TVersionsCollection = EMPTY_MAP,
    ignoreDirtyChecking: boolean = false,
    isCompound: boolean = false,
    isOptimizationEnabled: boolean = false
): TInternalsCollection | boolean {
    if ((!next && prev) || (next && !prev) || (!next && !prev)) {
        return false;
    }

    if (!(next instanceof Map) || !(prev instanceof Map)) {
        // FIXME: сюда может прийти объект из старой кодогенерации -- html.tmpl шаблон. Будет доработано по задаче:
        //  https://online.sbis.ru/opendoc.html?guid=fc2b5dd4-0411-4ce4-b380-936bd63160fa&client=3
        return true;
    }

    // Управляем оптимизацией только для unit-тестов. В остальном оптимизация использутся всегда.
    return getChangedInternalsPrivate(
        next,
        prev,
        versions,
        ignoreDirtyChecking,
        isCompound,
        isOptimizationEnabled,
        EMPTY_STRING
    );
}

export function getChangedOptions(
    next: IOptions,
    prev: IOptions,
    versions: TVersionsCollection = EMPTY_MAP,
    blockOptionNames: string[] = EMPTY_ARRAY,
    ignoreDirtyChecking: boolean = false,
    isCompound: boolean = false,
    isOptimizationEnabled: boolean = false
): IOptions | boolean {
    if ((!next && prev) || (next && !prev) || (!next && !prev)) {
        return false;
    }

    // Управляем оптимизацией только для own properties, все остальное, более глубокое, вычислять лениво.
    return getChangedOptionsPrivate(
        next,
        prev,
        versions,
        blockOptionNames,
        ignoreDirtyChecking,
        isCompound,
        !IS_DEBUG && isOptimizationEnabled,
        EMPTY_STRING
    );
}
