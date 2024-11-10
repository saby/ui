import { Parser } from 'Compiler/_compiler/expressions/Parser';
import createErrorHandler from '../NullLogger';
import Scope from 'Compiler/_compiler/core/Scope';
import { parse } from 'Compiler/_compiler/html/Parser';
import getWasabyTagDescription from 'Compiler/_compiler/core/Tags';
import { createTextTranslator } from 'Compiler/_compiler/i18n/Translator';
import traverse from 'Compiler/_compiler/core/Traverse';
import { annotate } from 'Compiler/_compiler/core/IRAnnotator';

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

function getAnnotation(text: string) {
    const options = createTraverseOptions();

    const html = parse(text, options.fileName, parseConfig);
    const ast = traverse(html, traverseConfig, options);

    return annotate(traverseConfig.errorHandler, ast, 'wml!CompilerTest/compiler/core/IRAnnotator.test');
}

describe('Compiler/_compiler/core/IRAnnotator', () => {
    it('should collect all dependencies', () => {
        const html = `
            <A.B.C />
            <B.C:d.e />
            <ws:partial template="C/D:e.f" />
            <ws:partial template="wml!D/e/f" />
            <ws:partial template="tmpl!E/f/g" />
            <ws:partial template="html!F/g/h" />
            <ws:partial template="js!G/h/i" />
            <ws:partial template="H/i/j" />
            <ws:partial template="optional!wml!I/j/k" />
            <ws:partial template="optional!tmpl!J/k/m" />
            <ws:partial template="optional!html!K/m/n" />
            <ws:partial template="optional!js!M/n/o" />
            <ws:partial template="optional!N/o/p" />
        `;
        const annotation = getAnnotation(html);

        expect(annotation.dependencies).toEqual([
            'A/B/C',
            'B/C',
            'C/D',
            'wml!D/e/f',
            'tmpl!E/f/g',
            'html!F/g/h',
            'js!G/h/i',
            'H/i/j',
            'optional!wml!I/j/k',
            'optional!tmpl!J/k/m',
            'optional!html!K/m/n',
            'optional!js!M/n/o',
            'optional!N/o/p'
        ]);
    });

    describe('check collecting reactive properties', () => {
        // TODO: покрыть тестами сбор реактивных свойств
    });
});
