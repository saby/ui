/**
 * @jest-environment jsdom
 */
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { createRef } from 'react';
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
import { Logger } from 'UICommon/Utils';
import { importer, lazy } from 'UI/Async';

// предзагрузим модули, на которых будем тестировать Async - в тестах главное протестировать факт вызова require
require('UITest/_async/TestControlSync');
import TestControlAsync = require('UITest/_async/TestControlAsync');
import TestLibraryAsync = require('UITest/_async/TestLibraryAsync');
import TestClassComponent = require('UITest/_async/TestClassComponent');

describe('UI/Async:lazy в браузере', () => {
    let container: HTMLDivElement;

    async function microTaskWait() {
        return Promise.resolve();
    }

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);

        jest.spyOn(Logger, 'error').mockImplementation(jest.fn());
    });

    afterEach(() => {
        jest.useRealTimers();
        container.remove();

        jest.restoreAllMocks();
    });

    it('Синхронная загрузка контрола', () => {
        const moduleName = 'UITest/_async/TestControlSync';

        act(() => {
            const AsyncLazy = lazy(() => importer(moduleName));
            render(<AsyncLazy />, container);
        });

        expect(container).toMatchSnapshot();
    });

    it('Вызов коллбека onComponentLoad после синхронной загрузки контрола', () => {
        const moduleName = 'UITest/_async/TestControlSync';
        const onComponentLoad = jest.fn();

        act(() => {
            const AsyncLazy = lazy(() => importer(moduleName));
            render(<AsyncLazy onComponentLoad={onComponentLoad} />, container);
        });

        expect(onComponentLoad).toBeCalledTimes(1);
    });

    it('Синхронная загрузка контрола, с ошибкой', () => {
        const moduleName = 'UIdemo/_async/Fail/TestControlSync';

        // заглушка для проверки факта вызова загрузки в "require"
        const loadSyncSpy = jest.spyOn(ModulesLoader, 'loadSync').mockReturnValueOnce(null);
        // заглушка для ModulesLoader.isLoaded, чтобы проверить синхронную загрузку контрола
        jest.spyOn(ModulesLoader, 'isLoaded').mockReturnValue(true);

        act(() => {
            const AsyncLazy = lazy(() => importer(moduleName));
            render(<AsyncLazy />, container);
        });

        // проверим, что была попытка синхронной загрузки контрола
        expect(loadSyncSpy).toBeCalled();
        expect(loadSyncSpy).toBeCalledWith(moduleName);
        expect(container).toMatchSnapshot();
    });

    it('Асинхронная загрузка контрола', async () => {
        const moduleName = 'UITest/_async/TestControlAsync';
        // заглушка для проверки факта вызова загрузки в "require"
        const loadAsyncSpy = jest
            .spyOn(ModulesLoader, 'loadAsync')
            .mockResolvedValueOnce(TestControlAsync);
        // заглушка для ModulesLoader.isLoaded, чтобы проверить асинхронную загрузку контрола
        jest.spyOn(ModulesLoader, 'isLoaded').mockReturnValue(false);
        const onComponentLoad = jest.fn();

        act(() => {
            const AsyncLazy = lazy(() => importer(moduleName));
            render(<AsyncLazy onComponentLoad={onComponentLoad} />, container);
        });

        // проверим, что был вызов асинхронной загрузки контрола
        expect(loadAsyncSpy).toBeCalled();
        expect(loadAsyncSpy).toBeCalledWith(moduleName);

        await microTaskWait();

        // Должен быть вызван callback onComponentLoad
        expect(onComponentLoad).toBeCalledTimes(1);

        expect(container).toMatchSnapshot();
    });

    it('Асинхронная загрузка контрола, с ошибкой', async () => {
        const moduleName = 'UITest/_async/Fail/TestControlAsync';
        // заглушка для проверки факта вызова загрузки в "require"
        const loadAsyncSpy = jest.spyOn(ModulesLoader, 'loadAsync').mockRejectedValueOnce(null);
        // мокаем, чтобы не было сообщения в консоли
        jest.spyOn(ModulesLoader, 'unloadSync').mockImplementationOnce(jest.fn());
        const onComponentLoad = jest.fn();

        act(() => {
            const AsyncLazy = lazy(() => importer(moduleName));
            render(<AsyncLazy onComponentLoad={onComponentLoad} />, container);
        });

        // проверим, что был вызов асинхронной загрузки контрола
        expect(loadAsyncSpy).toBeCalled();
        expect(loadAsyncSpy).toBeCalledWith(moduleName);

        await microTaskWait();

        expect(onComponentLoad).not.toBeCalled(); // не должно быть вызова callback'а onComponentLoad
        expect(container).toMatchSnapshot();
    });

    it('Асинхронная загрузка из библиотеки', async () => {
        const moduleName = 'UITest/_async/TestLibraryAsync:ExportControl';
        // заглушка для проверки факта вызова загрузки в "require"
        const loadAsyncSpy = jest
            .spyOn(ModulesLoader, 'loadAsync')
            .mockResolvedValueOnce(TestLibraryAsync.ExportControl);
        // заглушка для ModulesLoader.isLoaded, чтобы проверить асинхронную загрузку контрола
        jest.spyOn(ModulesLoader, 'isLoaded').mockReturnValue(false);

        act(() => {
            const AsyncLazy = lazy(() => importer(moduleName));
            render(<AsyncLazy />, container);
        });

        // проверим, что был вызов асинхронной загрузки контрола
        expect(loadAsyncSpy).toBeCalled();
        expect(loadAsyncSpy).toBeCalledWith(moduleName);

        await microTaskWait();

        expect(container).toMatchSnapshot();
    });

    describe('Получение ссылки на компонент по ref', () => {
        it('Синхронная загрузка', () => {
            const moduleName = 'UITest/_async/TestClassComponent';

            const ref = createRef();
            act(() => {
                const AsyncLazy = lazy(() => importer(moduleName));
                render(<AsyncLazy ref={ref} />, container);
            });

            expect(ref.current).toBeInstanceOf(TestClassComponent.default);
        });

        it('Асинхронная загрузка', async () => {
            const moduleName = 'UITest/_async/TestClassComponent';
            jest.spyOn(ModulesLoader, 'isLoaded').mockReturnValue(false);

            const ref = createRef();
            act(() => {
                const AsyncLazy = lazy(() => importer(moduleName));
                render(<AsyncLazy ref={ref} />, container);
            });

            await microTaskWait();

            expect(ref.current).toBeInstanceOf(TestClassComponent.default);
        });
    });
});
