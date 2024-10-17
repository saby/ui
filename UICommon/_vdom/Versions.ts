/**
 * Модуль, предоставляющий методы для сбора версий версионируемых объектов.
 */

import type {
    TInternalsCollection,
    TVersionsCollection,
    TControlOptionsExtended
} from './Types';

import {
    isPossiblyScopeObjectOfInternal,
    isVersionable,
    isVersionableArray,
    isWS4ContentOption,
    getWS4ContentOptionInternals
} from './Types';

const EMPTY_STRING: string = '';

function checkPropertyVersion(key: string, value: unknown, versions: TVersionsCollection): boolean {
    if (typeof value !== 'object' && typeof value !== 'function') {
        return false;
    }

    if (isVersionable(value)) {
        versions.set(key, value.getVersion());

        return true;
    }

    if (isVersionableArray(value)) {
        versions.set(key, value.getArrayVersion());

        return true;
    }

    if (isWS4ContentOption(value)) {
        const contentOptionInternals = getWS4ContentOptionInternals(value);

        collectInternalsVersionsPrivate(contentOptionInternals, versions, `${key};`);
    }

    return false;
}

function collectObjectVersionsPrivate(
    collection: TControlOptionsExtended,
    versions: TVersionsCollection,
    prefix: string
): TVersionsCollection {
    if (typeof collection !== 'object' || collection === null) {
        return versions;
    }

    const keys = Object.keys(collection);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = collection[key];

        checkPropertyVersion(prefix + key, value, versions);
    }

    return versions;
}

function collectInternalsVersionsPrivate(
    collection: TInternalsCollection,
    versions: TVersionsCollection,
    prefix: string
): TVersionsCollection {
    if (typeof collection !== 'object' || collection === null) {
        return versions;
    }

    collection.forEach((value, key) => {
        if (checkPropertyVersion(prefix + key, value, versions)) {
            return;
        }

        if (isPossiblyScopeObjectOfInternal(value)) {
            collectObjectVersionsPrivate(value, versions, EMPTY_STRING);
        }
    });

    return versions;
}

export function collectObjectVersions(collection: TControlOptionsExtended): TVersionsCollection {
    const versions = new Map<string, number>();

    return collectObjectVersionsPrivate(collection, versions, EMPTY_STRING);
}

export function collectInternalsVersions(collection: TInternalsCollection): TVersionsCollection {
    const versions = new Map<string, number>();

    if (!(collection instanceof Map)) {
        // FIXME: сюда может прийти объект из старой кодогенерации -- html.tmpl шаблон. Будет доработано по задаче:
        //  https://online.sbis.ru/opendoc.html?guid=fc2b5dd4-0411-4ce4-b380-936bd63160fa&client=3
        return versions;
    }

    return collectInternalsVersionsPrivate(collection, versions, EMPTY_STRING);
}
