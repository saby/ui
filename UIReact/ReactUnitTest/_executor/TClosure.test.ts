import { Control } from 'UICore/Base';
import { TClosure } from 'UICore/Executor';

describe('TClosure', () => {
    describe('getContext', () => {
        /**
         * Проверка того, что метод getContext, вызываемый из шаблона, вернет инстанс контрола,
         * если в него придет объект, в прототипе (независимо от уровня "вложенности") у которого будет лежать контрол
         */
        test('control', () => {
            const ctrl = new Control({});
            const context1 = Object.create(ctrl);
            const context3 = Object.create(Object.create(context1));
            expect(TClosure.getContext(context1)).toBe(ctrl);
            expect(TClosure.getContext(context3)).toBe(ctrl);
        });

        test('object', () => {
            const obj = { some: 'data' };
            const context = Object.create(obj);
            expect(TClosure.getContext(context)).toBe(context);
        });
    });
});
