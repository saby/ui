// import * as React from 'react';
// import { render, unmountComponentAtNode } from 'react-dom';
// import { renderToString } from 'react-dom/server';
import { TClosure } from 'UICore/Executor';

describe('Проверка передачи аргументов в шаблоны', () => {
    // beforeEach(() => {
    // });

    // afterEach(() => {
    // });

    describe('Распаковка', () => {
        const CONTEXT_BAR = { baz: 'baz' };
        const GENERATORCONFIG_CTX = { bar: 'bar' };
        const REF = {
            current: null
        };
        const data = {
            foo: 1,
            ['__$$attrs_tabIndex']: 0,
            ['__$$attrs_className']: 'class',
            ['__$$context_bar']: CONTEXT_BAR,
            ['__$$isvdom']: true,
            ['__$$forcecompatible']: undefined,
            ['__$$generatorconfig_ctx']: GENERATORCONFIG_CTX,
            ['__$$packedAttrs']: {
                ['__$$attrs_']: ['tabIndex', 'className'],
                ['__$$context_']: ['bar'],
                ['__$$generatorconfig_']: ['ctx']
            }
        };

        const [
            props,
            attr,
            context,
            isVdom,
            sets,
            forceCompatible,
            generatorConfig
        ] = TClosure.unpackTemplateAttrs(data, REF);

        it('props', () => {
            expect(props).toMatchObject({
                foo: 1,
                ref: REF
            });
        });
        it('attr', () => {
            expect(attr).toStrictEqual({
                tabIndex: 0,
                className: 'class'
            });
        });
        it('context', () => {
            expect(context).toStrictEqual({
                bar: CONTEXT_BAR
            });
        });
        it('isVdom', () => {
            expect(isVdom).toStrictEqual(true);
        });
        it('sets', () => {
            expect(sets).toStrictEqual(undefined);
        });
        it('forceCompatible', () => {
            expect(forceCompatible).toStrictEqual(undefined);
        });
        it('generatorConfig', () => {
            expect(generatorConfig).toStrictEqual({
                ctx: GENERATORCONFIG_CTX
            });
        });
    });

    describe('Упаковка', () => {
        const CONTEXT_BAR = { baz: 'baz' };
        const GENERATORCONFIG_CTX = { bar: 'bar' };
        const REF = {
            current: null
        };
        const expectedData = {
            foo: 1,
            ['__$$attrs_tabIndex']: 0,
            ['__$$attrs_className']: 'class',
            ['__$$context_bar']: CONTEXT_BAR,
            ['__$$isvdom']: true,
            ['__$$forcecompatible']: undefined,
            ['__$$generatorconfig_ctx']: GENERATORCONFIG_CTX,
            ['__$$packedAttrs']: {
                ['__$$attrs_']: ['tabIndex', 'className'],
                ['__$$context_']: ['bar'],
                ['__$$generatorconfig_']: ['ctx']
            }
        };

        const [data, ref] = TClosure.packTemplateAttrs(
            {
                foo: 1,
                ref: REF
            },
            {
                tabIndex: 0,
                className: 'class'
            },
            {
                bar: CONTEXT_BAR
            },
            true,
            undefined,
            undefined,
            {
                ctx: GENERATORCONFIG_CTX
            }
        );

        it('props', () => {
            expect(data).toStrictEqual(expectedData);
        });
        it('ref', () => {
            expect(ref).toStrictEqual(REF);
        });
    });
});
