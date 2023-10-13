import { Parser } from 'Compiler/_compiler/expressions/Parser';
import createErrorHandler from '../NullLogger';
import Scope from 'Compiler/_compiler/core/Scope';
import { parse } from 'Compiler/_compiler/html/Parser';
import getWasabyTagDescription from 'Compiler/_compiler/core/Tags';
import { createTextTranslator } from 'Compiler/_compiler/i18n/Translator';
import traverse from 'Compiler/_compiler/core/Traverse';
import { annotate } from 'Compiler/_compiler/core/IRAnnotator';
import { ECMAScript2021 } from 'Compiler/_compiler/irCodegen/generators/ECMAScript';
import createGenerator from 'Compiler/_compiler/irCodegen/Generator';

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
        fileName: 'CompilerTest/compiler/irCodegen/Markup.wml',
        scope: new Scope(),
        translateText: true
    };
}

function getAnnotation(text: string) {
    const options = createTraverseOptions();

    const moduleName = 'wml!CompilerTest/compiler/irCodegen/Markup';
    const html = parse(text, options.fileName, parseConfig);
    const ast = traverse(html, traverseConfig, options);

    return annotate(traverseConfig.errorHandler, ast, moduleName);
}

function mockVisitor(visitor: unknown, method: string) {
    const fn = visitor[method];
    const mock = jest.fn((node, context) => fn.call(visitor, node, context));

    visitor[method] = mock;

    return mock;
}

function toLibraryComponent(attributes: string = '', content: string = ''): string {
    if (!content) {
        return `<UI.Lib:Component ${attributes} />`;
    }

    return `<UI.Lib:Component ${attributes} >${content}</UI.Lib:Component>`;
}

function toPartial(template: string, attributes: string = '', content: string = ''): string {
    if (!content) {
        return `<ws:partial template="${template}" ${attributes} />`;
    }

    return `<ws:partial template="${template}" >${content}</ws:partial>`;
}

function toDynamicPartial(attributes: string = '', content: string = ''): string {
    if (!content) {
        return toPartial('{{ tmpl }}', attributes);
    }

    return toPartial('{{ tmpl }}', attributes, content);
}

function toComponent(attributes: string = '', content: string = ''): string {
    if (!content) {
        return `<UI.Component ${attributes} />`;
    }

    return `<UI.Component ${attributes} >${content}</UI.Component>`;
}

function toComponentWithOption(value: string, option: string = 'option'): string {
    return toComponent(
        '',
        `<ws:${option}>${value}</ws:${option}>`
    );
}

describe('Compiler/_compiler/irCodegen/Generator', () => {
    let generator;

    beforeEach(() => {
        generator = createGenerator(ECMAScript2021, false);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    function visitorHaveReturnedWith(visitor: string, html: string) {
        const fn = mockVisitor(generator, visitor);

        const { exports } = generator.generate(getAnnotation(html));

        expect(fn).toHaveBeenCalled();
        expect(fn.mock.results[0].type).toEqual('return');

        expect(exports).toMatchSnapshot();
    }

    describe('check code generation for conditional chains', () => {
        const ifBlock = '<ws:if data="{{ ifCondition }}"><div>if block</div></ws:if>';
        const elifBlock = '<ws:else data="{{ elifCondition }}"><div>elif block</div></ws:else>';
        const elseBlock = '<ws:else><div>else block</div></ws:else>';

        it('should generate if chain', () => {
            visitorHaveReturnedWith('visitIf', ifBlock);
        });
        it('should generate if chain with else', () => {
            visitorHaveReturnedWith('visitIf', ifBlock + elseBlock);
        });
        it('should generate elif chain', () => {
            visitorHaveReturnedWith('visitIf', ifBlock + elifBlock);
        });
        it('should generate else chain', () => {
            visitorHaveReturnedWith('visitIf', ifBlock + elifBlock + elseBlock);
        });
    });
    describe('check code generation for iterators', () => {
        it('should generate for', () => {
            const html = `
                <ws:for data="init(); test(); update()">
                    <div>element</div>
                </ws:for>
            `;

            visitorHaveReturnedWith('visitFor', html);
        });
        it('should generate for 2', () => {
            const html = `
                <ws:for data=" ; test(); ">
                    <div>element</div>
                </ws:for>
            `;

            visitorHaveReturnedWith('visitFor', html);
        });
        it('should generate for in content option', () => {
            const html = toComponentWithOption(`
                <ws:for data="init(); test(); update()">
                    <div>element</div>
                </ws:for>
            `);

            visitorHaveReturnedWith('visitContentOption', html);
        });
        it('should generate foreach', () => {
            const html = `
                <ws:for data="index, iterator in collection">
                    <div>element N {{ index }}</div>
                    <div>{{ iterator.getValue() }}</div>
                </ws:for>
            `;

            visitorHaveReturnedWith('visitForeach', html);
        });
        it('should generate foreach 2', () => {
            const html = `
                <ws:for data="iterator in collection">
                    <div>element {{ iterator.getValue() }}</div>
                </ws:for>
            `;

            visitorHaveReturnedWith('visitForeach', html);
        });
        it('should generate foreach in content option', () => {
            const html = toComponentWithOption(`
                <ws:for data="index, iterator in collection">
                    <div>element N {{ index + otherIndex }}</div>
                    <div>{{ iterator.getValue() }}</div>
                </ws:for>
            `);

            visitorHaveReturnedWith('visitContentOption', html);
        });
    });
    describe('check code generation for text nodes', () => {
        it('should generate text', () => {
            visitorHaveReturnedWith('visitText', 'Hello, World!');
        });
        it('should generate text 2', () => {
            visitorHaveReturnedWith('visitText', '   Hello, World!   ');
        });
        it('should generate text 3', () => {
            visitorHaveReturnedWith('visitText', 'aaa "bbb" ccc');
        });
        it('should generate translation', () => {
            visitorHaveReturnedWith('visitText', '{[Hello, World!]}');
        });
        it('should generate translation 2', () => {
            visitorHaveReturnedWith(
                'visitText',
                '{[   translation context   @@    Hello, World!   ]}'
            );
        });
        it('should generate mustache expression', () => {
            visitorHaveReturnedWith('visitText', '{{ expression }}');
        });
        it('should generate mustache expression 2', () => {
            visitorHaveReturnedWith('visitText', '{{ "aaa\\"bbb\\"ccc" }}');
        });
        it('should generate text with mixed content', () => {
            const html = 'before {[translation]} text {{ expression }} after';

            visitorHaveReturnedWith('visitText', html);
        });
        it('should generate text with unsafe content', () => {
            const html = '<span>{{ __setHTMLUnsafe(value) }}</span>';

            visitorHaveReturnedWith('visitText', html);
        });
        it('should sanitize decorator', () => {
            const html = '<span>{{ text | highlight }}</span>';

            visitorHaveReturnedWith('visitText', html);
        });
    });
    describe('check code generation for special tags', () => {
        it('should generate doctype', () => {
            visitorHaveReturnedWith('visitDoctype', '<!DOCTYPE html>');
        });
        it('should generate cdata', () => {
            visitorHaveReturnedWith('visitCData', '<![CDATA[ value ]]>');
        });
        it('should generate instruction', () => {
            visitorHaveReturnedWith('visitInstruction', '<? instruction ?>');
        });
        it('should not generate comment', () => {
            const fn = mockVisitor(generator, 'visitComment');

            generator.generate(getAnnotation('<!-- comment -->'));

            expect(fn).not.toBeCalled();
        });
    });
    describe('check code generation for data types', () => {
        it('should generate array', () => {
            const html = toComponentWithOption(`
                <ws:Array>
                    <ws:Boolean>true</ws:Boolean>
                    <ws:Number>123</ws:Number>
                    <ws:Object />
                    <ws:String>text</ws:String>
                    <ws:Value>value</ws:Value>
                </ws:Array>
            `);

            visitorHaveReturnedWith('visitArray', html);
        });
        it('should generate empty array', () => {
            const html = toComponentWithOption(`
                <ws:Array />
            `);

            visitorHaveReturnedWith('visitArray', html);
        });
        it('should generate boolean with literal', () => {
            const html = toComponentWithOption(`
                <ws:Boolean>true</ws:Boolean>
            `);

            visitorHaveReturnedWith('visitBoolean', html);
        });
        it('should generate boolean with expression', () => {
            const html = toComponentWithOption(`
                <ws:Boolean>{{ value }}</ws:Boolean>
            `);

            visitorHaveReturnedWith('visitBoolean', html);
        });
        it('should generate boolean with literal in expression', () => {
            const html = toComponentWithOption(`
                <ws:Boolean>{{ true }}</ws:Boolean>
            `);

            visitorHaveReturnedWith('visitBoolean', html);
        });
        it('should generate function', () => {
            const html = toComponentWithOption(`
                <ws:Function opt1="value1" opt2="{{ value2 }}">UI/Module:library.handler</ws:Function>
            `);

            visitorHaveReturnedWith('visitFunction', html);
        });
        it('should generate function 2', () => {
            const html = toComponentWithOption(`
                <ws:Function>{{ handler }}</ws:Function>
            `);

            visitorHaveReturnedWith('visitFunction', html);
        });
        it('should generate number with literal', () => {
            const html = toComponentWithOption(`
                <ws:Number>123.45</ws:Number>
            `);

            visitorHaveReturnedWith('visitNumber', html);
        });
        it('should generate number with expression', () => {
            const html = toComponentWithOption(`
                <ws:Number>{{ value }}</ws:Number>
            `);

            visitorHaveReturnedWith('visitNumber', html);
        });
        it('should generate number with literal in expression', () => {
            const html = toComponentWithOption(`
                <ws:Number>{{ -123.45 }}</ws:Number>
            `);

            visitorHaveReturnedWith('visitNumber', html);
        });
        it('should generate object', () => {
            const html = toComponentWithOption(`
                <ws:Object attributeProperty="value">
                     <ws:boolean>
                          <ws:Boolean>true</ws:Boolean>
                     </ws:boolean>
                     <ws:number>
                          <ws:Number>123</ws:Number>
                     </ws:number>
                     <ws:string>
                          <ws:String>string</ws:String>
                     </ws:string>
                </ws:Object>
            `);

            visitorHaveReturnedWith('visitObject', html);
        });
        it('should generate deep object', () => {
            const html = toComponentWithOption(`
                <ws:Object firstAttributeProperty="value">
                    <ws:property>
                        <ws:Object secondAttributeProperty="value">
                            <ws:property>
                                <ws:Object secondAttributeProperty="value">
                                    <ws:property>
                                        <ws:String>string</ws:String>
                                    </ws:property>
                                </ws:Object>
                            </ws:property>
                        </ws:Object>
                    </ws:property>
                </ws:Object>
            `);

            visitorHaveReturnedWith('visitObject', html);
        });
        it('should generate object with expression', () => {
            const html = toComponentWithOption(`
                <ws:Object attributeProperty="{{ value }}">
                     <ws:boolean>
                          <ws:Boolean>{{ boolean }}</ws:Boolean>
                     </ws:boolean>
                     <ws:number>
                          <ws:Number>{{ number }}</ws:Number>
                     </ws:number>
                     <ws:string>
                          <ws:String>{{ string }}</ws:String>
                     </ws:string>
                </ws:Object>
            `);

            visitorHaveReturnedWith('visitObject', html);
        });
        it('should generate empty object', () => {
            const html = toComponentWithOption(`
                <ws:Object />
            `);

            visitorHaveReturnedWith('visitObject', html);
        });
        it('should generate string', () => {
            const html = toComponentWithOption(`
                <ws:String>before {{ value }} {[ after ]}</ws:String>
            `);

            visitorHaveReturnedWith('visitString', html);
        });
        it('should generate value', () => {
            const html = toComponentWithOption(`
                <ws:Value>123.45 {{ value }} {[ text ]}</ws:Value>
            `);

            visitorHaveReturnedWith('visitValue', html);
        });
    });
    describe('check code generation for html elements', () => {
        it('should generate element attributes', () => {
            const html = `
                <div attr:style="123 {{ className }}" path="hello">
                    <span></span>
                </div>
            `;

            visitorHaveReturnedWith('visitElement', html);
        });
        it('should generate element composite attributes', () => {
            const html = `
                <div attr:style="{{ styles }}" class="class-name" attributes="{{ { 
                    'customProperty': customValue,
                    number: 123,
                    string: "string value"
                } }}">
                </div>
            `;

            visitorHaveReturnedWith('visitElement', html);
        });
        it('should generate event handler', () => {
            const html = `
                <div on:customEvent="_handler(true, arg)">
                    <span></span>
                </div>
            `;

            visitorHaveReturnedWith('visitElement', html);
        });
        it('should generate event handler with child', () => {
            const html = `
                <div name="childName" on:customEvent="_handler(true, arg)">
                    <span></span>
                </div>
            `;

            visitorHaveReturnedWith('visitElement', html);
        });
        it('should generate dots in scope attribute', () => {
            const html = '<div scope="{{ ... }}" option="{{ value }}"></div>';

            visitorHaveReturnedWith('visitElement', html);
        });
        it('should generate scope attribute', () => {
            const html = '<div scope="{{ customScope }}" option="{{ value }}"></div>';

            visitorHaveReturnedWith('visitElement', html);
        });
        it('should generate boolean attributes', () => {
            const html = '<div allowfullscreen async="true" checked="false"></div>';

            visitorHaveReturnedWith('visitElement', html);
        });
        it('should generate xmlns attributes', () => {
            const html = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg>';

            visitorHaveReturnedWith('visitElement', html);
        });
        it('should generate data-bind attribute', () => {
            const html = '<span data-bind="{ html: \'linkText\' }"></span>';

            visitorHaveReturnedWith('visitElement', html);
        });
    });
    describe('check code generation for components', () => {
        it('should generate simple component', () => {
            visitorHaveReturnedWith('visitComponent', '<A.B.C />');
        });
        it('should generate library component', () => {
            visitorHaveReturnedWith('visitComponent', '<A.B:c.d />');
        });
        it('should generate inline template', () => {
            const html = (
                '<ws:template name="inline">' +
                    '<span>Hello, world!</span>' +
                '</ws:template>' +
                toPartial('inline')
            );

            visitorHaveReturnedWith('visitInlineTemplate', html);
        });
        it('should generate dynamic partial', () => {
            visitorHaveReturnedWith('visitDynamicPartial', toPartial('{{ template }}'));
        });
        it('should generate static partial 1', () => {
            visitorHaveReturnedWith('visitStaticPartial', toPartial('A/B:c.d'));
        });
        it('should generate static partial 2', () => {
            visitorHaveReturnedWith('visitStaticPartial', toPartial('wml!A/b/c'));
        });
        it('should generate static partial 3', () => {
            visitorHaveReturnedWith('visitStaticPartial', toPartial('tmpl!A/b/c'));
        });
        it('should generate static partial 4', () => {
            visitorHaveReturnedWith('visitStaticPartial', toPartial('html!A/b/c'));
        });
        it('should generate static partial 5', () => {
            visitorHaveReturnedWith('visitStaticPartial', toPartial('js!A/b/c'));
        });
        it('should generate static partial 6', () => {
            visitorHaveReturnedWith('visitStaticPartial', toPartial('A/b/c'));
        });
        it('should generate static partial 7', () => {
            visitorHaveReturnedWith('visitStaticPartial', toPartial('optional!wml!A/b/c'));
        });
        it('should generate static partial 8', () => {
            visitorHaveReturnedWith('visitStaticPartial', toPartial('optional!tmpl!A/b/c'));
        });
        it('should generate static partial 9', () => {
            visitorHaveReturnedWith('visitStaticPartial', toPartial('optional!html!A/b/c'));
        });
        it('should generate static partial 10', () => {
            visitorHaveReturnedWith('visitStaticPartial', toPartial('optional!js!A/b/c'));
        });
        it('should generate static partial 11', () => {
            visitorHaveReturnedWith('visitStaticPartial', toPartial('optional!A/b/c'));
        });
        it('should generate event handler', () => {
            const html = toComponent('on:customEvent="_handler(true, arg)"');

            visitorHaveReturnedWith('visitComponent', html);
        });
        it('should generate event handler with child', () => {
            const html = toComponent(
                'name="childName" on:customEvent="childName.handler(true, childName.value)"'
            );

            visitorHaveReturnedWith('visitComponent', html);
        });
        it('should generate event handlers chain', () => {
            const html = toComponent(
                'on:valueChanged="_handler(arg)" bind:value="_customValue"'
            );

            visitorHaveReturnedWith('visitComponent', html);
        });
        it('should generate bind handler', () => {
            const html = toComponent('bind:option="customOption"');

            visitorHaveReturnedWith('visitComponent', html);
        });
        it('should generate bind handler 2', () => {
            const html = toLibraryComponent('bind:option="object.property.value"');

            visitorHaveReturnedWith('visitComponent', html);
        });
        it('should generate content option', () => {
            const html = toComponentWithOption(
                '<div>Hello, world!</div>'
            );

            visitorHaveReturnedWith('visitComponent', html);
        });
        it('should generate attributes and options', () => {
            // FIXME: из-за баги в методе processAttributes
            //  модуля Compiler/_compiler/modules/utils/parse
            //  в прошлой генерации терялся класс class.
            //  Возможно, сейчас где-то всплывет.
            const html = toComponent('attr:tabindex="1" option="{{ value }}" class="class-name"');

            visitorHaveReturnedWith('visitComponent', html);
        });
        it('should generate composite attributes', () => {
            const html = toComponent('attr:attributes="{{ componentAttributes }}"');

            visitorHaveReturnedWith('visitComponent', html);
        });
        it('should generate composite attributes 2', () => {
            const html = toComponent('attributes="{{ componentAttributes }}"');

            visitorHaveReturnedWith('visitComponent', html);
        });

        describe('check scope option', () => {
            it('should generate scope option as option for component', () => {
                const html = toComponent(
                    '',
                    '<ws:scope value="{{ value }}" />'
                );

                visitorHaveReturnedWith('visitComponent', html);
            });
            it('should generate scope option for component 1', () => {
                const html = toComponent(
                    'scope="{{ ... }}" option="{{ value }}"'
                );

                visitorHaveReturnedWith('visitComponent', html);
            });
            it('should generate scope option for component 2', () => {
                const html = toComponent(
                    'scope="{{ customScope }}" option="{{ value }}"'
                );

                visitorHaveReturnedWith('visitComponent', html);
            });
            it('should generate scope option for component 3', () => {
                const html = toComponent(
                    'scope="{{ _options }}" option="{{ value }}"'
                );

                visitorHaveReturnedWith('visitComponent', html);
            });

            it('should generate scope option for partial 1', () => {
                const html = toDynamicPartial(
                    'scope="{{ ... }}" option="{{ value }}"'
                );

                visitorHaveReturnedWith('visitDynamicPartial', html);
            });
            it('should generate scope option for partial 2', () => {
                const html = toDynamicPartial(
                    'scope="{{ customScope }}" option="{{ value }}"'
                );

                visitorHaveReturnedWith('visitDynamicPartial', html);
            });
            it('should generate scope option for partial 3', () => {
                const html = toDynamicPartial(
                    'scope="{{ { a: 123, b: [1, 2, 3] } }}" option="{{ value }}"'
                );

                visitorHaveReturnedWith('visitDynamicPartial', html);
            });
        });
        describe('check code generation for mutable decorators', () => {
            it('should generate mutable binding 1', () => {
                const html = toComponent(
                    'optionName="{{ "propertyName" | mutable : object.property }}"'
                );

                visitorHaveReturnedWith('visitComponent', html);
            });
            it('should generate mutable binding 2', () => {
                const html = toComponent(
                    'optionName="{{ "propertyName" | mutable : ["first", "second"] }}"'
                );

                visitorHaveReturnedWith('visitComponent', html);
            });
            it('should generate mutable binding 3', () => {
                const html = toComponent(
                    'name="{{ name }}" optionName="{{ ("String/" + name + "Value") | mutable }}"'
                );

                visitorHaveReturnedWith('visitComponent', html);
            });
            it('should generate mutable binding 4', () => {
                const html = toComponent(
                    'name="componentName" optionName="{{ "propertyName" | mutable: "initialValue", "fromProperty" }}"'
                );

                visitorHaveReturnedWith('visitComponent', html);
            });
            it('should generate mutable binding 5', () => {
                const html = toComponent(
                    'optionName="{{ "object.property" | mutable }}"'
                );

                visitorHaveReturnedWith('visitComponent', html);
            });
            it('should generate mutable binding 6', () => {
                const html = toComponentWithOption('' +
                    '<ws:Array>' +
                        '<ws:String>{{ "propertyName" | mutable : initialValue }}</ws:String>' +
                    '</ws:Array>'
                );

                visitorHaveReturnedWith('visitComponent', html);
            });
            it('should generate mutable binding 7', () => {
                const html = toComponentWithOption('' +
                    '<ws:Array>' +
                        '<ws:Object value="{{ \'object/property\' | mutable }}" />' +
                    '</ws:Array>'
                );

                visitorHaveReturnedWith('visitComponent', html);
            });
            it('should generate mutable binding 8', () => {
                const html = toComponentWithOption('' +
                    '<ws:Array>' +
                        '<ws:Boolean>{{ \'propertyName\' | mutable }}</ws:Boolean>' +
                    '</ws:Array>'
                );

                visitorHaveReturnedWith('visitComponent', html);
            });
            it('should generate mutable binding 9', () => {
                const html = toComponentWithOption('' +
                    '<ws:Array>' +
                        '<ws:Number>{{ \'propertyName\' | mutable }}</ws:Number>' +
                    '</ws:Array>'
                );

                visitorHaveReturnedWith('visitComponent', html);
            });
            it('should generate mutable binding 10', () => {
                const html = toComponentWithOption('' +
                    '<ws:Array>' +
                        '<ws:String>{{ \'propertyName\' | mutable }}</ws:String>' +
                    '</ws:Array>'
                );

                visitorHaveReturnedWith('visitComponent', html);
            });
        });
        describe('check component merge type', () => {
            it('should be attribute for dynamic partial in root', () => {
                const html = toDynamicPartial();

                visitorHaveReturnedWith('visitDynamicPartial', html);
            });
            it('should be none for dynamic partial in element', () => {
                const html = `<div>${toDynamicPartial()}</div>`;

                visitorHaveReturnedWith('visitDynamicPartial', html);
            });

            it('should be attribute for static partial in root', () => {
                const html = toPartial('wml!A/b');

                visitorHaveReturnedWith('visitStaticPartial', html);
            });
            it('should be context for static partial in element', () => {
                const html = `<div>${toPartial('wml!A/b')}</div>`;

                visitorHaveReturnedWith('visitStaticPartial', html);
            });

            it('should be attribute for component in root', () => {
                const html = toComponent();

                visitorHaveReturnedWith('visitComponent', html);
            });
            it('should be context for component in element', () => {
                const html = `<div>${toComponent()}</div>`;

                visitorHaveReturnedWith('visitComponent', html);
            });
        });
    });
});
