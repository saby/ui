import { executeSyncOrAsync } from 'UICommon/Deps';

/**
 * На сервере функционал должен работать только синхронно
 */
describe('UICommon/Deps:executeSyncOrAsync server side', () => {
    it('Load deps and execute', () => {
        let callBackFlag: boolean = false;
        executeSyncOrAsync(
            ['UICommon/Deps'],
            (deps: { executeSyncOrAsync: unknown }) => {
                if (typeof deps.executeSyncOrAsync !== 'undefined') {
                    callBackFlag = true;
                }
            }
        );

        expect(callBackFlag).toBe(true);
    });
});
