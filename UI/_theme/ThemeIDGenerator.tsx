/**
 * {@link https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript}
 * @private
 */
function hashCode(str: string) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        // eslint-disable-next-line no-bitwise, @typescript-eslint/no-magic-numbers
        hash = (hash << 5) - hash + chr;
        // eslint-disable-next-line no-bitwise
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

export default function generateUniqueID(styleObj: object, prefix: string = ''): string {
    let id: string;
    try {
        const styleStr = JSON.stringify(styleObj);
        id = prefix + 't-' + hashCode(styleStr);
    } catch (e) {
        id = prefix + 't-wrong-style';
    }
    return id;
}
