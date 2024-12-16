import { Parser } from 'Compiler/_compiler/expressions/Parser';
import createErrorHandler from '../NullLogger';
import Scope from 'Compiler/_compiler/core/Scope';
import { parse } from 'Compiler/_compiler/html/Parser';
import getWasabyTagDescription from 'Compiler/_compiler/core/Tags';
import * as Ast from 'Compiler/_compiler/core/Ast';
import { createTextTranslator } from 'Compiler/_compiler/i18n/Translator';
import traverse from 'Compiler/_compiler/core/Traverse';
import { process } from 'Compiler/_compiler/core/Annotate';
import { getTopLevelComponentName } from 'Compiler/_compiler/core/StaticHelpers';
import { assert } from 'chai';

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
    allowComments: true,
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
        fileName: 'Compiler/core/Traverse/TestTemplate.wml',
        scope: new Scope(),
        translateText: false,
    };
}

function traverseTemplate(text: string): Ast.Ast[] {
    const options = createTraverseOptions();

    const htmlAst = parse(text, options.fileName, parseConfig);
    const wasabyAst = traverse(htmlAst, traverseConfig, options) as Ast.Ast[];
    process(wasabyAst, options.scope);
    return wasabyAst;
}

describe('Compiler/_compiler/core/StaticHelpers', () => {
    it('should return full name of component node', () => {
        const text = '<UIModule._library.Component />';
        const nodes = traverseTemplate(text);

        const componentName = getTopLevelComponentName(nodes);
        assert.strictEqual(componentName, 'UIModule/_library/Component');
    });
    it('should return full name of component library node', () => {
        const text = '<UIModule.library:Component />';
        const nodes = traverseTemplate(text);

        const componentName = getTopLevelComponentName(nodes);
        assert.strictEqual(componentName, 'UIModule/library:Component');
    });
    it('should return full name of partial node', () => {
        const componentName = 'UIModule/_library/Component';
        const text = `<ws:partial template="${componentName}" />`;
        const nodes = traverseTemplate(text);

        const result = getTopLevelComponentName(nodes);
        assert.strictEqual(result, componentName);
    });
    it('should return full name of partial node with library component', () => {
        const componentName = 'UIModule/library:Component';
        const text = `<ws:partial template="${componentName}" />`;
        const nodes = traverseTemplate(text);

        const result = getTopLevelComponentName(nodes);
        assert.strictEqual(result, componentName);
    });
});
