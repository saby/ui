/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Control } from 'UICore/Base';

import Root from './resources/Refs/ControlNodes/Root';

const creator = Control.createControl;

describe('ControlNodes Ref', () => {
    let container;

    beforeEach(() => {
        /*
        _afterMount и _afterUpdate зовутся в отдельной таске, чтобы браузер мог отрисовать кадр.
        Чтобы не делать тесты асинхронными, мы просто мокнем таймеры и сами будем управлять временем.
         */
        jest.useFakeTimers();
        container = document.createElement('div');
        document.body.appendChild(container);
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(
            setTimeout
        );
    });

    afterEach(() => {
        jest.useRealTimers();
        unmountComponentAtNode(container);
        container.remove();
        container = null;
        jest.restoreAllMocks();
    });

    it('Объект событий на controlNode обновляется при удалении контрола', async () => {
        // region Setup
        let instance;
        act(() => {
            instance = creator(Root, {}, container);
        });
        // endregion

        // Делаем так, чтобы первое обновление ребенка прошло как обычно
        await act(async () => {
            instance.changeTestOption('some value');
        });

        // пропустить все таймеры, чтобы произошел полный цикл обновления
        await act(async () => {
            jest.runAllTimers();
        });

        const item0 = container.querySelector('#item-0');
        const item1 = container.querySelector('#item-1');
        const remove = container.querySelector('#remove');

        await act(async () => {
            item0.dispatchEvent(
                new window.MouseEvent('click', { bubbles: true })
            );
        });

        await act(async () => {
            jest.runAllTimers();
        });

        expect(container).toMatchSnapshot('1. Клик на первый элемент');

        await act(async () => {
            item1.dispatchEvent(
                new window.MouseEvent('click', { bubbles: true })
            );
        });

        await act(async () => {
            jest.runAllTimers();
        });

        expect(container).toMatchSnapshot('2. Клик на второй элемент');

        await act(async () => {
            remove.dispatchEvent(
                new window.MouseEvent('click', { bubbles: true })
            );
        });

        await act(async () => {
            jest.runAllTimers();
        });

        expect(container).toMatchSnapshot('3. Удалили первый элемент');

        await act(async () => {
            item1.dispatchEvent(
                new window.MouseEvent('click', { bubbles: true })
            );
        });

        await act(async () => {
            jest.runAllTimers();
        });

        expect(container).toMatchSnapshot('4. Клик на новый первый элемент');
    });
});
