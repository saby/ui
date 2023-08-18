import { Generator, ECMAScript2021 } from './ECMAScript';

const DYNAMIC_OBJECT_PROPERTIES = [
    'attr',
    'data',
    'isVdom',
    'defCollection',
    'depsLocal',
    'includedTemplates',
    'viewController',
    'compositeAttributes',
    'scope',
    'isRootTag',
    'internal',
    'mergeType',
    'blockOptionNames',
    'isContainerNode',
    'context',
    'pName',
];

export function getDynamicPropertiesDeclaration(generator: Generator): string {
    if (generator.version !== ECMAScript2021) {
        return '';
    }

    const identifiers = DYNAMIC_OBJECT_PROPERTIES.map(
        (id) => `${generator.genDynamicObjectPropertyName(id)} = "${id}"`
    );

    return `var ${identifiers.join(' ,')};`;
}
