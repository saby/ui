/**
 * @author Krylov M.A.
 */

import type { TPrimitive } from '../Interface';

const stringReg = /["\\\n\r]/g;
const tagsToReplace = {
    "'": "\\'",
    '"': '\\"',
    '\\': '\\\\',
    '\n': '\\n',
    '\r': '\\r'
};

function replacer(entity: string): string {
    return tagsToReplace[entity] || entity;
}

function escapeString(value: string): string {
    return value.replace(stringReg, replacer);
}

export function wrapString(value: TPrimitive): string {
    if (typeof value === 'string') {
        return `"${escapeString(value)}"`;
    }

    return `"${value}"`;
}

export function wrapSequence(args: TPrimitive[], separator: string = ', '): string {
    return args.join(separator);
}

export function wrapArray(elements: TPrimitive[]): string {
    return `[${wrapSequence(elements)}]`;
}
