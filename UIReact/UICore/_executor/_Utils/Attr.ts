/**
 */

const WHITESPACE = ' ';

type IObjectAttributes = { style?: object };
export type IReactAttributes = Record<string, string> & IObjectAttributes;

// boolean аттрибуты, которые не нужно приводить к строке
export const SPECIAL_BOOL_ATTRS = ['checked', 'readOnly', 'autoPlay'];

/**
 * Функция мержит собственные атрибуты с родительскими.
 * @param parentAttributes {IReactAttributes} - родительские атрибуты.
 * @param ownAttributes {IReactAttributes} - собственные атрибуты.
 * @returns {IReactAttributes} - Объект со смерженными атрибутами.
 */
export function processMergeAttributes(
    parentAttributes: IReactAttributes,
    ownAttributes: IReactAttributes
): IReactAttributes {
    const parentAttr: IReactAttributes = parentAttributes || {};

    const classNameValue = mergeClassName(parentAttributes, ownAttributes);
    if (classNameValue) {
        ownAttributes.className = classNameValue;
    }
    const styleValue = mergeStyle(parentAttributes, ownAttributes);
    if (styleValue) {
        ownAttributes.style = styleValue;
    }

    ownAttributes.key = ownAttributes.key || parentAttr.key;

    for (const [name, value] of Object.entries(parentAttr)) {
        if (value === undefined || ['className', 'style'].includes(name)) {
            continue;
        }
        // так было написано, что
        ownAttributes[name] = value as string;
    }

    // очистка аттрибутов от undefined
    for (const name in ownAttributes) {
        if (ownAttributes.hasOwnProperty(name) && ownAttributes[name] === undefined) {
            delete ownAttributes[name];
        }
    }

    return ownAttributes;
}

/**
 * Функция обрезает attr: и мержит атрибуты
 * @param attr1 - родительские атрибуты
 * @param attr2 - собственные атрибуты
 * @returns объект со смерженными атрибутами
 */
export function mergeAttrs(attr1, attr2) {
    attr1 = attr1 || {};
    attr2 = attr2 || {};

    const finalAttr: any = {};
    let name;
    for (name in attr1) {
        if (attr1.hasOwnProperty(name) && attr1[name] !== undefined && attr1[name] !== null) {
            finalAttr[name] = attr1[name] !== '' ? attr1[name] : undefined;
        }
    }
    for (name in attr2) {
        if (attr2.hasOwnProperty(name) && attr2[name] !== undefined && attr2[name] !== null) {
            if (name === 'className') {
                finalAttr.className = mergeClassName(finalAttr, attr2);
            } else if (name === 'style') {
                // ? почему-то здесь родительские и свои атрибуты поменяны местами
                finalAttr.style = mergeStyle(attr2, finalAttr);
                // children key value should be always preferable over parent
            } else if (name === 'key') {
                finalAttr.key = attr2[name];
            } else if (name === 'alt') {
                // для тега img следуют всегда оставлять переданный alt
                // чтобы в случае неуспешной загрузки по основному пути вывести значение из alt
                // если просто удалить alt, то получим пустую иконку
                finalAttr.alt = attr2[name];
            } else if (name === 'value' && attr2[name] === '') {
                // аналогично нужно отдавать value (например у input) как есть
                finalAttr.value = attr2[name];
            } else if (!finalAttr.hasOwnProperty(name)) {
                if (attr2[name]) {
                    finalAttr[name] = attr2[name];
                } else {
                    finalAttr[name] = attr2[name] === 0 ? 0 : undefined;
                }
                if (typeof finalAttr[name] === 'boolean' && !SPECIAL_BOOL_ATTRS.includes(name)) {
                    // boolean атрибуты должны переводиться в строку чтобы отобразиться в верстке,
                    // но кроме checked потому что у него своя специфика для input в react
                    finalAttr[name] = finalAttr[name] + '';
                }
            }
        }
    }

    return finalAttr;
}

/**
 * Мержит className.
 * @param parentAttrs {IReactAttributes} - родительские атрибуты.
 * @param ownAttrs {IReactAttributes} - собственные атрибуты.
 * @param name {String}  - имя атрибута, который надо смержит.
 * @param separator {String} - разделить.
 * @returns {String}
 * Пример:
 * mergeAttr({'className': 'foo'}, {'className': 'bar'}) => 'bar; foo;'
 */
function mergeClassName(parentAttrs: IReactAttributes, ownAttrs: IReactAttributes): string {
    const parentClassName = parentAttrs?.className;
    const ownClassName = ownAttrs?.className;

    if (parentClassName && ownClassName) {
        const trimmedParentAttr = parentClassName.trim();
        const trimmedOwnAttr = ownClassName.trim();

        return `${trimmedOwnAttr}${WHITESPACE}${trimmedParentAttr}`;
    }

    if (ownClassName && typeof ownClassName === 'string') {
        return ownClassName.trim();
    }

    if (parentClassName) {
        return parentClassName.trim();
    }

    return '';
}

/**
 * Мержит оттрибуты типа object
 * @param parentAttrs
 * @param ownAttrs
 * @param name
 * @returns
 */
function mergeStyle(parentAttrs: IObjectAttributes, ownAttrs: IObjectAttributes): object {
    const parentStyle = parentAttrs?.style;
    const ownStyle = ownAttrs?.style;

    let res;
    if (parentStyle && ownStyle) {
        res = { ...parentStyle, ...ownStyle };
    } else if (ownStyle) {
        res = ownStyle;
    } else if (parentStyle) {
        res = parentStyle;
    }

    if (res) {
        const invalidKeys = Object.keys(res).filter((name) => {
            return !(name?.trim() && res[name]?.trim());
        });
        invalidKeys.forEach((name) => {
            delete res[name];
        });
    }

    return res;
}
