import {
    Attr,
    VoidTags as voidElements,
    TAttributes,
    IAttributes,
    INodeAttribute,
    IGeneratorConfig,
    CommonUtils as Common
} from 'UICommon/Executor';
import {CreateChildrenRef} from './Vdom/Refs/CreateChildrenRef';
import {CreateEventRef} from './Vdom/Refs/CreateEventRef';
import {convertAttributes, WasabyAttributes} from './Attributes';
import { ArrayUtils } from 'UICommon/Utils';

import { IWasabyEvent } from 'UICommon/Events';
import {AttrToDecorate} from './interfaces';
import { Control } from 'UICore/Base';
import { ChainOfRef, CreateOriginRef } from 'UICore/Ref';

import * as React from "react";

interface IControlData {
    name?: unknown;
}

/**
 * @author Тэн В.А.
 */

export function createTagDefault(tag, attrs, children, attrToDecorate?, defCollection?): string {
    if (!attrToDecorate) {
        attrToDecorate = {};
    }
    if (!attrs) {
        attrs = {attributes: {}};
    }

    const mergedAttrs = Attr.processMergeAttributes(
        attrToDecorate.attributes as IAttributes,
        attrs.attributes as IAttributes
    );

    Object.keys(mergedAttrs).forEach((attrName) => {
        if (attrName.indexOf('top:') === 0) {
            const newAttrName = attrName.replace('top:', '');
            mergedAttrs[newAttrName] = mergedAttrs[newAttrName] || mergedAttrs[attrName];
            delete mergedAttrs[attrName];
        }
    });

    const mergedAttrsStr = mergedAttrs
        ? decorateAttrs(mergedAttrs, {})
        : '';
    // tslint:disable-next-line:no-bitwise
    if (~voidElements.indexOf(tag)) {
        return '<' + tag + mergedAttrsStr + ' />';
    }
    return '<' + tag + mergedAttrsStr + '>' + joinElements(children) + '</' + tag + '>';
}

export function joinElements(elements: string[], key?, defCollection?): string {
    if (Array.isArray(elements)) {
        let res = '';
        elements.forEach((element) => {
            if (Array.isArray(element)) {
                element = joinElements(element);
            }
            res += (element || '');
        });

        return res;
    } else {
        throw new Error('joinElements: elements is not array');
    }
}

export function resolveControlName<TOptions extends IControlData>(controlData: TOptions,
    attributes: TAttributes | INodeAttribute): TAttributes | INodeAttribute {
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

function decorateAttrs(attr1: TAttributes, attr2: TAttributes): string {
    function wrapUndef(value: string): string {
        if (value === undefined || value === null) {
            return '';
        } else {
            return value;
        }
    }

    const attrToStr = (attrs: string[]): string => {
        let str = '';
        for (const attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
                str += (wrapUndef(attrs[attr]) !== '' ? ' ' + (attr + '="' + attrs[attr] + '"') : '');
            }
        }
        return str;
    };
    return attrToStr(Attr.joinAttrs(attr1, attr2));
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
    const resolver = config && config.resolvers ? Common.findResolverInConfig(tpl, config.resolvers) : undefined;
    if (resolver) {
        return resolver(tpl);
    } else {
        return Common.depsTemplateResolver<T, K>(tpl, includedTemplates, _deps);
    }
}
