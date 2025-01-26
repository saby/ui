/* eslint-disable */
// @ts-nocheck

/**
 */

// @ts-ignore
import { constants, cookie } from 'Env/Env';

import { IControl } from 'UICommon/interfaces';
import { IGeneratorNameObject, ITplFunction } from '../_Markup/IGeneratorType';
import * as Attr from '../_Expressions/Attr';
import { TemplateFunction } from 'UICommon/Base';
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
// import { Logger } from 'UICommon/Utils';

var requireIfDefined = function requireIfDefined(tpl) {
        try {
            const loaded = ModulesLoader.loadSync(tpl);
            if (loaded) {
                return loaded;
            }
        } catch (err) {
            // Logger.error(`Couldn't load module "${tpl}"`, err);
        }
        return null;
    },
    /**
     * Стандартный резолвер для имен, которые передают в partial.
     * @param tpl
     * @param includedTemplates
     * @param _deps
     * @returns {*}
     */
    checkExistingModule = function checkExistingModule(tpl, includedTemplates, _deps) {
        return (
            (includedTemplates && includedTemplates[tpl]) ||
            (_deps && (_deps[tpl] || _deps['optional!' + tpl])) ||
            requireIfDefined(tpl)
        );
    },
    moduleNameCheckProceed = function maxNameLengthCheck(tpl, includedTemplates, _deps) {
        return checkExistingModule(tpl, includedTemplates, _deps);
    },
    conventionalStringResolver = function conventionalStringResolver(
        tpl,
        includedTemplates?,
        _deps?
    ) {
        if (tpl && tpl.length) {
            return moduleNameCheckProceed(tpl, includedTemplates, _deps);
        }
    };

export function isString(string: any): string is string {
    return Object.prototype.toString.call(string) === '[object String]';
}

export function isArray(array: any): array is Array<any> {
    return Object.prototype.toString.call(array) === '[object Array]';
}

const tagsToReplace = {
    '<': '&lt;',
    '>': '&gt;',
    "'": '&apos;',
    '"': '&quot;',
    '{{': '&lcub;&lcub;',
    '}}': '&rcub;&rcub;',
};
const ampRegExp = /&/g;
const otherEscapeRegExp = /({{)|(}})|([<>'"])/g;

export function escape(entity) {
    if (isString(entity)) {
        entity = entity.replace(ampRegExp, function escapeReplace(match, offset, str) {
            if (str[offset + 1] === '#') {
                return match;
            }
            return '&amp;';
        });

        return entity.replace(otherEscapeRegExp, function escapeReplace(tag) {
            return tagsToReplace[tag] || tag;
        });
    }
    return entity;
}

// умеет конвертировать не только ansii символы, но и unicode
function fixedFromCharCode(codePt) {
    //Код может быть в 16тиричной форме
    if (codePt && codePt.indexOf) {
        if (codePt.indexOf('x') === 0) {
            var trueCode = codePt.split('x')[1];
            codePt = parseInt(trueCode, 16);
        }
    }
    if (codePt > 0xffff) {
        codePt -= 0x10000;
        return String.fromCharCode(0xd800 + (codePt >> 10), 0xdc00 + (codePt & 0x3ff));
    } else {
        return String.fromCharCode(codePt);
    }
}

var unicodeRegExp = /&#(\w*);?/g;

export function unescapeASCII(str: any): any {
    if (typeof str !== 'string') {
        return str;
    }
    return str.replace(unicodeRegExp, (_, entity) => fixedFromCharCode(entity));
}

const unescapeRegExp = /&(nbsp|amp|quot|apos|lt|gt);/g;
const unescapeDict = {
    nbsp: String.fromCharCode(160),
    amp: '&',
    quot: '"',
    apos: "'",
    lt: '<',
    gt: '>',
};

export function unescape(str: any): any {
    if (typeof str !== 'string') {
        return str;
    }
    return unescapeASCII(str).replace(unescapeRegExp, (_, entity: string) => unescapeDict[entity]);
}

const tagsToParenthesisReplace = {
    '{{': '&lcub;&lcub;',
    '}}': '&rcub;&rcub;',
};
const regExpToParenthesisReplace = /({{)|(}})/g;

// Для того чтобы при прогоне второй раз в dot, все конструкции эскейпились
export function escapeParenthesis(entity) {
    if (isString(entity)) {
        return entity.replace(regExpToParenthesisReplace, function escapeReplace(tag) {
            return tagsToParenthesisReplace[tag] || tag;
        });
    }
    return entity;
}

/**
 * Для поиска резолвера имен в конфине, если он есть.
 * @param name
 * @param resolvers
 * @returns {*}
 */
export function hasResolver(name, resolvers) {
    for (var resolver in resolvers) {
        if (resolvers.hasOwnProperty(resolver)) {
            return name.indexOf(resolver) === 0 ? resolver : undefined;
        }
    }
}

/**
 * Для использования найденного резолвера имен для partial
 * @param name
 * @param resolvers
 * @returns {*}
 */
export function findResolverInConfig(name, resolvers) {
    var resolverName = hasResolver(name, resolvers);
    if (resolverName) {
        return resolvers[resolverName];
    }
}

export function plainMerge(inner, object, cloneFirst?) {
    var copyInner = {},
        prop;
    if (typeof inner !== 'object' && typeof inner !== 'function') {
        inner = {};
    }
    if (!object) {
        object = {};
    }

    if (cloneFirst) {
        for (prop in inner) {
            if (inner.hasOwnProperty(prop)) {
                copyInner[prop] = inner[prop];
            }
        }
    } else {
        copyInner = inner;
    }

    for (prop in object) {
        if (object.hasOwnProperty(prop)) {
            copyInner[prop] = object[prop];
        }
    }

    return copyInner;
}

export function plainMergeAttr(inner, object) {
    if (!inner) {
        inner = {};
    }
    if (!object) {
        object = {};
    }

    /*
     * Атрибуты из шаблона не нужны в VDom контролах
     * */
    if (
        object.attributes &&
        Object.keys(object.attributes).length === 2 &&
        object.attributes['name'] === object.attributes['sbisname'] &&
        object.attributes['sbisname'] !== undefined
    ) {
        object = {};
    }

    var controlKey;
    if (object.attributes && object.attributes['key']) {
        controlKey = object.attributes['key'];
    }
    controlKey = controlKey || object.key || inner.key;

    const res = {
        inheritOptions: object.inheritOptions,
        context: inner.context,
        internal: inner.internal,
        systemOptions: {},
        domNodeProps: {},
        key: controlKey,
        attributes: Attr.processMergeAttributes(inner.attributes, object.attributes),
        events: Attr.mergeEvents(inner.events, object.events),
        // прокинем родителя, в случае инлайн шаблонов родитель прокидываем сверху
        _physicParent: inner._physicParent,
        _isRootElement: inner._isRootElement,
        isContainerNodeInline: inner.isContainerNodeInline,
    };
    // прокидываем refForContainer глубже только если строится инлайн шаблон и он в корне
    if (inner._isRootElement || inner.isContainerNodeInline) {
        res.refForContainer = inner.refForContainer;
    }
    return res;
}

export function plainMergeContext(inner, object) {
    if (!inner) {
        inner = {};
    }
    if (!object) {
        object = {};
    }
    var controlKey;
    if (object.attributes && object.attributes['key']) {
        controlKey = object.attributes['key'];
    }
    controlKey = controlKey || object.key || inner.key;

    return {
        attributes: object.attributes || {},
        events: object.events || {},
        inheritOptions: inner.inheritOptions,
        internal: inner.internal,
        context: inner.context,
        key: controlKey,
        // прокинем родителя, в случае инлайн шаблонов родитель прокидываем сверху
        _physicParent: inner._physicParent,
        _$templateId: inner._$templateId,
        // todo это надо? и если да то почему только это
        isContainerNodeInline: inner.isContainerNodeInline,
    };
}

export function isTemplateString(str) {
    return (
        str.indexOf('wml!') === 0 ||
        str.indexOf('tmpl!') === 0 ||
        str.indexOf('html!') === 0 ||
        str.indexOf('optional!tmpl!') === 0
    );
}

export function isControlString(str) {
    return str.indexOf('js!') === 0;
}

export function isOptionalString<T = unknown>(tplOrigin: T) {
    return typeof tplOrigin === 'string' && tplOrigin.indexOf('optional!') === 0;
}

export function isLibraryModuleString(str: string): boolean {
    // library module string example: SomeStorage.Library:Module
    var name = str.indexOf('ws:') === 0 ? str.replace('ws:', '') : str;
    return (
        /(([-_a-zA-Z0-9]+)[./]([-_a-zA-Z0-9]+)[:]([-_a-zA-Z]+))/.test(name) &&
        name.indexOf(' ') === -1
    );
}

// для обработки контролов без js, через partial
export function isSlashedControl(str) {
    return (
        str.split('/').length > 1 &&
        !isTemplateString(str) &&
        str.indexOf('<') === -1 &&
        str.indexOf(' ') === -1
    );
}

export function isStringModules(str, config?) {
    return (
        isOptionalString(str) ||
        isTemplateString(str) ||
        isControlString(str) ||
        isSlashedControl(str) ||
        hasResolver(str, config && config.resolvers)
    );
}

export function isControlClass<T = IControl>(controlClass: any): controlClass is T {
    const prototype = controlClass && controlClass.prototype;
    // Проверка на typeof добавлена в следствии странной ошибки https://inside.tensor.ru/opendoc.html?guid=872a7e36-7487-4362-88d0-eaf0e66cb6b6
    // По какой-то причине проверка controlClass && controlClass.prototype проходила и свойство $constructor вызывалось на undefined.
    if (prototype && typeof prototype !== 'undefined') {
        return prototype.$constructor || prototype._template || controlClass.isWasaby;
    }
    return false;
}

export interface ITemplateArray<K = TemplateFunction> extends Array<K> {
    isDataArray: boolean;
    array: K[];
}

const templateFunctionLength = 7;
export function isTemplateFunction<K = TemplateFunction>(
    templateFunction: any
): templateFunction is K {
    return (
        (typeof templateFunction === 'function' &&
            templateFunction.length === templateFunctionLength) ||
        templateFunction?.isWasabyTemplate === true ||
        templateFunction?.isWasabyTemplate === false
    );
}

export function isTemplateClass<K = TemplateFunction>(controlClass: any): controlClass is K {
    const prototype = controlClass && controlClass.prototype;
    if (prototype && typeof prototype !== 'undefined') {
        return (
            prototype.isWasabyTemplate === true ||
            prototype.isWasabyTemplate === false ||
            controlClass.isWasabyTemplate === true ||
            controlClass.isWasabyTemplate === false
        );
    }
    return false;
}
export function isTemplateArray<K = TemplateFunction>(array: any): array is ITemplateArray<K> {
    return (
        Array.isArray(array) &&
        array.hasOwnProperty('isDataArray') &&
        (array as ITemplateArray<K>).isDataArray
    );
}

export function isControl(control) {
    return control && control.constructor && isControlClass(control.constructor);
}

export function isLibraryModule(cfg: any): cfg is IGeneratorNameObject {
    return cfg && cfg.library && cfg.module;
}

export function splitModule(string: string): IGeneratorNameObject {
    var fullName = string.indexOf('ws:') === 0 ? string.replace('ws:', '') : string,
        librarySplit = fullName.split(':', 2),
        libraryName = librarySplit[0],
        moduleName = librarySplit[1] && librarySplit[1].replace(/\//g, '.'),
        modulePath = moduleName.split('.');

    return {
        library: libraryName,
        module: modulePath,
        fullName: `${libraryName}:${moduleName}`,
    };
}

export function isTplFunction(tpl: unknown): tpl is ITplFunction<TemplateFunction> {
    return tpl && tpl.hasOwnProperty('func');
}
export function splitOptional(string) {
    var ws;
    ws = string.split('optional!');
    return ws[1];
}

export function splitWs(string: string): string {
    let ws;
    if (string !== undefined && string.indexOf('ws:') === 0) {
        ws = string.split('ws:');
        return ws[1];
    }
    return string;
}

export function isCompound(ctor) {
    //CompoundControl на прототипе не имеет $constructor, и контролы, унаследовавшиеся от него и не переопределившие
    //$constructor не пройдут эту проверку. Поэтому добавлено поле _isCoreCompound.
    return (
        (ctor.prototype.$constructor && !ctor.prototype._template) ||
        ctor.prototype._dotTplFn ||
        ctor.prototype._isCoreCompound
    );
}

export function isNewControl(ctor) {
    return !isCompound(ctor);
}

/**
 * Объект с зависимостями контрола/шаблона.
 */
export type Deps<T = IControl, K = TemplateFunction> = Record<string, T | K | IDefaultExport<T>>;

export type IncludedTemplates<K = TemplateFunction> = Record<string, K>;
/**
 * Если результат с optional === false, попробуем без optional!
 * @param tpl
 * @param includedTemplates
 * @param _deps
 * @returns {*}
 */
export function depsTemplateResolver<T = IControl, K = TemplateFunction>(
    tpl: string,
    includedTemplates: IncludedTemplates<K>,
    _deps: Deps<T, K>
): T | K | IDefaultExport<T> {
    const newName = splitWs(tpl);
    var result = conventionalStringResolver(newName, includedTemplates, _deps);
    if (isOptionalString(newName) && !result) {
        result = conventionalStringResolver(splitOptional(newName));
    }
    if (isDefaultExport(result)) {
        result = result.default;
    }
    return result;
}

export interface IDefaultExport<T = IControl> {
    __esModule: boolean;
    default: T;
}

// Баг в TS, нельзя так описать: https://github.com/microsoft/TypeScript/issues/40497
// type TModRet<T> = T extends { default: infer TrueT } ? TrueT : T;
// type RetT<T, TrueT> = T extends TrueT ? false : true;
// export function isDefaultExport<T, TrueT extends TModRet<T>>(obj: T): RetT<T, TrueT>;

/**
 * Либо сужает тип obj до IDefaultExport, либо однозначно говорит, что это другой тип.
 * @param obj
 */
export function isDefaultExport(obj: unknown): boolean {
    if (obj && typeof obj === 'object') {
        return obj.hasOwnProperty('__esModule') && obj.hasOwnProperty('default');
    }
    return false;
}

const isServerSide = typeof window === 'undefined';

export function isCompat() {
    if (isServerSide && typeof process !== 'undefined') {
        // @ts-ignore
        return !process.domain || (process.domain.req && process.domain.req.compatible !== false);
    } else {
        return constants.compat;
    }
}

export function isAnonymousFn(fn) {
    return typeof fn === 'function' && fn.name === '';
}

let disableCompatCache;
export function disableCompat() {
    let disableCompat =
        (process && process.domain && process.domain.req && process.domain.req.disableCompat) ||
        disableCompatCache;
    if (typeof disableCompat === 'undefined') {
        disableCompat = cookie.get('disableCompat');
        if (isServerSide && typeof process !== 'undefined') {
            if (process && process.domain && process.domain.req) {
                process.domain.req.disableCompat = disableCompat;
            }
        } else {
            disableCompatCache = disableCompat;
        }
    }
    return typeof disableCompat !== 'undefined' && disableCompat === 'true';
}
