/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * В данном наборе проверяется корректность работы режима релиза:
 * - функция-алиас вызывает полную функцию с теми же параметрами (для классов);
 * - функция-алиас является полной функцией (для модулей).
 */

import type { IGenerator } from 'Compiler/_ir/generator/Interface';
import type { IMethods } from 'Compiler/_ir/methods/Interface';

import Aliases from 'Compiler/_compiler/irCodegen/Aliases';

import * as IR from 'Compiler/IR';

import MarkupGenerator from 'Compiler/_ir/generator/impl/Markup';
import MarkupMethods from 'Compiler/_ir/methods/impl/Markup';

import InternalMethods from 'Compiler/_ir/methods/impl/Markup';

function getParametersCount(fn: Function): number {
    const result = /\w+\(([^)]*)\)/g.exec(fn.toString());

    if (!result) {
        throw new Error('Invalid function (no function detected)');
    }

    if (!result[1]) {
        return 0;
    }

    return result[1].split(',').length;
}

function createParameters(fn: Function): number[] {
    const count = getParametersCount(fn);

    return [...Array(count).keys()];
}

function testMethod<InstanceType>(instance: InstanceType, name: string, alias: string) {
    return () => {
        const parameters = createParameters(instance[alias]);

        const fn = jest.spyOn<InstanceType, any>(instance, name).mockImplementation();

        // Проверяется, что
        // - при вызове алиаса вызывается функция по полному имени;
        // - конечная функция вызывается с тем же порядком и количеством аргументов.
        expect(fn).not.toBeCalled();
        instance[alias](...parameters);
        expect(fn).toBeCalledWith(...parameters);
    };
}

describe('Compiler/_compiler/irCodegen/Synonyms', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('Compiler/IR', () => {
        for (const [name, alias] of Aliases.ENTRY_POINT_ALIASES) {
            it(`"${alias}" should be equal to "${name}"`, () => {
                // Функция под полным именем вообще экспортируется
                expect(typeof IR[name]).toStrictEqual('function');

                // Имеем одну и ту же функцию под разными именами
                expect(IR[name]).toStrictEqual(IR[alias]);
            });
        }
    });
    describe('Compiler/_ir/generator/Generator', () => {
        describe('Compiler/_ir/generator/impl/Markup', () => {
            const markup = new MarkupGenerator(undefined);

            for (const [name, alias] of Aliases.GENERATOR_ALIASES) {
                it(`method "${alias}" should redirect to "${name}"`, testMethod<IGenerator>(markup, name, alias));
            }
        });
    });
    describe('Compiler/_ir/methods/Methods', () => {
        describe('Compiler/_ir/methods/impl/Markup', () => {
            const markup = new MarkupMethods();

            for (const [name, alias] of Aliases.METHODS_ALIASES) {
                it(`method "${alias}" should redirect to "${name}"`, testMethod<IMethods>(markup, name, alias));
            }
        });
        describe('Compiler/_ir/methods/impl/Internal', () => {
            const internal = new InternalMethods();

            for (const [name, alias] of Aliases.METHODS_ALIASES) {
                it(`method "${alias}" should redirect to "${name}"`, testMethod<IMethods>(internal, name, alias));
            }
        });
    });
});
