/**
 * @kaizen_zone a35eec2e-f16e-4783-9297-975d0fadc26b
 */
/* eslint-disable */
// @ts-nocheck
import {
    TAttributes,
    INodeAttribute,
    IGeneratorConfig,
    CommonUtils as Common,
} from 'UICommon/Executor';
import { Control } from 'UICore/Base';

interface IControlData {
    name?: unknown;
}

/**
 */

export function joinElements(elements: string[], key?, defCollection?): string {
    if (Array.isArray(elements)) {
        let res = '';
        for (let element of elements) {
            if (Array.isArray(element)) {
                element = joinElements(element);
            }
            res += element || '';
        }

        return res;
    } else {
        throw new Error('joinElements: elements is not array');
    }
}

export function resolveControlName<TOptions extends IControlData>(
    controlData: TOptions,
    attributes: TAttributes | INodeAttribute
): TAttributes | INodeAttribute {
    const attr = attributes || {};
    if (controlData && controlData.name) {
        attr.name = controlData.name;
    } else {
        if (attributes && attributes.name) {
            controlData.name = attributes.name;
        }
    }
    return attr;
}

/**
 * Если существует другой разрешатель имен в config.js. Мы его найдем и используем для подключения.
 * @param tpl
 * @param includedTemplates
 * @param _deps
 * @param config
 * @param parent
 * @returns {*}
 */
export function stringTemplateResolver<T = Control, K>(
    tpl: string,
    includedTemplates: Common.IncludedTemplates<K>,
    _deps: Common.Deps<T, K>,
    config: IGeneratorConfig,
    parent?: Control
): T | K | Common.IDefaultExport<T> {
    const resolver =
        config && config.resolvers ? Common.findResolverInConfig(tpl, config.resolvers) : undefined;
    if (resolver) {
        return resolver(tpl);
    } else {
        return Common.depsTemplateResolver<T, K>(tpl, includedTemplates, _deps);
    }
}

// выпрямляем объект, перекладывая все свойства на прототипе наверх.
// если так не сделать, реакт потеряет все свойства, которые были на прототипе
// свойства изначально на прототипе, чтобы работали скоупы, там на основе одного скоупа может создаться новый через
// object.create, чтобы функционировали контентные опции
export function flattenObject(obj: Object): Object {
    const result = {};
    // eslint-disable-next-line guard-for-in
    for (const key in obj) {
        result[key] = obj[key];
    }
    return result;
}
