import { executeSyncOrAsync } from 'UICommon/Deps';
import { assert } from 'chai';

const isNode = typeof window === 'undefined';
const describeIf = (condition) => condition ? describe : describe.skip;

/**
 * На сервере функционал должен работать только синхронно
 */
describeIf(isNode)('UICommon/Deps:executeSyncOrAsync server side', () => {
    it('Load deps and execute', () => {
        let callBackFlag: boolean = false;
        executeSyncOrAsync(['UICommon/Deps'], (deps: {executeSyncOrAsync: unknown}) => {
            if (typeof deps.executeSyncOrAsync !== 'undefined') {
                callBackFlag = true;
            }
        });

        assert.isTrue(callBackFlag, 'Код не отработал синхронно на сервере или не загрузилась зависимость');
    });
});

/**
 * На клиенте функцонал загружает синхронно только уже загруженные зависимости. Все остальное - асинхронно.
 */
describeIf(!isNode)('UICommon/Deps:executeSyncOrAsync client side', () => {
    it('Load uploaded deps and execute', () => {
        let callBackFlag: boolean = false;
        executeSyncOrAsync(['UICommon/Deps'], (deps: {executeSyncOrAsync: unknown}) => {
            if (typeof deps.executeSyncOrAsync !== 'undefined') {
                callBackFlag = true;
            }
        });

        assert.isTrue(callBackFlag, 'Код не отработал синхронно на клиенте или не загрузилась зависимость');
    });
    it('Load unloaded deps and execute', () => {
        let afterStartAsyncOperationFlag: boolean = false;

        const result = new Promise((resolve) => {
            executeSyncOrAsync([
                'UICommon/Deps',
                'UITest/Dependencies/resources/Control'
            ], (deps: {executeSyncOrAsync: unknown}, control: {default: {itsMe: boolean}}) => {
                assert.isTrue(control.default.itsMe, 'Не загрузилась зависимость на клиенте');
                assert.isTrue(afterStartAsyncOperationFlag, 'Код не отработал асинхронно на клиенте');
                resolve(true);
            });
        });

        afterStartAsyncOperationFlag = true;
        return result;
    });
});
