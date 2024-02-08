import createECMAScriptGenerator from 'Compiler/_compiler/irCodegen/generators/ECMAScript';
import Methods from 'Compiler/_compiler/irCodegen/generators/Methods';
import Symbols from 'Compiler/_compiler/irCodegen/generators/Symbols';

import { Parser } from 'Compiler/_compiler/expressions/Parser';
import { ECMAScript2021 } from 'Compiler/_compiler/irCodegen/generators/ECMAScript';

import {
    BindGenerator,
    EventGenerator,
    ExpressionGenerator
} from 'Compiler/_compiler/irCodegen/Mustache';
import createFormatter from 'Compiler/_compiler/irCodegen/generators/Formatter';

const source = {
    self: 'this',
    data: 'data',
    funcContext: 'funcContext',
    context: 'context',
    children: 'children'
};
const symbols = new Symbols('', false);
const formatter = createFormatter(0, false);
const ecmaScript = createECMAScriptGenerator(ECMAScript2021);

describe('Compiler/_compiler/irCodegen/Mustache', () => {
    const parser = new Parser();
    const methods = new Methods(formatter, 'methods', false);

    describe('class BindGenerator', () => {
        const generator = new BindGenerator(methods, ecmaScript, symbols, source);

        it('should generate bind with identifier', () => {
            const input = 'identifier';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data,
                setterValue: 'value'
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => (' +
                    'methods.setter(data, ["identifier"], value)' +
                ')'
            );
        });
        it('should generate bind with member expression', () => {
            const input = 'data.property.identifier';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data,
                setterValue: 'value',
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => (' +
                    'methods.setter(data, ["data", "property", "identifier"], value)' +
                ')'
            );
        });
        it('should generate bind with computed property in member expression', () => {
            const input = 'data["property"].identifier';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data,
                setterValue: 'value'
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => (' +
                    'methods.setter(data, ["data", "property", "identifier"], value)' +
                ')'
            );
        });
        it('should generate bind with computed property in member expression 2', () => {
            const input = 'data[property].identifier';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data,
                setterValue: 'value'
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => (' +
                    'methods.setter(data, [' +
                        '"data", ' +
                        'methods.getter(data, ["property"]), ' +
                        '"identifier"' +
                    '], value)' +
                ')'
            );
        });
        it('should generate bind with conditional expression in member expression', () => {
            const input = 'data[condition ? first : second].identifier';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data,
                setterValue: 'value'
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => (' +
                    'methods.setter(data, [' +
                        '"data", ' +
                        '(methods.getter(data, ["condition"]) ' +
                            '? methods.getter(data, ["first"]) ' +
                            ': methods.getter(data, ["second"])' +
                        '), ' +
                        '"identifier"' +
                    '], value)' +
                ')'
            );
        });
        it('should generate bind with function call in member expression', () => {
            const input = 'data[property.fn()].identifier';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data,
                setterValue: 'value'
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => (' +
                    'methods.setter(data, [' +
                        '"data", ' +
                        'methods.call2(data, ["property", "fn"]), ' +
                        '"identifier"' +
                    '], value)' +
                ')'
            );
        });
        it('should generate bind on _options', () => {
            const input = '_options.record.field';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data,
                setterValue: 'value',
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => (' +
                    'methods.setter(data, ["_options", "record", "field"], value)' +
                ')'
            );
        });

        describe('stress cases', () => {
            const attempt = (input) => {
                return () => {
                    const program = parser.parse(input);
                    const context = {
                        dataSource: source.data,
                        setterValue: 'value',
                    };

                    return program.accept(generator, context);
                };
            };

            it('should fail with literal', () => {
                expect(attempt('123')).toThrowError(
                    'запрещено выполнять bind на литералы'
                );
            });
            it('should fail with binary operator', () => {
                expect(attempt('a + b')).toThrowError(
                    'запрещено использовать бинарный оператор в корне bind-выражения'
                );
            });
            it('should fail with logical operator', () => {
                expect(attempt('a && b')).toThrowError(
                    'запрещено использовать логический оператор в корне bind-выражения'
                );
            });
            it('should fail with unary operator', () => {
                expect(attempt('-a')).toThrowError(
                    'запрещено использовать унарный оператор в корне bind-выражения'
                );
            });
            it('should fail with conditional expression', () => {
                expect(attempt('a ? b : c')).toThrowError(
                    'запрещено использовать тернарный оператор в корне bind-выражения'
                );
            });
            it('should fail with array declaration', () => {
                expect(attempt('[a]')).toThrowError(
                    'запрещено объявлять массив в корне bind-выражения'
                );
            });
            it('should fail with object declaration', () => {
                expect(attempt('{ a: 123 }')).toThrowError(
                    'запрещено объявлять объект в корне bind-выражения'
                );
            });
            it('should fail with property on _options', () => {
                expect(attempt('_options.property')).toThrowError(
                    'запрещено использовать bind на свойства объекта _options: данный объект заморожен'
                );
            });
        });
    });

    describe('class EventGenerator', () => {
        const generator = new EventGenerator(methods, ecmaScript, symbols, source);

        it('should generate function handler', () => {
            const input = 'handler()';
            const program = parser.parse(input);
            const context = {
                dataSource: source.self
            };
            const result = generator.generate(program, context);

            expect(result.body).toEqual('' +
                'function(methods, data) { ' +
                    'return methods.getter(this, ["handler"]); ' +
                '}'
            );
            expect(result.args.map(arg => arg.body)).toEqual([]);
            expect(result.handlerName).toEqual('handler');
            expect(result.context).toEqual('function() { return this; }');
        });
        it('should generate function handler with arguments', () => {
            const input = 'handler(arg)';
            const program = parser.parse(input);
            const context = {
                dataSource: source.self
            };
            const result = generator.generate(program, context);

            expect(result.body).toEqual('' +
                'function(methods, data) { return methods.getter(this, ["handler"]); }'
            );
            expect(result.args.map(arg => arg.body)).toEqual([
                '(methods, data) => (methods.getter(data, ["arg"]))'
            ]);
            expect(result.handlerName).toEqual('handler');
            expect(result.context).toEqual('function() { return this; }');
        });
        it('should generate function handler with arguments 2', () => {
            const input = 'handler("string")';
            const program = parser.parse(input);
            const context = {
                dataSource: source.self
            };
            const result = generator.generate(program, context);

            expect(result.body).toEqual('' +
                'function(methods, data) { ' +
                    'return methods.getter(this, ["handler"]); ' +
                '}'
            );
            expect(result.args.map(arg => arg.body)).toEqual([
                '"string"'
            ]);
            expect(result.handlerName).toEqual('handler');
            expect(result.context).toEqual('function() { return this; }');
        });
        it('should generate member expression handler', () => {
            const input = 'data.property.handler(arg, true)';
            const program = parser.parse(input);
            const context = {
                dataSource: source.self
            };
            const result = generator.generate(program, context);

            expect(result.body).toEqual('' +
                'function(methods, data) { ' +
                    'return methods.getter(this, ["data", "property", "handler"]); ' +
                '}'
            );
            expect(result.args.map(arg => arg.body)).toEqual([
                '(methods, data) => (methods.getter(data, ["arg"]))',
                'true'
            ]);
            expect(result.handlerName).toEqual('handler');
            expect(result.context).toEqual('' +
                'function(methods, data) { ' +
                    'return methods.getter(this, ["data", "property"]); ' +
                '}'
            );
        });
        it('should generate member expression handler with braces', () => {
            const input = '(data.property.handler)(arg, true)';
            const program = parser.parse(input);
            const context = {
                dataSource: source.self
            };
            const result = generator.generate(program, context);

            expect(result.body).toEqual('' +
                'function(methods, data) { ' +
                    'return (methods.getter(this, ["data", "property", "handler"])); ' +
                '}'
            );
            expect(result.args.map(arg => arg.body)).toEqual([
                '(methods, data) => (methods.getter(data, ["arg"]))',
                'true'
            ]);
            expect(result.handlerName).toEqual('handler');
            expect(result.context).toEqual('' +
                'function(methods, data) { ' +
                    'return methods.getter(this, ["data", "property"]); ' +
                '}'
            );
        });
        it('should generate handler with name similar to child name', () => {
            const input = 'handler()';
            const program = parser.parse(input);
            const context = {
                dataSource: source.self,
                checkChildren: true,
                children: ['handler']
            };
            const result = generator.generate(program, context);

            expect(result.body).toEqual('' +
                'function(methods, data) { ' +
                    'return methods.getter(this, ["handler"]); ' +
                '}'
            );
            expect(result.args.map(arg => arg.body)).toEqual([]);
            expect(result.handlerName).toEqual('handler');
            expect(result.context).toEqual('function() { return this; }');
        });
        it('should generate handler from child context', () => {
            const input = 'child.handler()';
            const program = parser.parse(input);
            const context = {
                dataSource: source.self,
                checkChildren: true,
                children: ['child']
            };
            const result = generator.generate(program, context);

            expect(result.body).toEqual('' +
                '(methods, data, funcContext, context, children) => (' +
                    'methods.getter(children, ["child", "handler"])' +
                ')'
            );
            expect(result.args.map(arg => arg.body)).toEqual([]);
            expect(result.handlerName).toEqual('handler');
            expect(result.context).toEqual('' +
                '(methods, data, funcContext, context, children) => (methods.getter(children, ["child"]))'
            );
        });
        it('should generate handler with argument from child context', () => {
            const input = 'handler(value, child.value)';
            const program = parser.parse(input);
            const context = {
                dataSource: source.self,
                checkChildren: true,
                children: ['child']
            };
            const result = generator.generate(program, context);

            expect(result.body).toEqual('' +
                'function(methods, data) { ' +
                    'return methods.getter(this, ["handler"]); ' +
                '}'
            );
            expect(result.args.map(arg => arg.body)).toEqual([
                '(methods, data) => (methods.getter(data, ["value"]))',
                '(methods, data) => (methods.getter(data, ["child", "value"]))'
            ]);
            expect(result.handlerName).toEqual('handler');
            expect(result.context).toEqual('function() { return this; }');
        });
    });

    describe('class ExpressionGenerator', () => {
        const generator = new ExpressionGenerator(methods, ecmaScript, symbols, source);

        it('should generate number literal', () => {
            const input = '123.45';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual(input);
        });
        it('should generate null literal', () => {
            const input = 'null';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual(input);
        });
        it('should generate undefined literal', () => {
            const input = 'undefined';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual(input);
        });
        it('should generate boolean literal', () => {
            const input = 'true';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual(input);
        });
        it('should generate single quoted string literal', () => {
            const program = parser.parse("'string'");
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('"string"');
        });
        it('should generate double quoted string literal', () => {
            const program = parser.parse('"string"');
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('"string"');
        });
        it('should generate string literal with escape characters', () => {
            const program = parser.parse('"aaa\\\\bbb\\"ccc"');
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('"aaa\\\\\\\\bbb\\\\\\"ccc"');
        });
        it('should generate string literal with double quotes', () => {
            // "aaa\\\"bbb\\\"ccc"
            const program = parser.parse('"aaa\\"bbb\\"ccc"');
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('"aaa\\\\\\"bbb\\\\\\"ccc"');
        });
        it('should generate unary operator', () => {
            const program = parser.parse('-identifier');
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('(methods, data) => (' +
                    '-methods.getter(data, ["identifier"])' +
                ')'
            );
        });
        it('should generate binary operator', () => {
            const program = parser.parse('left + right');
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => (' +
                    'methods.getter(data, ["left"]) + methods.getter(data, ["right"])' +
                ')'
            );
        });
        it('should generate braces', () => {
            const program = parser.parse('(a + b) * c');
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => (' +
                    '(methods.getter(data, ["a"]) + methods.getter(data, ["b"])) * methods.getter(data, ["c"])' +
                ')'
            );
        });
        it('should generate member expression', () => {
            const program = parser.parse('a.b.c');
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => (' +
                    'methods.getter(data, ["a", "b", "c"])' +
                ')'
            );
        });
        it('should generate computed member expression', () => {
            const program = parser.parse('a[b].c["d"].e');
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => (' +
                    'methods.getter(data, [' +
                        '"a", ' +
                        'methods.getter(data, ["b"]), ' +
                        '"c", ' +
                        '"d", ' +
                        '"e"' +
                    '])' +
                ')'
            );
        });
        it('should generate conditional expression', () => {
            const program = parser.parse('a ? b : c');
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => ((' +
                    'methods.getter(data, ["a"])' +
                    ' ? methods.getter(data, ["b"])' +
                    ' : methods.getter(data, ["c"])' +
                '))'
            );
        });
        it('should generate conditional expression 2', () => {
            const program = parser.parse('a ? b');
            const context = {
                dataSource: source.data,
                defaultAlternateValue: '""'
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => ((' +
                    'methods.getter(data, ["a"])' +
                    ' ? methods.getter(data, ["b"])' +
                    ' : ""' +
                '))'
            );
        });
        it('should generate conditional expression 3', () => {
            const program = parser.parse('a ? b');
            const context = {
                dataSource: source.data,
                defaultAlternateValue: 'undefined'
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => ((' +
                'methods.getter(data, ["a"])' +
                ' ? methods.getter(data, ["b"])' +
                ' : undefined' +
                '))'
            );
        });
        it('should generate conditional expression 4', () => {
            const program = parser.parse('(a ? b) + c');
            const context = {
                dataSource: source.data,
                defaultAlternateValue: 'undefined'
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => (' +
                    '((methods.getter(data, ["a"]) ? methods.getter(data, ["b"]) : "")) + methods.getter(data, ["c"])' +
                ')'
            );
        });
        it('should generate array', () => {
            const input = '[1, 2.3, true, undefined, null, "string"]';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual(input);
        });
        it('should generate array 2', () => {
            const input = '[1, 2.3, true, undefined, null, "string", identifier]';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => (' +
                    '[1, 2.3, true, undefined, null, "string", methods.getter(data, ["identifier"])]' +
                ')'
            );
        });
        it('should generate object', () => {
            const input = '{ "a": 1, "b": 2.3, "c": true, "d": undefined, "e": null, "f": "string", "g": { } }';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual(input);
        });
        it('should generate object 2', () => {
            const input = '{ "a": 1, "b": 2.3, "c": true, "d": undefined, "e": null, "f": "string", "g": identifier }';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => ({ ' +
                    '"a": 1, ' +
                    '"b": 2.3, ' +
                    '"c": true, ' +
                    '"d": undefined, ' +
                    '"e": null, ' +
                    '"f": "string", ' +
                    '"g": methods.getter(data, ["identifier"]) ' +
                '})'
            );
        });
        it('should generate call expression', () => {
            const input = 'fn(a, b.c)';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data, funcContext) => (' +
                    'methods.call(' +
                        'funcContext, ' +
                        'data, ' +
                        '["fn"], ' +
                        '[' +
                            'methods.getter(data, ["a"]), ' +
                            'methods.getter(data, ["b", "c"])' +
                        ']' +
                    ')' +
                ')'
            );
        });
        it('should generate call expression with no arguments', () => {
            const input = 'fn()';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data, funcContext) => (' +
                    'methods.call(' +
                        'funcContext, ' +
                        'data, ' +
                        '["fn"]' +
                    ')' +
                ')'
            );
        });
        it('should generate call expression with member expression', () => {
            const input = 'a.b.c.fn(d, e.f)';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => (' +
                    'methods.call2(' +
                        'data, ' +
                        '["a", "b", "c", "fn"], ' +
                        '[' +
                            'methods.getter(data, ["d"]), ' +
                            'methods.getter(data, ["e", "f"])' +
                        ']' +
                    ')' +
                ')'
            );
        });
        it('should generate call expression with member expression 2', () => {
            const input = 'd().e()';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data, funcContext) => (' +
                    'methods.call2(methods.call(funcContext, data, ["d"]), ["e"])' +
                ')'
            );
        });
        it('should generate call expression with member expression 3', () => {
            const input = 'f.g().h()';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => (' +
                    'methods.call2(methods.call2(data, ["f", "g"]), ["h"])' +
                ')'
            );
        });
        it('should generate call expression with member expression 4', () => {
            const input = 'i[j()].k()';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data, funcContext) => (' +
                    'methods.call2(data, ["i", methods.call(funcContext, data, ["j"]), "k"])' +
                ')'
            );
        });
        it('should generate decorator', () => {
            const input = 'value|first|second|third';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data) => (' +
                    'methods.decorate(' +
                        '"third", ' +
                        '[' +
                            'methods.decorate(' +
                                '"second", ' +
                                '[' +
                                    'methods.decorate(' +
                                        '"first", ' +
                                        '[' +
                                            'methods.getter(data, ["value"])' +
                                        ']' +
                                    ')' +
                                ']' +
                            ')' +
                        ']' +
                    ')' +
                ')'
            );
        });
        it('should generate decorator 2', () => {
            const input = 'a(b) | sanitize';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data, funcContext) => (' +
                    'methods.sanitize(methods.decorate("sanitize", [' +
                        'methods.call(funcContext, data, ["a"], [methods.getter(data, ["b"])])' +
                    ']))' +
                ')'
            );
        });
        it('should generate bind decorator', () => {
            const input = 'identifier|bind:false';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data,
                attributeName: 'caption',
                bindings: [],
            };
            const meta = generator.generate(program, context);

            expect(meta.bindings).toEqual([{
                bindNonExistent: true,
                direction: {
                    body: '"fromContext"',
                    isTableFunction: false,
                    shouldEscape: false
                },
                fieldName: {
                    body: '(methods, data) => (methods.getter(data, ["identifier"]))',
                    flags: {
                        alwaysTableFunction: false,
                        hasChildrenReference: false,
                        hasContextReference: false,
                        hasDebugReference: false,
                        hasFuncContextReference: false,
                        hasMethodsReference: true,
                        hasSelfReference: false,
                        hasTranslationReference: false
                    },
                    isTableFunction: true,
                    program: 'identifier',
                    shouldEscape: false
                },
                fullPropName: 'caption',
                oneWay: true,
                propName: 'caption',
                propPath: [],
                propPathStr: ''
            }]);

            expect(meta.body).toEqual('false');
            expect(meta.isTableFunction).toBeFalsy();
        });
        it('should generate bind decorator 2', () => {
            const input = "identifier|bind:false,'fromProperty'";
            const program = parser.parse(input);
            const context = {
                dataSource: source.data,
                attributeName: 'caption',
                bindings: [],
            };
            const meta = generator.generate(program, context);

            expect(meta.bindings).toEqual([{
                bindNonExistent: true,
                direction: {
                    body: '"fromProperty"',
                    flags: {
                        alwaysTableFunction: false,
                        hasChildrenReference: false,
                        hasContextReference: false,
                        hasDebugReference: false,
                        hasFuncContextReference: false,
                        hasMethodsReference: false,
                        hasSelfReference: false,
                        hasTranslationReference: false
                    },
                    isTableFunction: false,
                    program: "'fromProperty'",
                    shouldEscape: false
                },
                fieldName: {
                    body: '(methods, data) => (methods.getter(data, ["identifier"]))',
                    flags: {
                        alwaysTableFunction: false,
                        hasChildrenReference: false,
                        hasContextReference: false,
                        hasDebugReference: false,
                        hasFuncContextReference: false,
                        hasMethodsReference: true,
                        hasSelfReference: false,
                        hasTranslationReference: false
                    },
                    isTableFunction: true,
                    program: 'identifier',
                    shouldEscape: false
                },
                fullPropName: 'caption',
                oneWay: true,
                propName: 'caption',
                propPath: [],
                propPathStr: ''
            }]);

            expect(meta.body).toEqual('false');
            expect(meta.isTableFunction).toBeFalsy();
        });
        it('should generate mutable decorator', () => {
            const input = 'identifier|mutable:false';
            const program = parser.parse(input);
            const context = {
                dataSource: source.data,
                attributeName: 'caption',
                bindings: [],
            };
            const meta = generator.generate(program, context);

            expect(meta.bindings).toEqual([{
                bindNonExistent: true,
                direction: {
                    body: '"fromContext"',
                    isTableFunction: false,
                    shouldEscape: false
                },
                fieldName: {
                    body: '(methods, data) => (methods.getter(data, ["identifier"]))',
                    flags: {
                        alwaysTableFunction: false,
                        hasChildrenReference: false,
                        hasContextReference: false,
                        hasDebugReference: false,
                        hasFuncContextReference: false,
                        hasMethodsReference: true,
                        hasSelfReference: false,
                        hasTranslationReference: false
                    },
                    isTableFunction: true,
                    program: 'identifier',
                    shouldEscape: false
                },
                fullPropName: 'caption',
                oneWay: false,
                propName: 'caption',
                propPath: [],
                propPathStr: ''
            }]);

            expect(meta.body).toEqual('false');
            expect(meta.isTableFunction).toBeFalsy();
        });
        it('should generate children data source', () => {
            const program = parser.parse('child.fn(child.name, value)');
            const context = {
                dataSource: source.data,
                checkChildren: true,
                children: ['child'],
            };
            const meta = generator.generate(program, context);

            expect(meta.body).toEqual('' +
                '(methods, data, funcContext, context, children) => (' +
                    'methods.call2(' +
                        'children, ' +
                        '["child", "fn"], ' +
                        '[' +
                            'methods.getter(children, ["child", "name"]), ' +
                            'methods.getter(data, ["value"])' +
                        ']' +
                    ')' +
                ')'
            );
        });

        describe('special identifiers resolution', () => {
            it('should generate this', () => {
                const input = 'this';
                const program = parser.parse(input);
                const context = {
                    dataSource: source.data
                };
                const meta = generator.generate(program, context);

                expect(meta.flags.hasSelfReference).toBeTruthy();

                expect(meta.body).toEqual('' +
                    'function() { return this; }'
                );
            });
            it('should generate rk', () => {
                const input = 'rk("text", "context")';
                const program = parser.parse(input);
                const context = {
                    dataSource: source.data
                };
                const meta = generator.generate(program, context);

                expect(meta.flags.hasTranslationReference).toBeTruthy();

                expect(meta.body).toEqual('' +
                    'rk("text", "context")'
                );
            });
            it('should generate debug', () => {
                const input = 'debug()';
                const program = parser.parse(input);
                const context = {
                    dataSource: source.data
                };
                const meta = generator.generate(program, context);

                expect(meta.flags.hasDebugReference).toBeTruthy();

                expect(meta.body).toEqual('debug()');
            });
            it('should generate dots', () => {
                const input = '...';
                const program = parser.parse(input);
                const context = {
                    dataSource: source.data,
                    allowDots: true
                };
                const meta = generator.generate(program, context);

                expect(meta.body).toEqual('' +
                    '(methods, data) => (methods.dots(data))'
                );
            });
            it('should generate dots in complex expression', () => {
                const input = 'fn(...).value';
                const program = parser.parse(input);
                const context = {
                    dataSource: source.data,
                    allowDots: true
                };
                const meta = generator.generate(program, context);

                expect(meta.body).toEqual('' +
                    '(methods, data, funcContext) => (' +
                        'methods.getter(' +
                            'methods.call(funcContext, data, ["fn"], [methods.dots(data)]), ' +
                            '["value"]' +
                        ')' +
                    ')'
                );
            });
            it('should generate undefined', () => {
                const input = 'undefined';
                const program = parser.parse(input);
                const context = {
                    dataSource: source.data
                };
                const meta = generator.generate(program, context);

                expect(meta.body).toEqual('undefined');
            });
            it('should generate null', () => {
                const input = 'null';
                const program = parser.parse(input);
                const context = {
                    dataSource: source.data
                };
                const meta = generator.generate(program, context);

                expect(meta.body).toEqual('null');
            });
            it('should generate getResourceUrl', () => {
                const input = 'getResourceUrl("url/to/source")';
                const program = parser.parse(input);
                const context = {
                    dataSource: source.data
                };
                const meta = generator.generate(program, context);

                expect(meta.body).toEqual('' +
                    '(methods, data) => (' +
                        'methods.getResourceURL("url/to/source")' +
                    ')'
                );
            });
            it('should generate __setHTMLUnsafe', () => {
                const input = '__setHTMLUnsafe(identifier)';
                const program = parser.parse(input);
                const context = {
                    dataSource: source.data
                };
                const meta = generator.generate(program, context);

                expect(meta.body).toEqual('' +
                    '(methods, data) => (' +
                        'methods.getter(data, ["identifier"])' +
                    ')'
                );
            });
            it('should resolve context', () => {
                const input = 'context.property';
                const program = parser.parse(input);
                const context = {
                    dataSource: source.data
                };
                const meta = generator.generate(program, context);

                expect(meta.body).toEqual('' +
                    '(methods, data, funcContext, context) => (' +
                        'methods.getter(' +
                            '(!methods.getter(data, ["context"]) ? context : methods.getter(data, ["context"])), ' +
                            '["property"]' +
                        ')' +
                    ')'
                );
            });
            it('should resolve context 2', () => {
                const input = 'context.fn(true, identifier)';
                const program = parser.parse(input);
                const context = {
                    dataSource: source.data
                };
                const meta = generator.generate(program, context);

                expect(meta.body).toEqual('' +
                    '(methods, data, funcContext, context) => (' +
                        'methods.call2(' +
                            '(!methods.getter(data, ["context"]) ? context : methods.getter(data, ["context"])), ' +
                            '["fn"], ' +
                            '[true, methods.getter(data, ["identifier"])]' +
                        ')' +
                    ')'
                );
            });
        });
    });
});
