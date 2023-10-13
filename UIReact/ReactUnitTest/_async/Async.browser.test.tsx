/**
 * @jest-environment jsdom
 */
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
import { Logger } from 'UICommon/Utils';
import { default as Async } from 'ReactUnitTest/_async/Async';

// предзагрузим модули, на которых будем тестировать Async - в тестах главное протестировать факт вызова require
import TestControlSync = require('ReactUnitTest/_async/TestControlSync');
import TestControlAsync = require('ReactUnitTest/_async/TestControlAsync');
import TestLibraryAsync = require('ReactUnitTest/_async/TestLibraryAsync');

describe('UICore/Async:Async в браузере', () => {
    let container: HTMLDivElement;
    let notifyLoadSpy;

    /**
     * Эта функция существует для того, чтобы не забывать оборачивать тики в act.
     * Это нужно, чтобы реакт реагировал на изменение времени и обновлял компоненты.
     * @param duration Значение, на которое должно продвинуться время.
     */
    function tick(duration: number): void {
        act(() => {
            jest.advanceTimersByTime(duration);
        });
    }

    /**
     * Асинхронный аналог {@link tick}, отличается тем, что эта версия позволяет выполниться коллбекам промисов.
     * @param duration Значение, на которое должно продвинуться время.
     */
    async function tickAsync(duration: number): Promise<void> {
        return act(async () => {
            // в новой версии sinon есть clock.tickAsync, который в теории делает то же самое
            jest.advanceTimersByTime(duration);
            await Promise.resolve();
        });
    }

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);

        /*
        _afterMount и _afterUpdate зовутся в отдельной таске, чтобы браузер мог отрисовать кадр.
        Чтобы не делать тесты асинхронными, мы просто мокнем таймеры и сами будем управлять временем.
         */
        jest.useFakeTimers();

        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(
            setTimeout
        );
        jest.spyOn(Logger, 'warn').mockImplementation(jest.fn());
        jest.spyOn(Logger, 'error').mockImplementation(jest.fn());
        // заглушка для нотификации событий контрола, просто проверим факт вызова метода публикации события
        notifyLoadSpy = jest
            .spyOn(Async.prototype, '_notify')
            .mockImplementation(jest.fn());
    });

    afterEach(() => {
        jest.useRealTimers();
        container.remove();

        jest.restoreAllMocks();
    });

    it('Синхронная загрузка контрола', () => {
        const moduleName = 'ReactUnitTest/_async/TestControlSync';

        let instance;
        act(() => {
            render(
                <Async
                    ref={(v) => {
                        instance = v;
                    }}
                    templateName={moduleName}
                    templateOptions="{}"
                />,
                container
            );
        });

        expect(instance.getError()).toBeFalsy(); // Поле с ошибкой должно быть пустым.
        expect(instance.getCurrentTemplateName()).toEqual(moduleName);
        expect(instance.getOptionsForComponent().resolvedTemplate).toEqual(
            TestControlSync
        );
    });

    it('Событие templateLoad после синхронной загрузки контрола', async () => {
        const moduleName = 'ReactUnitTest/_async/TestControlSync';

        act(() => {
            render(
                <Async templateName={moduleName} templateOptions="{}" />,
                container
            );
        });

        async function microTaskWait() {
            return Promise.resolve();
        }
        await microTaskWait();

        expect(notifyLoadSpy).toBeCalledTimes(1);
        expect(notifyLoadSpy).toBeCalledWith('templateLoad');
    });

    it('Синхронная загрузка контрола, с ошибкой', () => {
        const moduleName = 'ReactUnitTest/_async/Fail/TestControlSync';

        // заглушка для проверки факта вызова загрузки в "require"
        const loadSyncSpy = jest
            .spyOn(ModulesLoader, 'loadSync')
            .mockReturnValueOnce(null);
        // заглушка для ModulesLoader.isLoaded, чтобы проверить синхронную загрузку контрола
        const isLoadedSpy = jest
            .spyOn(ModulesLoader, 'isLoaded')
            .mockReturnValue(true);

        let instance;
        act(() => {
            render(
                <Async
                    ref={(v) => {
                        instance = v;
                    }}
                    templateName={moduleName}
                    templateOptions="{}"
                />,
                container
            );
        });
        tick(0);
        // удалим заглушку функции ModulesLoader.isLoaded
        isLoadedSpy.mockRestore();

        // проверим, что была попытка синхронной загрузки контрола
        expect(loadSyncSpy).toBeCalled();
        expect(loadSyncSpy).toBeCalledWith(moduleName);
        expect(instance.getError()).toMatchSnapshot();
        expect(
            instance.getOptionsForComponent().resolvedTemplate
        ).toBeUndefined();
    });

    it('Асинхронная загрузка контрола', async () => {
        const moduleName = 'ReactUnitTest/_async/TestControlAsync';
        // заглушка для проверки факта вызова загрузки в "require"
        const loadAsyncSpy = jest
            .spyOn(ModulesLoader, 'loadAsync')
            .mockResolvedValueOnce(TestControlAsync);
        // заглушка для ModulesLoader.isLoaded, чтобы проверить асинхронную загрузку контрола
        const isLoadedSpy = jest
            .spyOn(ModulesLoader, 'isLoaded')
            .mockReturnValue(false);

        let instance;
        act(() => {
            render(
                <Async
                    ref={(v) => {
                        instance = v;
                    }}
                    templateName={moduleName}
                    templateOptions="{}"
                />,
                container
            );
        });
        // удалим заглушку функции ModulesLoader.isLoaded
        isLoadedSpy.mockRestore();

        tick(0); // вызов _afterMount

        // проверим, что был вызов асинхронной загрузки контрола
        expect(loadAsyncSpy).toBeCalled();
        expect(loadAsyncSpy).toBeCalledWith(moduleName);

        // вызов _beforeUpdate
        await tickAsync(0);
        // вызов _afterUpdate, чтобы опубликовалось событие 'templateLoad'
        tick(0);

        expect(instance.getError()).toBeFalsy(); // Поле с ошибкой должно быть пустым.
        expect(instance.getCurrentTemplateName()).toEqual(moduleName);
        expect(instance.getOptionsForComponent().resolvedTemplate).toEqual(
            TestControlAsync
        );
        // Должен быть вызван метод публикации события "_notify"
        expect(notifyLoadSpy).toBeCalledTimes(1);
        expect(notifyLoadSpy).toBeCalledWith('templateLoad');
    });

    it('Асинхронная загрузка контрола, с ошибкой', async () => {
        const moduleName = 'ReactUnitTest/_async/Fail/TestControlAsync';
        // заглушка для проверки факта вызова загрузки в "require"
        const loadAsyncSpy = jest
            .spyOn(ModulesLoader, 'loadAsync')
            .mockRejectedValueOnce(null);
        // мокаем, чтобы не было сообщения в консоли
        jest.spyOn(ModulesLoader, 'unloadSync').mockImplementationOnce(
            jest.fn()
        );

        let instance;
        act(() => {
            render(
                <Async
                    ref={(v) => {
                        instance = v;
                    }}
                    templateName={moduleName}
                    templateOptions="{}"
                />,
                container
            );
        });

        tick(0); // вызов _afterMount

        // проверим, что был вызов асинхронной загрузки контрола
        expect(loadAsyncSpy).toBeCalled();
        expect(loadAsyncSpy).toBeCalledWith(moduleName);

        // вызов _beforeUpdate
        await tickAsync(0);
        // вызов _afterUpdate
        tick(0);

        expect(instance.getError()).toMatchSnapshot();
        expect(
            instance.getOptionsForComponent().resolvedTemplate
        ).toBeUndefined();
        expect(notifyLoadSpy).not.toBeCalled(); // не должно быть вызова метода публикации события "_notify"
    });

    it('Асинхронная загрузка из библиотеки', async () => {
        const moduleName =
            'ReactUnitTest/_async/TestLibraryAsync:ExportControl';
        // заглушка для проверки факта вызова загрузки в "require"
        const loadAsyncSpy = jest
            .spyOn(ModulesLoader, 'loadAsync')
            .mockResolvedValueOnce(TestLibraryAsync.ExportControl);
        // заглушка для ModulesLoader.isLoaded, чтобы проверить асинхронную загрузку контрола
        const isLoadedSpy = jest
            .spyOn(ModulesLoader, 'isLoaded')
            .mockReturnValue(false);

        let instance;
        act(() => {
            render(
                <Async
                    ref={(v) => {
                        instance = v;
                    }}
                    templateName={moduleName}
                    templateOptions="{}"
                />,
                container
            );
        });
        tick(0);
        // удалим заглушку функции ModulesLoader.isLoaded
        isLoadedSpy.mockRestore();

        await tickAsync(0); // вызов _afterMount

        // проверим, что был вызов асинхронной загрузки контрола
        expect(loadAsyncSpy).toBeCalled();
        expect(loadAsyncSpy).toBeCalledWith(moduleName);

        // вызов _beforeUpdate
        await tickAsync(0);
        // вызов _afterUpdate
        tick(0);

        expect(instance.getError()).toBeFalsy(); // Поле с ошибкой должно быть пустым.
        expect(instance.getCurrentTemplateName()).toEqual(moduleName);
        expect(instance.getOptionsForComponent().resolvedTemplate).toEqual(
            TestLibraryAsync.ExportControl
        );
    });
});
