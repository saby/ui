/**
 */

import { FunctionUtils } from 'UICommon/Utils';
import { constants } from 'Env/Env';
import { plainMerge } from './Common';
import * as Scope from '../_Expressions/Scope';

/**
 * todo: describe method
 * @param parent
 * @param obj
 * @param currentPropertyName
 * @param data
 * @param attrs
 */
function isParentEnabled(
    parent: any,
    obj: any,
    currentPropertyName: any,
    data: any,
    attrs: any
): boolean {
    // По умолчанию считаем enabled true
    const defaultValue = true;
    if (!constants.compat) {
        return defaultValue;
    }
    if (parent) {
        // Если известен родитель, узнаем, enabled ли он
        return !parent.isEnabled || parent.isEnabled();
    }
    if (!data) {
        return defaultValue;
    }
    if (currentPropertyName && data[currentPropertyName]) {
        // Если текущий компонент находится внутри контентной опции, проверяем, был ли задан
        // enabled или parentEnabled для нее
        if (data[currentPropertyName].enabled !== undefined) {
            return data[currentPropertyName].enabled;
        }
        if (data[currentPropertyName].parentEnabled !== undefined) {
            return data[currentPropertyName].parentEnabled;
        }
        if (attrs && attrs.internal && attrs.internal.hasOwnProperty('parentEnabled')) {
            return attrs.internal.parentEnabled;
        }
        return defaultValue;
    }
    // Если мы не внутри контентной опции, смотрим на значение enabled в scope
    if (data.enabled !== undefined) {
        return data.enabled;
    }
    if (data.parentEnabled !== undefined) {
        return data.parentEnabled;
    }
    if (attrs && attrs.internal && attrs.internal.hasOwnProperty('parentEnabled')) {
        return attrs.internal.parentEnabled;
    }
    return defaultValue;
}

/**
 * todo: describe method
 * @param obj
 * @param currentPropertyName
 * @param data
 */
export function calcParent(obj: any, currentPropertyName: any, data: any): any {
    if (obj === globalThis) {
        return undefined;
    }
    if (obj && obj.viewController !== undefined) {
        return obj.viewController;
    }
    return obj;
}

const reactMergeRegExpStr = `^${[
    'data(-\\w+)+',
    'forwardedRef',
    'className',
    '\\$wasabyRef',
    'children',
].join('$|^')}$`;
const wasabyMergeRegExpStr = '^on:|^content$|^name$';
const mergeRegExp = new RegExp(`(${reactMergeRegExpStr}|${wasabyMergeRegExpStr})`, 'gi');

function getInsertedData(templateCfg: any): any {
    let insertedData;

    if (templateCfg.data && templateCfg.data[Scope.ISOLATED_SCOPE_FLAG]) {
        // на нужно пропатчить все области видимости для шаблонов, которые генерируется
        // во время создания конфига для контрола
        insertedData = templateCfg.data[templateCfg.data[Scope.ISOLATED_SCOPE_FLAG]];
    }
    return insertedData;
}
function preventMergeOptions(data: any): boolean {
    return data?._preventMergeOptions;
}

export function addContentOptionScope(data: any, templateCfg: any): any {
    // если есть контентные данные, мы должны добавить их к существующим данным
    const insertedData = getInsertedData(templateCfg);

    // todo временный костыль только для грида, решение !preventMergeOptions(insertedData) не помогает
    //  потому что эта опция из-за scope=options летит дальше и там дальше что-то отменяет что не требовалось
    //  подробнее где это знает Алексей Авраменко, костыль сейчас для него только
    if (
        templateCfg.pName === 'contentTemplate' &&
        !data.editorTemplate &&
        templateCfg.viewController &&
        (templateCfg.viewController._moduleName === 'Controls/grid:GridControl' ||
            (templateCfg.viewController._logicParent?._moduleName === 'Controls/grid:GridControl' &&
                templateCfg.viewController._logicParent?._isReactView))
    ) {
        return data;
    }

    if (insertedData && !preventMergeOptions(data)) {
        // если в шаблон, в котором в корне лежит контрол, передали scope="{{ ... }}", в котором лежат
        // все опции старого контрола, тогда их не нужно пропускать, потому что все опции контрола переданного
        // через ... будут инициализировать контрол, который лежит внутри такого шаблона
        if (
            !insertedData.hasOwnProperty('parent') &&
            (!insertedData.hasOwnProperty('element') ||
                !insertedData.element ||
                insertedData.element.length === 0)
        ) {
            data = FunctionUtils.merge(data, insertedData, {
                rec: !(templateCfg.viewController && templateCfg.viewController._template),

                // для vdomных детей не клонируем объекты внутрь.
                // копируем без замены свойств, потому что например может прилететь свойство content, которое
                // перетрет указанное.
                // Так например падает тест test_04_panel_move_record, при попытке перемещения записи не строится дерево,
                // потмоу что прилетает content = '' и перетирает заданный content в шаблоне
                preferSource: true,

                // проигнорируем events потому что они летят через атрибуты на дом элементы
                // и content, потому что content в каждой функции должен быть свой
                ignoreRegExp: mergeRegExp,
            });
        }
    }
    return data;
}
/**
 * Метод вычисления опций из скопа с учетом mergeType и колбэк-пропов событий из react-контролов
 * Стандартный метод addContentOptionScope учитывает только особенности событий wasaby
 * с переходом на react надо так же учитывать что могут передать проп onEvent, который не надо прокидывать в скопе
 * @param data
 * @param templateCfg
 * @param generatorConfig
 */
export function clearedContentOptionScope(data: any, templateCfg: any): any {
    const resolvedOptions = addContentOptionScope(data, templateCfg);
    if (!templateCfg?.attr?.events) {
        return resolvedOptions;
    }
    for (const optionName of Object.keys(resolvedOptions)) {
        if (
            templateCfg.mergeType === 'attribute' ||
            templateCfg.isRootTag ||
            !/(^on[A-Z]+$)/gi.test(optionName)
        ) {
            continue;
        }
        const oldEventName = 'on:' + optionName.slice(2).toLowerCase();
        if (templateCfg.attr.events[oldEventName]) {
            delete resolvedOptions[optionName];
            continue;
        }
    }
    return resolvedOptions;
}

/**
 * todo: describe method
 * @param data
 * @param templateCfg
 * @param attrs
 */
export function resolveControlCfg(data: any, templateCfg: any, attrs: any): any {
    const internal = templateCfg.internal || {};
    data = Scope.calculateScope(data, plainMerge);
    data = addContentOptionScope(data, templateCfg);

    // вычисляем служебные опции для контрола - его физического и логического родителей,
    // видимость и активированность родителя
    internal.logicParent = templateCfg.viewController;

    if (constants.compat) {
        let enabledFromContent;

        const insertedData = getInsertedData(data);
        if (insertedData) {
            // Здесь не нужно прокидывать опции в старые контролы, поэтому будем прокидывать только для контента
            if (templateCfg.data[Scope.ISOLATED_SCOPE_FLAG] !== 'content') {
                delete insertedData.enabled;
            }
            if (insertedData.hasOwnProperty('enabled')) {
                enabledFromContent = insertedData.enabled;
            }
        }

        internal.parent = calcParent(templateCfg.ctx, templateCfg.pName, templateCfg.data);
        internal.parentEnabled =
            (enabledFromContent === undefined ? true : enabledFromContent) &&
            isParentEnabled(
                internal.parent,
                templateCfg.ctx,
                templateCfg.pName,
                templateCfg.data,
                attrs
            );
    }
    internal.hasOldParent = attrs && attrs.internal && attrs.internal.isOldControl;

    // user - прикладные опции, internal - служебные
    return {
        user: data,
        internal,
    };
}
