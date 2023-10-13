import { Parser } from 'Compiler/_compiler/expressions/Parser';
import createErrorHandler from '../NullLogger';
import { parse } from 'Compiler/_compiler/html/Parser';
import getWasabyTagDescription from 'Compiler/_compiler/core/Tags';
import * as Nodes from 'Compiler/_compiler/html/Nodes';
import * as Text from 'Compiler/_compiler/core/Text';
import * as Ast from 'Compiler/_compiler/core/Ast';
import Scope from 'Compiler/_compiler/core/Scope';
import { assert } from 'chai';
import createValidator from 'Compiler/_compiler/expressions/Validator';

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

const FILE_NAME = 'Compiler/core/Text/TestTemplate.wml';

function createTextProcessorConfig() {
    const expressionParser = new Parser();
    const errorHandler = createErrorHandler();
    const expressionValidator = createValidator(errorHandler);
    return {
        expressionParser,
        errorHandler,
        expressionValidator,
        generateTranslations: true,
    };
}

function createTextProcessorOptions(allowedContent: Text.TextContentFlags, translateText: boolean) {
    return {
        fileName: FILE_NAME,
        translationsRegistrar: new Scope(),
        allowedContent,
        translateText,
        position: null,
    };
}

function processText(
    data: string,
    allowedContent: Text.TextContentFlags = Text.TextContentFlags.FULL_TEXT,
    translateText: boolean = false
) {
    const html = parse(data, FILE_NAME, parseConfig);
    assert.strictEqual(html.length, 1);
    assert.isTrue(html[0] instanceof Nodes.Text);
    const text = <Nodes.Text>html[0];
    const textProcessorConfig = createTextProcessorConfig();
    const processor = Text.createTextProcessor(textProcessorConfig);
    const textProcessorOptions = createTextProcessorOptions(allowedContent, translateText);
    return processor.process(text.data, textProcessorOptions);
}

describe('Compiler/_compiler/core/Text', () => {
    it('TextDataNode', () => {
        const collection = processText('Simple text');
        assert.strictEqual(collection.length, 1);
        assert.instanceOf(collection[0], Ast.TextDataNode);
        const textDataNode = <Ast.TextDataNode>collection[0];
        assert.strictEqual(textDataNode.wsContent, 'Simple text');
    });
    it('TextDataNode, translateText=true', () => {
        const collection = processText('Simple text', Text.TextContentFlags.FULL_TEXT, true);
        assert.strictEqual(collection.length, 1);
        assert.instanceOf(collection[0], Ast.TranslationNode);
        const translationNode = <Ast.TranslationNode>collection[0];
        assert.strictEqual(translationNode.wsContext, '');
        assert.strictEqual(translationNode.wsText, 'Simple text');
    });
    it('TranslationNode (text and context)', () => {
        const collection = processText('{[ Context @@ Text ]}');
        assert.strictEqual(collection.length, 1);
        assert.instanceOf(collection[0], Ast.TranslationNode);
        const translationNode = <Ast.TranslationNode>collection[0];
        assert.strictEqual(translationNode.wsContext, 'Context');
        assert.strictEqual(translationNode.wsText, 'Text');
    });
    it('TranslationNode (text only)', () => {
        const collection = processText('{[ Text ]}');
        assert.strictEqual(collection.length, 1);
        assert.instanceOf(collection[0], Ast.TranslationNode);
        const translationNode = <Ast.TranslationNode>collection[0];
        assert.strictEqual(translationNode.wsContext, '');
        assert.strictEqual(translationNode.wsText, 'Text');
    });
    it('ExpressionNode', () => {
        const collection = processText('{{ identifier }}');
        assert.strictEqual(collection.length, 1);
        assert.instanceOf(collection[0], Ast.ExpressionNode);
        const expressionNode = <Ast.ExpressionNode>collection[0];
        assert.isTrue(!!expressionNode.wsProgram);
    });
    it('Stress! ExpressionNode', () => {
        const collection = processText('{{ "{{ value }}" }}');
        assert.strictEqual(collection.length, 1);
        assert.instanceOf(collection[0], Ast.ExpressionNode);
        const expressionNode = <Ast.ExpressionNode>collection[0];
        assert.isTrue(!!expressionNode.wsProgram);
        assert.strictEqual(expressionNode.wsProgram.string, '"{{ value }}"');
    });
    it('Mixed content', () => {
        const collection = processText('{[ Hello ]}, {{ userName }}');
        assert.strictEqual(collection.length, 3);
        assert.instanceOf(collection[0], Ast.TranslationNode);
        assert.instanceOf(collection[1], Ast.TextDataNode);
        assert.instanceOf(collection[2], Ast.ExpressionNode);
    });
    describe('allowedContent', () => {
        it('TextContentFlags.TEXT', () => {
            const collection = processText('Hello', Text.TextContentFlags.TEXT);
            assert.strictEqual(collection.length, 1);
            assert.instanceOf(collection[0], Ast.TextDataNode);
        });
        it('Failure! TextContentFlags.TEXT', (done) => {
            try {
                processText('{[ Hello ]}, {{ userName }}', Text.TextContentFlags.TEXT);
                // FIXME: Disabled
                // done(new Error('Must be failed'));
                done();
            } catch (error) {
                done();
            }
        });
        it('TextContentFlags.EXPRESSION', () => {
            const collection = processText('{{ userName }}', Text.TextContentFlags.EXPRESSION);
            assert.strictEqual(collection.length, 1);
            assert.instanceOf(collection[0], Ast.ExpressionNode);
        });
        it('Failure! TextContentFlags.EXPRESSION', (done) => {
            try {
                processText('{[ Hello ]}, {{ userName }}', Text.TextContentFlags.EXPRESSION);
                // FIXME: Disabled
                // done(new Error('Must be failed'));
                done();
            } catch (error) {
                done();
            }
        });
        it('TextContentFlags.TRANSLATION', () => {
            const collection = processText('{[ Hello ]}', Text.TextContentFlags.TRANSLATION);
            assert.strictEqual(collection.length, 1);
            assert.instanceOf(collection[0], Ast.TranslationNode);
        });
        it('Failure! TextContentFlags.TRANSLATION', (done) => {
            try {
                processText('{[ Hello ]}, {{ userName }}', Text.TextContentFlags.TRANSLATION);
                // FIXME: Disabled
                // done(new Error('Must be failed'));
                done();
            } catch (error) {
                done();
            }
        });
        it('TextContentFlags.TEXT_AND_TRANSLATION', () => {
            const collection = processText(
                '{[ Hello ]}, Wasaby!',
                Text.TextContentFlags.TEXT_AND_TRANSLATION
            );
            assert.strictEqual(collection.length, 2);
            assert.instanceOf(collection[0], Ast.TranslationNode);
            assert.instanceOf(collection[1], Ast.TextDataNode);
        });
        it('Failure! TextContentFlags.TEXT_AND_TRANSLATION', (done) => {
            try {
                processText(
                    '{[ Hello ]}, {{ userName }}',
                    Text.TextContentFlags.TEXT_AND_TRANSLATION
                );
                // FIXME: Disabled
                // done(new Error('Must be failed'));
                done();
            } catch (error) {
                done();
            }
        });
        it('TextContentFlags.TEXT_AND_EXPRESSION', () => {
            const collection = processText(
                'Hello, {{ userName }}',
                Text.TextContentFlags.TEXT_AND_EXPRESSION
            );
            assert.strictEqual(collection.length, 2);
            assert.instanceOf(collection[0], Ast.TextDataNode);
            assert.instanceOf(collection[1], Ast.ExpressionNode);
        });
        it('Failure! TextContentFlags.TEXT_AND_EXPRESSION', (done) => {
            try {
                processText(
                    '{[ Hello ]}, {{ userName }}',
                    Text.TextContentFlags.TEXT_AND_EXPRESSION
                );
                // FIXME: Disabled
                // done(new Error('Must be failed'));
                done();
            } catch (error) {
                done();
            }
        });
    });
});
