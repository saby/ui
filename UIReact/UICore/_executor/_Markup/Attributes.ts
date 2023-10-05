import * as React from 'react';
import { IFocusAttributes, _FocusAttrs } from 'UICommon/Focus';
import { Attr, IAttributes } from 'UICommon/Executor';
import {
    wasabyToReactAttrNames,
    wasabyAttrNames,
    reactToWasabyAttrNames,
    reactAttrNames,
} from './wasabyToReactAttrNames';
let styleCheckDeclaration: CSSStyleDeclaration;
import { SPECIAL_BOOL_ATTRS } from '../_Utils/Attr';

function getStyleCheckDeclaration(): CSSStyleDeclaration {
    if (!styleCheckDeclaration) {
        styleCheckDeclaration = document.createElement('div').style;
    }
    return styleCheckDeclaration;
}

// При присваиваниии невалидного значения в CSSStyleDeclaration остаётся старое значение.
function isValidStyle(property: string, value: string): boolean {
    if (typeof document === 'undefined') {
        return true;
    }
    const styleChecker = getStyleCheckDeclaration();
    styleChecker[property] = '';
    styleChecker[property] = value;
    return !!styleChecker[property];
}
const specialStyleResolver = (value: string): string => {
    const prefixes = {
        webkit: 'Webkit',
        ms: 'ms',
        moz: 'Moz',
        o: 'O',
    };
    const findKey = Object.keys(prefixes).find((prefix: string) => {
        return prefix === value;
    });
    return prefixes[findKey] || value;
};
const formatStringToCamelCase = (name: string) => {
    // CSSVariables names do not converted
    if (name.slice(0, 2) === '--') {
        return name;
    }

    const splitted = name.split('-');
    if (splitted.length === 1) return splitted[0];
    let splittedIndex = 0;
    // стили для ie могут начинаться c -, например -ms-grid-columns
    // такой стиль так же надо приводить к camelCase
    if (splitted[0] === '') {
        splittedIndex = 1;
        splitted[1] = specialStyleResolver(splitted[1]);
    }
    return (
        splitted[splittedIndex] +
        splitted
            .slice(splittedIndex + 1)
            .map((word) => {
                return word ? word[0].toUpperCase() + word.slice(1) : '';
            })
            .join('')
    );
};

const dataImageSegment = 'data:image/';
const base64Segment = ';base64,';
const colon = ':';
const semicolon = ';';

/**
 * Метод извлечения из inline стилей свойств, описанных через base64
 * Появился он тут в помощь методу getStyleObjectFromString, потому что тот портит такие данные
 * Алгоритм вычленения следующий: для строки вида
 * background-image:url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)
 * наблюдаем, что область данных обрамлена круглыми скобками, внутри которых находится 2 сегмента
 * "data:image/" и ";base64,". Будем искать эти сегменты как признак наличия данных в формате base64
 * Затем, отталкиваясь от текущего положения сегментов, будем искать левую и правую половину подстроки.
 * Для этого достаточно встретить точку с запятой или конец/начало строки. Так мы соберем всю подстроку,
 * включая и имя свойства. Найдем первое двоеточие - это граница имени свойства и значения.
 * @see getStyleObjectFromString
 */
const cutBase64Property: (base64str: string) => {
    str: string;
    style: Record<string, string>;
} = (base64str: string) => {
    const result = {
        str: base64str,
        style: {},
    };
    let substringStart: number;
    let substringEnd: number;

    let str = base64str;
    while (str.includes(dataImageSegment) && str.includes(base64Segment)) {
        substringStart = str.indexOf(dataImageSegment);
        substringEnd = str.indexOf(base64Segment) + base64Segment.length;

        const leftEdge =
            substringStart - str.substring(0, substringStart).split(semicolon).pop().length;
        const rightEdge =
            substringEnd + str.substring(substringEnd).split(semicolon).shift().length;

        const substring = str.substring(leftEdge, rightEdge);

        const propertyNameEdge = substring.indexOf(colon);

        result.style[formatStringToCamelCase(substring.substring(0, propertyNameEdge).trim())] =
            substring.substring(propertyNameEdge + 1).trim();
        result.str = str = str.substring(0, leftEdge) + str.substring(rightEdge);
    }

    return result;
};

const getStyleObjectFromString = (initialStr: string) => {
    const { str, style } = cutBase64Property(initialStr);
    for (const el of str.split(';')) {
        const index = el.indexOf(':');
        if (index === -1) {
            continue;
        }
        let property = el.slice(0, index);
        let value = el.slice(index + 1);
        property = property ? property.trim() : '';
        value = value ? value.trim() : '';
        if (!property || !value) {
            continue;
        }
        const formattedProperty = formatStringToCamelCase(property);
        // @ts-ignore
        if (typeof window !== 'undefined' && document.body.wasabyLoaded) {
            if (isValidStyle(formattedProperty, value)) {
                style[formattedProperty] = value;
            } else {
                // Logger.error('Ошибка при инициализации атрибута style: element.style.' +
                //     formattedProperty + ' = ' + formattedValue + '\n' +
                //     'Необходимо исправить место, где неверно вычисляется значение для атрибута!\n' +
                //     'Поставьте точку останова в месте вывода ошибки, изучив стек вызова можно понять,
                //     где задается неверный style');
            }
        } else {
            style[formattedProperty] = value;
        }
    }

    return style;
};

export interface IWasabyAttributes extends IFocusAttributes {
    class?: string;
    style?: string;
    'xml:lang'?: string;
    name?: string;
    ref?: React.MutableRefObject<HTMLElement> | React.LegacyRef<HTMLElement>;
    templateName?: string;
    fixCompatible?: '1' | string;
}

interface IStandardAttributes {
    spellcheck?: boolean | 'false' | 'true';
    autocorrect?: string;
    autocapitalize?: string;
    inputmode?: string;
    autocomplete?: string;
    class?: string;
    'fill-rule'?: 'nonzero' | 'evenodd';
    'clip-rule'?: 'nonzero' | 'evenodd' | 'inherit';
    'xlink:href'?: string;
    'xmlns:xlink'?: string;
}

/**
 * Конвертирует наши атрибуты в реактовские аналоги.
 * @param attributes
 * @param convertBoolean переводить или нет boolean атрибуты в строку, т.е. false => 'false'
 */
export function wasabyAttrsToReactDom<T extends HTMLElement, P extends React.HTMLAttributes<T>>(
    attributes: IStandardAttributes & IWasabyAttributes & P,
    convertBoolean: boolean = true
): P {
    if (!attributes) {
        return attributes;
    }

    if (_FocusAttrs.isSingletonFocusAttrs(attributes)) {
        return attributes;
    }
    const convertedAttributes: P = Object.isFrozen(attributes) ? { ...attributes } : attributes;
    /** замена атрибута и удаление старого */
    for (const key of Object.keys(attributes)) {
        if (
            convertBoolean &&
            typeof attributes[key] === 'boolean' &&
            !SPECIAL_BOOL_ATTRS.includes(key)
        ) {
            // boolean атрибуты должны переводиться в строку чтобы отобразиться в верстке,
            // но кроме checked и readOnly потому что у него своя специфика для input в react
            attributes[key] = attributes[key] + '';
        }
        if (wasabyAttrNames.includes(key)) {
            convertedAttributes[wasabyToReactAttrNames[key]] = attributes[key];
            delete attributes[key];
        }
    }
    if (attributes.hasOwnProperty('style')) {
        convertedAttributes.style =
            typeof attributes.style !== 'string'
                ? attributes.style
                : getStyleObjectFromString(attributes.style);
    }

    return convertedAttributes;
}

export function reactAttrsToWasabyDom<T = HTMLElement>(
    attributes: React.HTMLAttributes<T>
): Attr.IAttributes {
    if (!attributes) {
        return attributes as Attr.IAttributes;
    }
    const convertedAttributes = Object.isFrozen(attributes) ? { ...attributes } : attributes;
    for (const key of Object.keys(attributes)) {
        if (reactAttrNames.includes(key)) {
            convertedAttributes[reactToWasabyAttrNames[key]] = attributes[key];
            delete convertedAttributes[key];
        }
    }
    if (attributes.style && typeof attributes.style === 'object') {
        convertedAttributes.style = Object.entries(attributes.style)
            .map(([k, value]) => {
                const key = k.replace(/[A-Z]/g, (match) => {
                    return `-${match.toLowerCase()}`;
                });
                return `${key}:${value}`;
            })
            .join(';');
    }
    return convertedAttributes as IAttributes;
}
