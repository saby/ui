import { assert } from 'chai';

import { GeneratorBase } from 'UICore/Executor';

describe('Generator Base', () => {
    describe('Bind Check', () => {
        const fakeEvent = {
            bindValue: '',
            data: null,
            handler: () => { return; },
            isControl: true,
            viewController: null
        };
        let res = null;
        beforeEach(() =>  {
            fakeEvent.data = null;
            fakeEvent.bindValue = '';
            res = null;
        });
        afterEach(() =>  {
            fakeEvent.data = null;
            fakeEvent.bindValue = '';
            res = null;
        });
        it('bind simple', () => {
            fakeEvent.data = {data: 0, anyProp: 0};
            fakeEvent.bindValue = 'data';
            res = GeneratorBase.checkBindValue(fakeEvent, fakeEvent.bindValue);
            assert.isTrue(res);
        });
        it('bind object', () => {
            fakeEvent.data = {data: {value: 0}, anyProp: 0};
            fakeEvent.bindValue = 'data.value';
            res = GeneratorBase.checkBindValue(fakeEvent, fakeEvent.bindValue);
            assert.isTrue(res);
        });
        it('bind array of object', () => {
            fakeEvent.data = {data: [{value: 0}, {value: 0}, {value: 0}], anyProp: 0};
            fakeEvent.bindValue = 'data.value';
            res = GeneratorBase.checkBindValue(fakeEvent, fakeEvent.bindValue);
            assert.isTrue(res);
        });
        it('bind array of object with sub props', () => {
            fakeEvent.data = {data: [{sub: {value: 0}, value: 0}], anyProp: 0};
            fakeEvent.bindValue = 'data.value';
            res = GeneratorBase.checkBindValue(fakeEvent, fakeEvent.bindValue);
            assert.isTrue(res);
        });
        it('bind array of object with sub props wrong', () => {
            fakeEvent.data = {data: [{sub: {value: 0}, value: 0}, {type: {value: 0}, value: 0}, {type: 0}], anyProp: 0};
            fakeEvent.bindValue = 'data.sub.value';
            res = GeneratorBase.checkBindValue(fakeEvent, fakeEvent.bindValue);
            assert.isFalse(res);
        });
        it('bind array of object wrong', () => {
            fakeEvent.data = {data: [{type: 0}], anyProp: 0};
            fakeEvent.bindValue = 'data.value';
            res = GeneratorBase.checkBindValue(fakeEvent, fakeEvent.bindValue);
            assert.isFalse(res);
        });
    });

});
