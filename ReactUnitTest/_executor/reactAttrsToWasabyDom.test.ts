import { reactAttrsToWasabyDom } from 'UICore/_executor/_Markup/Attributes';

describe('reactAttrsToWasabyDom', () => {
    test('atributes is undefined', () => {
        expect(reactAttrsToWasabyDom(undefined)).toBeUndefined();
    });

    test('atributes is empty object', () => {
        expect(reactAttrsToWasabyDom({})).toEqual({});
    });

    test('atribute "className"', () => {
        const atributes = { className: 'classname' };
        expect(reactAttrsToWasabyDom(atributes)).toStrictEqual({
            class: 'classname',
        });
    });

    test('atribute "style"', () => {
        const atributes = { style: { width: '100px', fontSize: '16px' } };
        expect(reactAttrsToWasabyDom(atributes)).toStrictEqual({
            style: 'width:100px;font-size:16px',
        });
    });
});
