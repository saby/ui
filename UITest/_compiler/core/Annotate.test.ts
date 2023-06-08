import { Parser } from 'Compiler/_expressions/Parser';
import createErrorHandler from '../NullLogger';
import Scope from 'Compiler/_core/Scope';
import { parse } from 'Compiler/_html/Parser';
import getWasabyTagDescription from 'Compiler/_core/Tags';
import * as Ast from 'Compiler/_core/Ast';
import { createTextTranslator } from 'Compiler/_i18n/Translator';
import traverse from 'Compiler/_core/Traverse';
import { process } from 'Compiler/_core/Annotate';
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

describe('Compiler/_core/Annotate', () => {
    describe('Check passRef flag on inline template', () => {
        it('Should set flag on root node', () => {
            const text = `
            <ws:template name="myTemplate">
                <div>Hello</div>
            </ws:template>

            <ws:partial template="myTemplate" />
            `;
            const ast = traverseTemplate(text);

            assert.strictEqual(ast.length, 2);

            assert.isTrue(ast[1] instanceof Ast.InlineTemplateNode);
            const inlineTemplateNode = ast[1] as Ast.InlineTemplateNode;
            assert.isTrue(inlineTemplateNode.__$ws_passRef);
        });
        it('Should set flag through conditionals', () => {
            const text = `
            <ws:template name="myTemplate">
                <div>Hello</div>
            </ws:template>

            <ws:if data="{{ condition }}">
                <ws:partial template="myTemplate" />
            </ws:if>
            <ws:else data="{{ condition2 }}">
                <ws:partial template="myTemplate" />
            </ws:else>
            <ws:else>
                <ws:partial template="myTemplate" />
            </ws:else>
            `;
            const ast = traverseTemplate(text);

            assert.strictEqual(ast.length, 4);

            let inlineTemplateNode: Ast.InlineTemplateNode;

            assert.isTrue(ast[1] instanceof Ast.IfNode);
            inlineTemplateNode = (ast[1] as Ast.IfNode)
                .__$ws_consequent[0] as Ast.InlineTemplateNode;
            assert.isTrue(inlineTemplateNode.__$ws_passRef);

            assert.isTrue(ast[2] instanceof Ast.ElseNode);
            inlineTemplateNode = (ast[2] as Ast.ElseNode)
                .__$ws_consequent[0] as Ast.InlineTemplateNode;
            assert.isTrue(inlineTemplateNode.__$ws_passRef);

            assert.isTrue(ast[3] instanceof Ast.ElseNode);
            inlineTemplateNode = (ast[3] as Ast.ElseNode)
                .__$ws_consequent[0] as Ast.InlineTemplateNode;
            assert.isTrue(inlineTemplateNode.__$ws_passRef);
        });
        it('Should set flag through foreach node', () => {
            const text = `
            <ws:template name="myTemplate">
                <div>Hello</div>
            </ws:template>

            <ws:for data="item in collection">
                <ws:partial template="myTemplate" item="{{ item }}" />
            </ws:for>
            `;
            const ast = traverseTemplate(text);

            assert.strictEqual(ast.length, 2);

            assert.isTrue(ast[1] instanceof Ast.ForeachNode);
            const inlineTemplateNode = (ast[1] as Ast.ForeachNode)
                .__$ws_content[0] as Ast.InlineTemplateNode;
            assert.isTrue(inlineTemplateNode.__$ws_passRef);
        });
        it('Should set flag through for node', () => {
            const text = `
            <ws:template name="myTemplate">
                <div>Hello</div>
            </ws:template>

            <ws:for data="iterator.init(); iterator.hasNext(); ">
                <ws:partial template="myTemplate" item="{{ iterator.getItem() }}" />
            </ws:for>
            `;
            const ast = traverseTemplate(text);

            assert.strictEqual(ast.length, 2);

            assert.isTrue(ast[1] instanceof Ast.ForNode);
            const inlineTemplateNode = (ast[1] as Ast.ForNode)
                .__$ws_content[0] as Ast.InlineTemplateNode;
            assert.isTrue(inlineTemplateNode.__$ws_passRef);
        });
        it('Should not set flag on root inside element', () => {
            const text = `
            <ws:template name="myTemplate">
                <div>Hello</div>
            </ws:template>

            <div>
                <ws:partial template="myTemplate" />
            </div>
            `;
            const ast = traverseTemplate(text);

            assert.strictEqual(ast.length, 2);

            assert.isTrue(ast[1] instanceof Ast.ElementNode);
            const inlineTemplateNode = (ast[1] as Ast.ElementNode)
                .__$ws_content[0] as Ast.InlineTemplateNode;
            assert.isFalse(inlineTemplateNode.__$ws_passRef);
        });
        it('Should set flag on root in content option', () => {
            const text = `
            <ws:template name="myTemplate">
                <div>Hello</div>
            </ws:template>

            <UIModule.Component>
                <ws:partial template="myTemplate" />
            </UIModule.Component>
            `;
            const ast = traverseTemplate(text);

            assert.strictEqual(ast.length, 2);

            assert.isTrue(ast[1] instanceof Ast.ComponentNode);
            const inlineTemplateNode = (ast[1] as Ast.ComponentNode)
                .__$ws_contents.content
                .__$ws_content[0] as Ast.InlineTemplateNode;
            assert.isTrue(inlineTemplateNode.__$ws_passRef);
        });
        it('Should not set flag in content option inside element', () => {
            const text = `
            <ws:template name="myTemplate">
                <div>Hello</div>
            </ws:template>

            <UIModule.Component>
                <div>
                    <ws:partial template="myTemplate" />
                </div>
            </UIModule.Component>
            `;
            const ast = traverseTemplate(text);

            assert.strictEqual(ast.length, 2);

            assert.isTrue(ast[1] instanceof Ast.ComponentNode);
            const inlineTemplateNode = (
                (ast[1] as Ast.ComponentNode).__$ws_contents.content
                    .__$ws_content[0] as Ast.ElementNode
            ).__$ws_content[0] as Ast.InlineTemplateNode;
            assert.isFalse(inlineTemplateNode.__$ws_passRef);
        });
        it('Should set flag on root in template', () => {
            const text = `
            <ws:template name="myTemplate">
                <div>Hello</div>
            </ws:template>

            <ws:template name="targetTemplate">
                <ws:partial template="myTemplate" />
            </ws:template>

            <ws:partial template="targetTemplate" />
            `;
            const ast = traverseTemplate(text);

            assert.strictEqual(ast.length, 3);

            let inlineTemplateNode;

            assert.isTrue(ast[1] instanceof Ast.TemplateNode);
            inlineTemplateNode = (ast[1] as Ast.TemplateNode)
                .__$ws_content[0] as Ast.InlineTemplateNode;
            assert.isTrue(inlineTemplateNode.__$ws_passRef);

            assert.isTrue(ast[2] instanceof Ast.InlineTemplateNode);
            inlineTemplateNode = ast[2] as Ast.InlineTemplateNode;
            assert.isTrue(inlineTemplateNode.__$ws_passRef);
        });
        it('Should not set flag on root in template inside element', () => {
            const text = `
            <ws:template name="myTemplate">
                <div>Hello</div>
            </ws:template>

            <ws:template name="targetTemplate">
                <div>
                    <ws:partial template="myTemplate" />
                </div>
            </ws:template>

            <ws:partial template="targetTemplate" />
            `;
            const ast = traverseTemplate(text);

            assert.strictEqual(ast.length, 3);

            let inlineTemplateNode;

            assert.isTrue(ast[1] instanceof Ast.TemplateNode);
            inlineTemplateNode = (
                (ast[1] as Ast.TemplateNode).__$ws_content[0] as Ast.ElementNode
            ).__$ws_content[0] as Ast.InlineTemplateNode;
            assert.isFalse(inlineTemplateNode.__$ws_passRef);

            assert.isTrue(ast[2] instanceof Ast.InlineTemplateNode);
            inlineTemplateNode = ast[2] as Ast.InlineTemplateNode;
            assert.isTrue(inlineTemplateNode.__$ws_passRef);
        });
    });
});
