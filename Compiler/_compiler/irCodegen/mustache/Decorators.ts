/**
 * @author Krylov M.A.
 *
 * Модуль генерации конфигураций для bind и mutable декораторов.
 */

import type { IMustacheMeta } from './Interface';

const SEPARATOR = '/';
const DEFAULT_DIRECTION = 'fromContext';
const ESCAPE_FALSE_DECORATORS = [
    'sanitize',
    'unescape',
    'money',
    'highlight',
    'colorMark',
    'wrapURLs'
];

export function shouldSkipDecoratorEscape(name: string): boolean {
    return ESCAPE_FALSE_DECORATORS.indexOf(name) > -1;
}

export interface IBindingConfiguration {
    fieldName: IMustacheMeta<string>;
    propName: string;
    propPath: string[];
    fullPropName: string;
    propPathStr: string;
    oneWay: boolean;
    direction: IMustacheMeta<string>;
    bindNonExistent: boolean;
}

function createDirection(direction?: IMustacheMeta<string>): IMustacheMeta<string> {
    if (typeof direction === 'undefined') {
        return {
            isTableFunction: false,
            body: DEFAULT_DIRECTION,
            shouldEscape: false
        };
    }

    return direction;
}

function createConfiguration(
    value: IMustacheMeta<string>,
    controlPropName: string,
    direction: IMustacheMeta<string>,
    oneWay: boolean,
    bindNonExistent: boolean
): IBindingConfiguration {
    const propArr = controlPropName.split(SEPARATOR);
    const propPath = propArr.slice(1);
    const propPathStr = propPath.join(SEPARATOR);

    return {
        fieldName: value,
        propName: controlPropName,
        propPath,
        fullPropName: controlPropName,
        propPathStr,
        oneWay,
        direction,
        bindNonExistent
    };
}

export function createBinding(
    decorator: string,
    value: IMustacheMeta<string>,
    controlPropName: string,
    bindNonExistent: boolean,
    direction: IMustacheMeta<string>
): IBindingConfiguration {
    if (decorator === 'bind') {
        return createConfiguration(
            value,
            controlPropName,
            createDirection(direction),
            true,
            bindNonExistent
        );
    }

    if (decorator === 'mutable') {
        return createConfiguration(
            value,
            controlPropName,
            createDirection(),
            false,
            bindNonExistent
        );
    }

    throw new Error(`внутренняя ошибка: получен неизвестный декоратор "${decorator}"`);
}
