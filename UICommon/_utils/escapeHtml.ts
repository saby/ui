/**
 * @kaizen_zone 12a18d13-c36d-4e5e-bb0e-94f5b383c6ed
 */

interface ITagsToReplace {
    [propName: string]: string;
}

const tagsToReplace: ITagsToReplace = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
};
const ampRegExp = /&([^#])/g;
const otherEscapeRegExp = /([<>"])/g;

export default function escapeHtml(str: any) {
    if (typeof str === 'string') {
        str = str.replace(ampRegExp, (_, suffix) => `&amp;${suffix}`);

        return str.replace(otherEscapeRegExp, (tag: any) => tagsToReplace[tag] || tag);
    }
    return str;
}
