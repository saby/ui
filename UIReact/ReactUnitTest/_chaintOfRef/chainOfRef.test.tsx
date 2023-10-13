/**
 * @jest-environment jsdom
 */
import { assert } from 'chai';
import { ChainOfRef, CreateOriginRef } from 'UICore/Ref';
import { CustomRef } from './Refs/CustomRef';

describe('Тестирование цепочки ответственностей', () => {
    let container;

    beforeEach(() => {
        /*
        _afterMount и _afterUpdate зовутся в отдельной таске, чтобы браузер мог отрисовать кадр.
        Чтобы не делать тесты асинхронными, мы просто мокнем таймеры и сами будем управлять временем.
         */
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
        container = null;
    });

    describe('Проверяем цепочку из одной ответственности ', () => {
        it('Добавление в цепочку', () => {
            const customRef = new CustomRef();
            const chainOfRef = new ChainOfRef();
            chainOfRef.add(customRef);
            assert.deepEqual(chainOfRef.handlers, [customRef]);
        });

        it('Добавление пустого рефа в цепочку', () => {
            const nullRef = new CreateOriginRef(null);
            const undefinedRef = new CreateOriginRef(undefined);
            const chainOfRef = new ChainOfRef();
            chainOfRef.add(nullRef);
            chainOfRef.add(undefinedRef);
            assert.deepEqual(chainOfRef.handlers, [nullRef, undefinedRef]);
        });

        it('Выполнение цепочки пустых рефов', () => {
            const nullRef = new CreateOriginRef(null);
            const undefinedRef = new CreateOriginRef(undefined);
            const chainOfRef = new ChainOfRef();
            chainOfRef.add(nullRef);
            chainOfRef.add(undefinedRef);
            assert.doesNotThrow(() => {
                chainOfRef.execute()(container);
            });
        });

        it('Выполнение цепочки', () => {
            const customRef = new CustomRef();
            const chainOfRef = new ChainOfRef();
            chainOfRef.add(customRef);
            chainOfRef.execute()(container);
            assert.equal(container.count, 0);
        });
    });

    describe('Проверяем цепочку из нескольких ответственностей ', () => {
        it('Добавление в цепочку', () => {
            const customRef0 = new CustomRef();
            const customRef1 = new CustomRef();
            const customRef2 = new CustomRef();
            const chainOfRef = new ChainOfRef();
            chainOfRef.add(customRef0);
            chainOfRef.add(customRef1);
            chainOfRef.add(customRef2);
            assert.deepEqual(chainOfRef.handlers, [
                customRef0,
                customRef1,
                customRef2,
            ]);
        });

        it('Добавление в цепочку 2', () => {
            const customRef0 = new CustomRef();
            const customRef1 = new CustomRef();
            const customRef2 = new CustomRef();
            const chainOfRef = new ChainOfRef();
            chainOfRef.add(customRef0).add(customRef1).add(customRef2);
            assert.deepEqual(chainOfRef.handlers, [
                customRef0,
                customRef1,
                customRef2,
            ]);
        });

        it('Выполнение цепочки', () => {
            const customRef0 = new CustomRef();
            const customRef1 = new CustomRef();
            const customRef2 = new CustomRef();
            const chainOfRef = new ChainOfRef();
            chainOfRef.add(customRef0).add(customRef1).add(customRef2);
            chainOfRef.execute()(container);
            assert.equal(container.count, 2);
        });
    });
});
