import BeforeMountDecorator from 'UICore/_base/Control/BeforeMountDecorator';
import ReceivedState from 'UICore/_base/Control/ReceivedState';
import { getStateReceiver } from 'Application/Env';

const stateReceiver = getStateReceiver();

const prepareStateReceiver: () => void = () => {
    // @ts-ignore Несколько тестов в этом файле бегают по StateReceiver, а данное свойство мешает обновить данные.
    delete stateReceiver._serialized;
    stateReceiver.deserialize(stateReceiver.serialize().serialized);
};

describe('BeforeMountDecorator node', () => {
    /**
     * Комплект тестов проверяет результат метода processBeforeMount у BeforeMountDecorator
     * при смешанном использовании сервера-клиента
     */
    describe('Process BeforeMount server+client', () => {
        const beforeMountResults = {
            empty: null,
            immediately: { data: true },
            async: { dataIsAsync: true },
        };

        afterEach(() => {
            jest.restoreAllMocks();
        });

        /** Результат _beforeMount контрола непустой и является готовым объектом */
        it('Immediately beforeMount result', () => {
            let callBackFlag = false;
            const moduleName = 'UITest/BeforeMountDecorator/FakeControl_3';
            const rsKey = 'test_1_2_3_';
            const isServerSideSpy = jest.spyOn(
                ReceivedState.prototype,
                'isServerSide'
            );
            const beforeMountDecorator = new BeforeMountDecorator();

            beforeMountDecorator.initStateReceiver(moduleName, rsKey);
            const isAsync = beforeMountDecorator.processBeforeMount(
                beforeMountResults.immediately,
                () => {
                    callBackFlag = true;
                }
            );

            isServerSideSpy.mockReturnValue(false);
            prepareStateReceiver();

            expect(!!isAsync).toBe(false);
            expect(callBackFlag).toBe(true);

            expect(beforeMountResults.immediately).toStrictEqual(
                beforeMountDecorator.getReceivedState()
            );
        });

        /** Результат _beforeMount контрола является Promise */
        it('Async beforeMount result', async () => {
            let callBackFlag = false;
            let asyncTrigger;
            const moduleName = 'UITest/BeforeMountDecorator/FakeControl_4';
            const rsKey = 'test_1_2_3_4_';
            const isServerSideSpy = jest.spyOn(
                ReceivedState.prototype,
                'isServerSide'
            );
            const beforeMountDecorator = new BeforeMountDecorator();

            beforeMountDecorator.initStateReceiver(moduleName, rsKey);
            const isAsync = beforeMountDecorator.processBeforeMount(
                new Promise((resolve) => {
                    asyncTrigger = resolve;
                }),
                () => {
                    callBackFlag = true;
                }
            );

            expect(isAsync).toBe(true);

            asyncTrigger(beforeMountResults.async);

            await beforeMountDecorator.waitMyOwnAsyncMount();

            isServerSideSpy.mockReturnValue(false);
            prepareStateReceiver();

            expect(callBackFlag).toBe(true);

            expect(beforeMountResults.async).toStrictEqual(
                beforeMountDecorator.getReceivedState()
            );
        });
    });
});
