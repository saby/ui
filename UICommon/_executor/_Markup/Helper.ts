/* eslint-disable */
// @ts-nocheck
import { processMergeAttributes, mergeEvents } from '../_Expressions/Attr';

export { uniteScope } from '../_Expressions/Scope';
export { processMergeAttributes };

export function plainMergeAttr(inner, object, options) {
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
        object.attributes.name === object.attributes.sbisname &&
        object.attributes.sbisname !== undefined
    ) {
        object = {};
    }

    return {
        inheritOptions: object.inheritOptions,
        context: inner.context,
        internal: inner.internal,
        systemOptions: {},
        domNodeProps: {},
        attributes: processMergeAttributes(inner.attributes, object.attributes),
        events: mergeEvents(inner.events, object.events),
    };
}

export function plainMergeContext(inner, object) {
    if (!inner) {
        inner = {};
    }
    if (!object) {
        object = {};
    }

    return {
        attributes: object.attributes || {},
        events: object.events || {},
        inheritOptions: inner.inheritOptions,
        internal: inner.internal,
        context: inner.context,
    };
}

export function calculateKey(decorAttr, configAttr): string {
    let controlKey;
    if (decorAttr.attributes && decorAttr.attributes.key) {
        controlKey = decorAttr.attributes.key;
    }
    return controlKey || decorAttr.key || configAttr.key;
}

export const config = {
    moduleMaxNameLength: 4096,
};
