/**
 * @deprecated
 */

import { FunctionUtils } from 'UICommon/Utils';

/**
 * @deprecated
 * @param array
 */
export function uniq<T>(array: T[]): T[] {
    if (!Array.isArray(array)) {
        throw new TypeError(
            'Invalid type of the first argument. Array expected.'
        );
    }

    const cache: any = {};
    return array.reduce((prev, curr) => {
        if (!cache.hasOwnProperty(curr)) {
            cache[curr] = true;
            prev.push(curr);
        }
        return prev;
    }, []);
}

export const { shallowClone } = FunctionUtils;
