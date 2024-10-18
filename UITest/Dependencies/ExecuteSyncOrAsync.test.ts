/**
 * @jest-environment jsdom
 */
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
import { executeSyncOrAsync } from 'UICommon/Deps';

/*
 * На клиенте функцонал загружает синхронно только уже загруженные зависимости. Все остальное - асинхронно.
 */
describe('UICommon/Deps:executeSyncOrAsync client side', () => {
    beforeAll(() => {
        const originMethod = ModulesLoader.isLoaded;
        jest.spyOn(ModulesLoader, 'isLoaded').mockImplementation(
            (moduleName) => {
                if (moduleName === 'UITest/Dependencies/resources/Control') {
                    return false;
                }

                return originMethod(moduleName);
            }
        );
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('Load uploaded deps and execute', () => {
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

    it('Load unloaded deps and execute', (done) => {
        let afterStartAsyncOperationFlag: boolean = false;

        executeSyncOrAsync(
            ['UITest/Dependencies/resources/Control'],
            (control: { itsMe: boolean }) => {
                expect(control.itsMe).toBe(true); // Загрузилась зависимость на клиенте
                expect(afterStartAsyncOperationFlag).toBe(true); // Код отработал асинхронно на клиенте
                done();
            }
        );

        afterStartAsyncOperationFlag = true;
    });
});
