/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
import { ITagDescription } from 'UI/_base/_meta/interface';
import { getResourceUrl } from 'UI/Utils';
import escapeHtml = require('Core/helpers/String/escapeHtml');

/**
 * @interface ITagMarkupConfig дополнительные параметры для генератора верстки
 * @private
 */
interface ITagMarkupConfig {
    getResourceUrl?: boolean;
}

// https://www.w3.org/TR/2011/WD-html-markup-20110113/syntax.html#void-element
const HTML_VOID_ELEMENTS = {
    area: true,
    base: true,
    br: true,
    col: true,
    command: true,
    embed: true,
    hr: true,
    img: true,
    input: true,
    keygen: true,
    link: true,
    meta: true,
    param: true,
    source: true,
    track: true,
    wbr: true,
};

export default class {
    outerHTML: string = '';

    constructor(tags: ITagDescription[], config?: ITagMarkupConfig) {
        this.outerHTML = tags
            .map((tag: ITagDescription) => {
                return generateTagMarkup(tag, config);
            })
            .join('\n');
    }
}

export function generateTagMarkup(
    { tagName, attrs, children }: ITagDescription = {
        tagName: 'no_tag',
        attrs: {},
    },
    config?: ITagMarkupConfig
): string {
    const _atts = { ...attrs };

    // decorate all of input links and scripts to redirect requests onto
    // cdn domain if it's configured on current page.
    const attrMarkup = Object.entries(_atts)
        .map(([key, val]) => {
            if (key === 'href' || key === 'src') {
                return `${key}="${__getResourceUrl(val, config)}"`;
            }
            return `${key}="${escapeHtml(val)}"`;
        })
        .join(' ');
    if (HTML_VOID_ELEMENTS[tagName]) {
        return `<${tagName} ${attrMarkup}>`;
    }

    let childMarkup = '';
    if (children) {
        childMarkup =
            typeof children === 'string'
                ? children
                : generateTagMarkup(children);
    }
    return `<${tagName} ${attrMarkup}>${childMarkup}</${tagName}>`;
}

function __getResourceUrl(url: string, config: ITagMarkupConfig): string {
    return config?.getResourceUrl === false ? url : getResourceUrl(url);
}
