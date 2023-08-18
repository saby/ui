import {
    compileTemplateLiteral,
    createObject,
    compileOptionalChaining,
    createGenerator,
    ECMAScript2021,
    ECMAScript5,
} from 'Compiler/_compiler/codegen/ECMAScript';

describe('Compiler/_compiler/codegen/ECMAScript', () => {
    describe('compileTemplateLiteral()', () => {
        it('should compile string', () => {
            const templateLiteral = 'example';
            const string = compileTemplateLiteral(templateLiteral);

            expect(string).toEqual('"example"');
        });
        it('should compile template 1', () => {
            const templateLiteral = '${id}string';
            const string = compileTemplateLiteral(templateLiteral);

            expect(string).toEqual('id + "string"');
        });
        it('should compile template 2', () => {
            const templateLiteral = 'string${id}';
            const string = compileTemplateLiteral(templateLiteral);

            expect(string).toEqual('"string" + id');
        });
        it('should compile template 3', () => {
            const templateLiteral = '${a}string${b}';
            const string = compileTemplateLiteral(templateLiteral);

            expect(string).toEqual('a + "string" + b');
        });
        it('should compile template 4', () => {
            const templateLiteral = 'string${a}string${b}string';
            const string = compileTemplateLiteral(templateLiteral);

            expect(string).toEqual('"string" + a + "string" + b + "string"');
        });
        it('should compile template 5', () => {
            const templateLiteral = '${id}';
            const string = compileTemplateLiteral(templateLiteral);

            expect(string).toEqual('id');
        });
        it('should use parenthesis', () => {
            const templateLiteral = '${fn(a, b)}string${a + b}';
            const string = compileTemplateLiteral(templateLiteral);

            expect(string).toEqual('(fn(a, b)) + "string" + (a + b)');
        });
    });
    describe('createObject()', () => {
        it('should insert substitution', () => {
            const object = {
                '/*#PROPERTY#*/': undefined,
            };
            const string = createObject(object, true);

            expect(string).toEqual('{ /*#PROPERTY#*/ }');
        });
        it('should use dynamic property', () => {
            const object = {
                '[propertyName]': 123,
            };
            const string = createObject(object, true);

            expect(string).toEqual('{ [propertyName]: 123, }');
        });
        it('should ignore property with undefined value', () => {
            const object = {
                ignore: undefined,
                value: 123,
            };
            const string = createObject(object, true);

            expect(string).toEqual('{ "value": 123, }');
        });
    });
    describe('compileOptionalChaining()', () => {
        it('should compile optional chaining 1', () => {
            const memberExpression = 'a.b.c';
            const expression = compileOptionalChaining(memberExpression);

            expect(expression).toEqual('(a.b.c)');
        });
        it('should compile optional chaining 2', () => {
            const memberExpression = 'a?.b.c';
            const expression = compileOptionalChaining(memberExpression);

            expect(expression).toEqual('(a && a.b.c)');
        });
        it('should compile optional chaining 3', () => {
            const memberExpression = 'a?.b?.c';
            const expression = compileOptionalChaining(memberExpression);

            expect(expression).toEqual('(a && a.b && a.b.c)');
        });
        it('should compile optional chaining 4', () => {
            const memberExpression = 'a.b?.c';
            const expression = compileOptionalChaining(memberExpression);

            expect(expression).toEqual('(a.b && a.b.c)');
        });
    });
    describe('ES2021', () => {
        const generator = createGenerator(ECMAScript2021);

        it('should generate valid object', () => {
            const object = {
                '[prop]': 123,
                property: 'property',
                '/*#SUBSTITUTION#*/': undefined,
                'not-identifier': 'not-identifier',
                ignore: undefined,
            };

            expect(generator.genObject(object)).toEqual(
                '{ [prop]: 123, "property": property, /*#SUBSTITUTION#*/ "not-identifier": not-identifier, }'
            );
        });
        it('should generate valid arrow expression 1', () => {
            expect(generator.genArrowExpression('123')).toEqual('() => (123)');
        });
        it('should generate valid arrow expression 2', () => {
            expect(generator.genArrowExpression('a + b', ['a', 'b'])).toEqual('(a,b) => (a + b)');
        });
        it('should generate valid arrow function 1', () => {
            expect(generator.genArrowFunction('return 123;')).toEqual('() => { return 123; }');
        });
        it('should generate valid arrow function 2', () => {
            expect(generator.genArrowFunction('return a + b;', ['a', 'b'])).toEqual(
                '(a,b) => { return a + b; }'
            );
        });
        it('should generate string interpolation', () => {
            expect(generator.genStringInterpolation('_${value}_')).toEqual('`_${value}_`');
        });
        it('should generate optional chaining', () => {
            expect(generator.genOptionalChaining('a.b?.c?.d.e')).toEqual('(a.b?.c?.d.e)');
        });
        it('should generate nullish coalescing expression', () => {
            expect(generator.genNullishCoalescingOperator('value', 'true')).toEqual(
                '(value) ?? (true)'
            );
        });
        it('should generate dynamic object property', () => {
            expect(generator.genDynamicObjectProperty('property')).toEqual('[propertyDynamic]');
        });
        it('should generate dynamic object property accessor', () => {
            expect(generator.genDynamicObjectPropertyAccessor('object', 'property')).toEqual(
                'object[propertyDynamic]'
            );
        });
    });
    describe('ES5', () => {
        const generator = createGenerator(ECMAScript5);

        it('should generate valid object', () => {
            const object = {
                property: 'property',
                '/*#SUBSTITUTION#*/': undefined,
                'not-identifier': 'not-identifier',
                ignore: undefined,
            };

            expect(generator.genObject(object)).toEqual(
                '{ "property": property, /*#SUBSTITUTION#*/ "not-identifier": not-identifier, }'
            );
        });
        it('should throw an exception', () => {
            try {
                generator.genObject({ '[prop]': 123 });
            } catch (error) {
                expect(error.message).toEqual('Dynamic object properties are not supported in ES5');
                return;
            }

            throw new Error('Should catch an expection');
        });
        it('should generate valid arrow expression 1', () => {
            expect(generator.genArrowExpression('123')).toEqual('function(){ return 123; }');
        });
        it('should generate valid arrow expression 2', () => {
            expect(generator.genArrowExpression('a + b', ['a', 'b'])).toEqual(
                'function(a,b){ return a + b; }'
            );
        });
        it('should generate valid arrow function 1', () => {
            expect(generator.genArrowFunction('return 123;')).toEqual('function(){ return 123; }');
        });
        it('should generate valid arrow function 2', () => {
            expect(generator.genArrowFunction('return a + b;', ['a', 'b'])).toEqual(
                'function(a,b){ return a + b; }'
            );
        });
        it('should generate string interpolation', () => {
            expect(generator.genStringInterpolation('_${value}_')).toEqual('"_" + value + "_"');
        });
        it('should generate optional chaining', () => {
            expect(generator.genOptionalChaining('a.b?.c?.d.e')).toEqual(
                '(a.b && a.b.c && a.b.c.d.e)'
            );
        });
        it('should generate nullish coalescing expression', () => {
            expect(generator.genNullishCoalescingOperator('value', 'true')).toEqual(
                'typeof (value) === "undefined" ? (true) : (value)'
            );
        });
        it('should generate dynamic object property', () => {
            expect(generator.genDynamicObjectProperty('property')).toEqual('property');
        });
        it('should generate dynamic object property accessor', () => {
            expect(generator.genDynamicObjectPropertyAccessor('object', 'property')).toEqual(
                'object.property'
            );
        });
    });
});
