/* eslint-disable */
/**
 */

export function isAttr(string: string) {
    return string.startsWith('attr:');
}

export function checkAttr(attrs: Record<string, unknown>) {
    for (const key in attrs) {
        if (isAttr(key)) {
            return true;
        }
    }
    return false;
}
