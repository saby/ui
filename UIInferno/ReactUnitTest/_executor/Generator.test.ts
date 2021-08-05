/* global describe, it, assert */
import { assert } from 'chai';

import { GeneratorBase } from 'UICore/Executor';
import { Logger } from 'UICommon/Utils';

describe('Generator Base', () => {
    describe('Bind Check', () => {
        let warnMessage;
        let warnStub;
        const loggerWarnMock = (msg) => {
            warnMessage = msg;
        };
        before(() => {
            warnMessage = '';
            warnStub = sinon.stub(Logger, 'warn').callsFake(loggerWarnMock);
        });
        after(() => {
            warnMessage = '';
            warnStub.restore();
        });
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
            warnMessage = '';
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
            assert.equal(warnMessage, '');
        });
        it('bind object', () => {
            fakeEvent.data = {data: {value: 0}, anyProp: 0};
            fakeEvent.bindValue = 'data.value';
            res = GeneratorBase.checkBindValue(fakeEvent, fakeEvent.bindValue);
            assert.equal(warnMessage, '');
        });
        it('bind array of object', () => {
            fakeEvent.data = {data: [{value: 0}, {value: 0}, {value: 0}], anyProp: 0};
            fakeEvent.bindValue = 'data.value';
            res = GeneratorBase.checkBindValue(fakeEvent, fakeEvent.bindValue);
            assert.equal(warnMessage, '');
        });
        it('bind array of object with sub props', () => {
            fakeEvent.data = {data: [{sub: {value: 0}, value: 0}], anyProp: 0};
            fakeEvent.bindValue = 'data.value';
            res = GeneratorBase.checkBindValue(fakeEvent, fakeEvent.bindValue);
            assert.equal(warnMessage, '');
        });
        it('bind array of object with sub props wrong', () => {
            fakeEvent.data = {data: [{sub: {value: 0}, value: 0}, {type: {value: 0}, value: 0}, {type: 0}], anyProp: 0};
            fakeEvent.bindValue = 'data.sub.value';
            res = GeneratorBase.checkBindValue(fakeEvent, fakeEvent.bindValue);
            assert.include(warnMessage, 'Bind на несуществующее поле');
        });
        it('bind array of object wrong', () => {
            fakeEvent.data = {data: [{type: 0}], anyProp: 0};
            fakeEvent.bindValue = 'data.value';
            res = GeneratorBase.checkBindValue(fakeEvent, fakeEvent.bindValue);
            assert.include(warnMessage, 'Bind на несуществующее поле');
        });
    });

});
