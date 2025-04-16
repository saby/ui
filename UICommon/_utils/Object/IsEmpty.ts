/**
 */
const nativeStringifier = Object.prototype.toString;
const objectTag = '[object Object]';

export default function isEmpty(obj: any): boolean {
    if (obj === null || typeof obj !== 'object') {
        return false;
    }

    const tag = nativeStringifier.call(obj);
    if (tag === objectTag || obj instanceof Object) {
        // eslint-disable-next-line guard-for-in
        for (const _key in obj) {
            return false;
        }
    }

    return true;
}
