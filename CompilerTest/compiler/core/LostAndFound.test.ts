/**
 * Проверим, что правильно определяем потеряшки среди атрибутов.
 *
 * Тесты были автоматически сгенерированы по конфигурации (пбп): (attr, special, lost, option).
 *
 * FIXME: https://online.sbis.ru/opendoc.html?guid=7996b993-1430-418a-af64-cd2aa0cb0341&client=3
 */

import type { ComponentNode } from 'Compiler/_compiler/core/Ast';

import { Parser } from 'Compiler/_compiler/expressions/Parser';
import createErrorHandler from '../NullLogger';
import Scope from 'Compiler/_compiler/core/Scope';
import { parse } from 'Compiler/_compiler/html/Parser';
import getWasabyTagDescription from 'Compiler/_compiler/core/Tags';
import { createTextTranslator } from 'Compiler/_compiler/i18n/Translator';
import traverse from 'Compiler/_compiler/core/Traverse';

import findLostAttributes from 'Compiler/_compiler/core/LostAndFound';

const traverseConfig = {
    allowComments: false,
    expressionParser: new Parser(),
    hierarchicalKeys: true,
    errorHandler: createErrorHandler(),
    textTranslator: createTextTranslator({}),
    generateTranslations: true,
};

const parseConfig = {
    xml: true,
    allowComments: false,
    allowCDATA: true,
    compatibleTreeStructure: true,
    rudeWhiteSpaceCleaning: true,
    normalizeLineFeed: true,
    cleanWhiteSpaces: true,
    needPreprocess: true,
    tagDescriptor: getWasabyTagDescription,
    errorHandler: createErrorHandler(),
};

function createTraverseOptions() {
    return {
        fileName: 'CompilerTest/compiler/core/IRAnnotator.wml',
        scope: new Scope(),
        translateText: true
    };
}

function getTree(text: string): ComponentNode {
    const options = createTraverseOptions();

    const html = parse(text, options.fileName, parseConfig);
    return traverse(html, traverseConfig, options)[0] as ComponentNode;
}

describe('Compiler/_compiler/core/LostAndFound', () => {
    it('case 1', () => {
        const html = `
            <UI.Component
                name="element_1"
                attr:attribute="attribute value"
                tabindex="0"
                data-access="access value"
                option="option value"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 2', () => {
        const html = `
            <UI.Component
                name="element_2"
                attr:attribute="attribute value"
                tabindex="0"
                option="option value"
                data-access="access value"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 3', () => {
        const html = `
            <UI.Component
                name="element_3"
                attr:attribute="attribute value"
                data-access="access value"
                tabindex="0"
                option="option value"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 4', () => {
        const html = `
            <UI.Component
                name="element_4"
                attr:attribute="attribute value"
                data-access="access value"
                option="option value"
                tabindex="0"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 5', () => {
        const html = `
            <UI.Component
                name="element_5"
                attr:attribute="attribute value"
                option="option value"
                tabindex="0"
                data-access="access value"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 6', () => {
        const html = `
            <UI.Component
                name="element_6"
                attr:attribute="attribute value"
                option="option value"
                data-access="access value"
                tabindex="0"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 7', () => {
        const html = `
            <UI.Component
                name="element_7"
                tabindex="0"
                attr:attribute="attribute value"
                data-access="access value"
                option="option value"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 8', () => {
        const html = `
            <UI.Component
                name="element_8"
                tabindex="0"
                attr:attribute="attribute value"
                option="option value"
                data-access="access value"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 9', () => {
        const html = `
            <UI.Component
                name="element_9"
                tabindex="0"
                data-access="access value"
                attr:attribute="attribute value"
                option="option value"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 10', () => {
        const html = `
            <UI.Component
                name="element_10"
                tabindex="0"
                data-access="access value"
                option="option value"
                attr:attribute="attribute value"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 11', () => {
        const html = `
            <UI.Component
                name="element_11"
                tabindex="0"
                option="option value"
                attr:attribute="attribute value"
                data-access="access value"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 12', () => {
        const html = `
            <UI.Component
                name="element_12"
                tabindex="0"
                option="option value"
                data-access="access value"
                attr:attribute="attribute value"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 13', () => {
        const html = `
            <UI.Component
                name="element_13"
                data-access="access value"
                attr:attribute="attribute value"
                tabindex="0"
                option="option value"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 14', () => {
        const html = `
            <UI.Component
                name="element_14"
                data-access="access value"
                attr:attribute="attribute value"
                option="option value"
                tabindex="0"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 15', () => {
        const html = `
            <UI.Component
                name="element_15"
                data-access="access value"
                tabindex="0"
                attr:attribute="attribute value"
                option="option value"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 16', () => {
        const html = `
            <UI.Component
                name="element_16"
                data-access="access value"
                tabindex="0"
                option="option value"
                attr:attribute="attribute value"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 17', () => {
        const html = `
            <UI.Component
                name="element_17"
                data-access="access value"
                option="option value"
                attr:attribute="attribute value"
                tabindex="0"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 18', () => {
        const html = `
            <UI.Component
                name="element_18"
                data-access="access value"
                option="option value"
                tabindex="0"
                attr:attribute="attribute value"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 19', () => {
        const html = `
            <UI.Component
                name="element_19"
                option="option value"
                attr:attribute="attribute value"
                tabindex="0"
                data-access="access value"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 20', () => {
        const html = `
            <UI.Component
                name="element_20"
                option="option value"
                attr:attribute="attribute value"
                data-access="access value"
                tabindex="0"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 21', () => {
        const html = `
            <UI.Component
                name="element_21"
                option="option value"
                tabindex="0"
                attr:attribute="attribute value"
                data-access="access value"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 22', () => {
        const html = `
            <UI.Component
                name="element_22"
                option="option value"
                tabindex="0"
                data-access="access value"
                attr:attribute="attribute value"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 23', () => {
        const html = `
            <UI.Component
                name="element_23"
                option="option value"
                data-access="access value"
                attr:attribute="attribute value"
                tabindex="0"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
    it('case 24', () => {
        const html = `
            <UI.Component
                name="element_24"
                option="option value"
                data-access="access value"
                tabindex="0"
                attr:attribute="attribute value"
            />
        `;
        const component = getTree(html);

        const lost = findLostAttributes(component as ComponentNode);

        expect(lost.map(attr => attr.name)).toEqual(['data-access']);
        expect(Object.keys(component.wsAttributes)).toEqual(['attr:attribute']);
        expect(Object.keys(component.wsOptions).sort()).toEqual(['name', 'option', 'tabindex']);
    });
});
