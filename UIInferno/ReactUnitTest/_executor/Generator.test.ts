import { assert } from 'chai';

import { GeneratorBase } from 'UICore/Executor';
import TestControlSync from 'ReactUnitTest/_executor/FakeControl';

describe('Generator Base', () => {
    describe('Bind Check', () => {
        const fakeEvent = {
            bindValue: '',
            data: null,
            handler: () => { return; },
            isControl: true,
            viewController: null
        };
        let fakeControl = null;
        let res = null;
        beforeEach(() =>  {
            fakeControl = new TestControlSync();
            fakeEvent.data = null;
            fakeEvent.bindValue = '';
            fakeEvent.viewController = fakeControl;
            res = null;
        });
        afterEach(() =>  {
            fakeControl = null;
            fakeEvent.data = null;
            fakeEvent.bindValue = '';
            fakeEvent.viewController = null;
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
        it('bind array of object wrong', () => {
            fakeEvent.data = {data: [{value: 0}, {value: 0}, {type: 0}], anyProp: 0};
            fakeEvent.bindValue = 'data.value';
            res = GeneratorBase.checkBindValue(fakeEvent, fakeEvent.bindValue);
            assert.isFalse(res);
        });
    });

});
