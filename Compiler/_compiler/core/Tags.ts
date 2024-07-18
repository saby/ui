/**
 * @description Represents wasaby tag descriptor.
 */

import getTagDescription, { TagDescription, ITagsDescription } from '../html/Tags';

/* eslint-disable quote-props */

/**
 * Wasaby tag descriptions.
 */
const TAGS_DESCRIPTIONS: ITagsDescription = {
    'ws:template': new TagDescription({
        allowSelfClosing: false,
    }),
};

/* eslint-enable quote-props */

/**
 * Get tag description by name.
 * @param name {string} Tag name.
 */
export default function getWasabyTagDescription(name: string): TagDescription {
    if (TAGS_DESCRIPTIONS[name]) {
        return TAGS_DESCRIPTIONS[name];
    }
    return getTagDescription(name);
}
