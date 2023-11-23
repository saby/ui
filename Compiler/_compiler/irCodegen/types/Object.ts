/**
 * @author Krylov M.A.
 */

import type { TObject, IObjectProperty, TPrimitive } from '../Interface';

import { wrapArray, wrapSequence, wrapString } from './String';
import { isValidIdentifierName } from '../generators/ECMAScript';

function toObjectValue(value: TPrimitive | TPrimitive[]): TPrimitive {
    if (Array.isArray(value)) {
        return wrapArray(value);
    }

    return value;
}

export function toObjectNotation(object: Record<string, TPrimitive | TPrimitive[]>): IObjectProperty[] {
    return Object.keys(object).map((name) => ({
        name,
        value: toObjectValue(object[name])
    }));
}

export function toObjectPropertyName(name: string, comment?: string): string {
    const property = isValidIdentifierName(name) ? name : wrapString(name);

    if (typeof comment === 'string') {
        return `/* ${comment} */ ${property}`;
    }

    return property;
}

function compileObject(props: IObjectProperty[]): string {
    const contents = [];

    for (const { name, comment, value } of props) {
        const property = toObjectPropertyName(name, comment);

        contents.push(` ${property}: ${value}`);
    }

    return `{${wrapSequence(contents, ',')} }`;
}

export function wrapObject(object: TObject): string {
    const notation = Array.isArray(object) ? object : toObjectNotation(object);

    return compileObject(notation);
}
