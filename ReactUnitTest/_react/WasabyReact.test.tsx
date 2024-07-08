/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
// import { Control } from 'UICore/Base';
// FIXME: типы для jsdom нигде не подцеплены, подцепим после переезда на jest
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { JSDOM } from 'jsdom';

// import Root from './OnCompatiblePage/Root';

// const creator = Control.createControl;
// const destroyer = Control.destroyControl;

describe('WasabyReact', () => {
    describe('Создание контрола', () => {
        let container;
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

        it.skip('Создание контрола с ws3-совместимостью на странице', async () => {
            // region Setup
            // let instance;
            // act(() => {
            //     instance = creator(Root, {}, container);
            // });
            // // endregion
            // const toggleWs3Control = document.getElementById('toggleWs3Control');
            // const toggleReactControl = document.getElementById('toggleReactControl');
            //
            // act(() => {
            //     toggleReactControl.dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
            // });
            //
            // // пропустить все таймеры, чтобы произошел полный цикл обновления
            // await act(async () => {
            //     jest.runAllTimers();
            // });
            //
            // expect(container).toMatchSnapshot('1. Строим React без константы compat');
            //
            // act(() => {
            //     toggleWs3Control.dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
            // });
            //
            // // пропустить все таймеры, чтобы произошел полный цикл обновления
            // await act(async () => {
            //     jest.runAllTimers();
            // });
            //
            // act(() => {
            //     toggleReactControl.dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
            // });
            //
            // // пропустить все таймеры, чтобы произошел полный цикл обновления
            // await act(async () => {
            //     jest.runAllTimers();
            // });
            //
            // expect(container).toMatchSnapshot('2. Строим React с константой compat');
            //
            // destroyer(instance, container);
        });
    });
});
