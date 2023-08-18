/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { IGenerator } from 'Compiler/_ir/generator/Interface';

import Chain from 'Compiler/_ir/generator/flow/Chain';
import { StandardController, InternalController } from 'Compiler/_ir/generator/flow/Controller';

describe('Compiler/_ir/generator/flow/Chain', () => {
    describe('using StandardController', () => {
        const controller = new StandardController();

        it('should exec if-node body', () => {
            const checked = [];

            const generator = {
                evalExpression(_: undefined, test: number) {
                    checked.push(test);

                    return test === 0;
                }
            } as IGenerator;

            const result = new Chain(controller.clone(), generator, undefined)
                .if(0, () => 0)
                .elif(1, () => 1)
                .elif(2, () => 2)
                .else(() => 3)
                .fi();

            expect(checked).toEqual([0]);
            expect(result).toEqual([0]);
        });
        it('should exec elif-node body', () => {
            const checked = [];

            const generator = {
                evalExpression(_: undefined, test: number) {
                    checked.push(test);

                    return test === 1;
                }
            } as IGenerator;
            const result = new Chain(controller.clone(), generator, undefined)
                .if(0, () => 0)
                .elif(1, () => 1)
                .elif(2, () => 2)
                .else(() => 3)
                .fi();

            expect(checked).toEqual([0, 1]);
            expect(result).toEqual([1]);
        });
        it('should exec else-node body', () => {
            const checked = [];

            const generator = {
                evalExpression(_: undefined, test: number) {
                    checked.push(test);

                    return false;
                }
            } as IGenerator;
            const result = new Chain(controller.clone(), generator, undefined)
                .if(0, () => 0)
                .elif(1, () => 1)
                .elif(2, () => 2)
                .else(() => 3)
                .fi();

            expect(checked).toEqual([0, 1, 2]);
            expect(result).toEqual([3]);
        });
        it('should return defaultAlternateValue in result', () => {
            const defaultAlternateValue = Object.freeze({ });

            const generator = {
                evalExpression: (_, __) => false
            } as IGenerator;

            const result = new Chain(controller.clone(), generator, undefined, defaultAlternateValue)
                .if(0, () => undefined)
                .fi();

            expect(result).toEqual([defaultAlternateValue]);
        });
    });
    describe.skip('using InternalController', () => {
        const controller = new InternalController();

        it('should exec only if-node body', () => {
            const checked = [];

            const generator = {
                evalExpression(_: undefined, test: number) {
                    checked.push(test);

                    return true;
                }
            } as IGenerator;
            const result = new Chain(controller.clone(), generator, undefined)
                .if(0, () => 0)
                .elif(1, () => 1)
                .elif(2, () => 2)
                .else(() => 3)
                .fi();

            expect(checked).toEqual([0, 1, 2]);
            expect(result).toEqual([0]);
        });
        it('should exec all bodies 1', () => {
            const checked = [];

            const generator = {
                evalExpression(_: undefined, test: number) {
                    checked.push(test);

                    return test === 0 ? true : undefined;
                }
            } as IGenerator;
            const result = new Chain(controller.clone(), generator, undefined)
                .if(0, () => 0)
                .elif(1, () => 1)
                .elif(2, () => 2)
                .else(() => 3)
                .fi();

            expect(checked).toEqual([0, 1, 2]);
            expect(result).toEqual([0, 1, 2, 3]);
        });
        it('should exec only elif-node body', () => {
            const checked = [];

            const generator = {
                evalExpression(_: undefined, test: number) {
                    checked.push(test);

                    return test === 1;
                }
            } as IGenerator;
            const result = new Chain(controller.clone(), generator, undefined)
                .if(0, () => 0)
                .elif(1, () => 1)
                .elif(2, () => 2)
                .else(() => 3)
                .fi();

            expect(checked).toEqual([0, 1, 2]);
            expect(result).toEqual([1]);
        });
        it('should exec all bodies 2', () => {
            const checked = [];

            const generator = {
                evalExpression(_: undefined, test: number) {
                    checked.push(test);

                    return test === 1 ? true : undefined;
                }
            } as IGenerator;
            const result = new Chain(controller.clone(), generator, undefined)
                .if(0, () => 0)
                .elif(1, () => 1)
                .elif(2, () => 2)
                .else(() => 3)
                .fi();

            expect(checked).toEqual([0, 1, 2]);
            expect(result).toEqual([0, 1, 2, 3]);
        });
        it('should exec only else-node body', () => {
            const checked = [];
            const generator = {
                evalExpression(_: undefined, test: number) {
                    checked.push(test);

                    return false;
                }
            } as IGenerator;
            const result = new Chain(controller.clone(), generator, undefined)
                .if(0, () => 0)
                .elif(1, () => 1)
                .elif(2, () => 2)
                .else(() => 3)
                .fi();

            expect(checked).toEqual([0, 1, 2]);
            expect(result).toEqual([3]);
        });
        it('should exec all bodies 3', () => {
            const checked = [];
            const generator = {
                evalExpression(_: undefined, test: number) {
                    checked.push(test);

                    return undefined;
                }
            } as IGenerator;
            const result = new Chain(controller.clone(), generator, undefined)
                .if(0, () => 0)
                .elif(1, () => 1)
                .elif(2, () => 2)
                .else(() => 3)
                .fi();

            expect(checked).toEqual([0, 1, 2]);
            expect(result).toEqual([0, 1, 2, 3]);
        });
        it('should exec all bodies after elif-node', () => {
            const checked = [];
            const generator = {
                evalExpression(_: undefined, test: number) {
                    checked.push(test);

                    if (test < 2) {
                        return false;
                    }

                    if (test === 2) {
                        return true;
                    }

                    return undefined;
                }
            } as IGenerator;
            const result = new Chain(controller.clone(), generator, undefined)
                .if(0, () => 0)
                .elif(1, () => 1)
                .elif(2, () => 2)
                .elif(3, () => 3)
                .else(() => 4)
                .fi();

            expect(checked).toEqual([0, 1, 2, 3]);
            expect(result).toEqual([2, 3, 4]);
        });
    });
});
