/* global describe, it, assert */
import { assert } from 'chai';

import { GeneratorBase } from 'UICore/Executor';
import { Logger } from 'UICommon/Utils';

describe('Generator Base', () => {
    describe('Bind Check', () => {
        const originalLogger = Logger;
        let errorMessage;
        let errorStub;
        const loggerErrorMock = (msg) => {
            errorMessage = msg;
        };
        before(() => {
            errorMessage = '';
            errorStub = sinon.stub(Logger, 'error').callsFake(loggerErrorMock);
        });
        after(() => {
            errorMessage = '';
            errorStub.restore();
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
            errorMessage = '';
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
            assert.equal(errorMessage, '');
        });
        it('bind object', () => {
            fakeEvent.data = {data: {value: 0}, anyProp: 0};
            fakeEvent.bindValue = 'data.value';
            res = GeneratorBase.checkBindValue(fakeEvent, fakeEvent.bindValue);
            assert.equal(errorMessage, '');
        });
        it('bind array of object', () => {
            fakeEvent.data = {data: [{value: 0}, {value: 0}, {value: 0}], anyProp: 0};
            fakeEvent.bindValue = 'data.value';
            res = GeneratorBase.checkBindValue(fakeEvent, fakeEvent.bindValue);
            assert.equal(errorMessage, '');
        });
        it('bind array of object with sub props', () => {
            fakeEvent.data = {data: [{sub: {value: 0}, value: 0}], anyProp: 0};
            fakeEvent.bindValue = 'data.value';
            res = GeneratorBase.checkBindValue(fakeEvent, fakeEvent.bindValue);
            assert.equal(errorMessage, '');
        });
        it('bind array of object with sub props wrong', () => {
            fakeEvent.data = {data: [{sub: {value: 0}, value: 0}, {type: {value: 0}, value: 0}, {type: 0}], anyProp: 0};
            fakeEvent.bindValue = 'data.sub.value';
            res = GeneratorBase.checkBindValue(fakeEvent, fakeEvent.bindValue);
            assert.include(errorMessage, 'Bind на несуществующее поле');
        });
        it('bind array of object wrong', () => {
            fakeEvent.data = {data: [{type: 0}], anyProp: 0};
            fakeEvent.bindValue = 'data.value';
            res = GeneratorBase.checkBindValue(fakeEvent, fakeEvent.bindValue);
            assert.include(errorMessage, 'Bind на несуществующее поле');
        });
    });

});
