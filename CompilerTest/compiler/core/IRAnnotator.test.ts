import { Parser } from 'Compiler/_compiler/expressions/Parser';
import createErrorHandler from '../NullLogger';
import Scope from 'Compiler/_compiler/core/Scope';
import { parse } from 'Compiler/_compiler/html/Parser';
import getWasabyTagDescription from 'Compiler/_compiler/core/Tags';
import { createTextTranslator } from 'Compiler/_compiler/i18n/Translator';
import traverse from 'Compiler/_compiler/core/Traverse';
import { annotate } from 'Compiler/_compiler/core/IRAnnotator';

function getAnnotation(text: string) {
    const errorHandler = createErrorHandler(false);

    const traverseConfig = {
        allowComments: false,
        expressionParser: new Parser(),
        hierarchicalKeys: true,
        errorHandler,
        textTranslator: createTextTranslator({}),
        generateTranslations: true
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
        errorHandler
    };
    const options = {
        fileName: 'Module/template.wml',
        scope: new Scope(),
        translateText: true
    };

    const html = parse(text, options.fileName, parseConfig);

    if (errorHandler.hasFailures()) {
        throw new Error(errorHandler.popLastErrorMessage());
    }

    const ast = traverse(html, traverseConfig, options);

    if (errorHandler.hasFailures()) {
        throw new Error(errorHandler.popLastErrorMessage());
    }

    const annotation = annotate(traverseConfig.errorHandler, ast, 'wml!Module/template');

    if (errorHandler.hasFailures()) {
        throw new Error(errorHandler.popLastErrorMessage());
    }

    return annotation;
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

    it('should throw an error while traversing ws:if with no data attribute', () => {
        const html = '<ws:if>Consequent</ws:if>';

        expect(() => getAnnotation(html)).toThrowError(
            'Template Compiler: Module/template.wml (1:1) Ошибка разбора директивы "ws:if": не обнаружен обязательный атрибут "data"'
        );
    });

    it('should throw an error while traversing ws:if with no mustache expression', () => {
        const html = '<ws:if data="{{ }}">Consequent</ws:if>';

        expect(() => getAnnotation(html)).toThrowError(
            'Template Compiler: Module/template.wml (1:8) Ошибка разбора директивы "ws:if": в атрибуте "data" ожидалось только Mustache-выражение. В полученной строке отсутствует текст выражения'
        );
    });

    it('should throw an error while traversing ws:else with no mustache expression', () => {
        const html = `
            <ws:if data="{{ condition }}">Consequent</ws:if>
            <ws:else data="{{ }}">Alternate</ws:else>
        `;

        expect(() => getAnnotation(html)).toThrowError(
            'Template Compiler: Module/template.wml (3:22) Ошибка разбора директивы "ws:else": в атрибуте "data" ожидалось только Mustache-выражение. В полученной строке отсутствует текст выражения'
        );
    });

    it('should throw an error while traversing ws:for with no data attribute', () => {
        const html = '<ws:for>Content</ws:for>';

        expect(() => getAnnotation(html)).toThrowError(
            'Template Compiler: Module/template.wml (1:1) Ошибка разбора директивы "ws:for": не обнаружен обязательный атрибут "data"'
        );
    });

    it('should throw an error while traversing ws:for with no mustache expression', () => {
        const html = '<ws:for data=";;">Content</ws:for>';

        expect(() => getAnnotation(html)).toThrowError(
            'Template Compiler: Module/template.wml (1:9) Ошибка разбора директивы "ws:for": отсутствует обязательное выражение условия цикла'
        );
    });

    it('should throw an error while traversing ws:foreach with no mustache expression', () => {
        const html = '<ws:for data="">Content</ws:for>';

        expect(() => getAnnotation(html)).toThrowError(
            'Template Compiler: Module/template.wml (1:9) Ошибка разбора директивы "ws:for": цикл задан некорректно. Ожидалось соответствие шаблону "[index, ] iterator in collection". Получено: ""'
        );
    });
});
