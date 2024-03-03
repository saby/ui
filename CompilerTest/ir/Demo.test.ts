/* eslint-disable @typescript-eslint/no-magic-numbers,@typescript-eslint/no-shadow */

import Templates from './resources/Templates';

function invoke(fn: Function, data: object = {}): unknown[] {
    return fn(data, { }, { }, false);
}

describe('Compiler/IR', () => {
    it('should generate root tag', () => {
        expect(invoke(Templates.Element)).toMatchSnapshot();
    });

    describe('test conditional chain', function () {
        it('should generate body of if node', () => {
            const data = {
                ifCondition: true,
                elifCondition: false,
                userName: 'User'
            };

            expect(invoke(Templates.If, data)).toMatchSnapshot();
        });
        it('should generate body of elif node', () => {
            const data = {
                ifCondition: false,
                elifCondition: true,
                userName: 'User'
            };

            expect(invoke(Templates.If, data)).toMatchSnapshot();
        });
        it('should generate body of else node', () => {
            const data = {
                ifCondition: false,
                elifCondition: false,
                userName: 'User'
            };

            expect(invoke(Templates.If, data)).toMatchSnapshot();
        });
    });

    it('should iterate collection via for method', () => {
        const data = {
            userName: 'User',
            iterator: {
                init() {
                    this.index = 0;
                },
                test() {
                    return this.index < 3;
                },
                update() {
                    this.index++;
                },
                getText() {
                    return `Content of ${this.index} item`;
                }
            }
        };

        expect(invoke(Templates.For, data)).toMatchSnapshot();
    });
    it('should iterate collection via foreach method', () => {
        const data = {
            array: [111, 222, 333]
        };

        expect(invoke(Templates.Foreach, data)).toMatchSnapshot();
    });
    it('should generate inline template', () => {
        expect(invoke(Templates.InlineTemplate)).toMatchSnapshot();
    });
    it('should generate content option', () => {
        expect(invoke(Templates.ContentOption)).toMatchSnapshot();
    });
    it('should generate static partial template', () => {
        expect(invoke(Templates.StaticPartial)).toMatchSnapshot();
    });
    it('should generate dynamic partial template', () => {
        const data = {
            tmpl: Templates.Element
        };

        expect(invoke(Templates.StaticPartial, data)).toMatchSnapshot();
    });
    it('should generate dynamic inline template', () => {
        const data = {
            tmpl: 'inline'
        };

        expect(invoke(Templates.DynamicInline, data)).toMatchSnapshot();
    });
});
