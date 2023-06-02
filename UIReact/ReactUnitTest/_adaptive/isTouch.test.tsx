/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import Bootstrap from 'UI/Bootstrap';
import Main from './isTouch/Main';
import { detection } from 'Env/Env';
import { fireEvent, waitFor } from '@testing-library/react';

describe('isTouch', () => {
    function withMobile(cb) {
        const prevIsMobilePlatform = detection.isMobilePlatform;
        try {
            detection.isMobilePlatform = true;
            cb();
        } finally {
            detection.isMobilePlatform = prevIsMobilePlatform;
        }
    }
    let container;
    beforeEach(() => {
        /*
        _afterMount и _afterUpdate зовутся в отдельной таске, чтобы браузер мог отрисовать кадр.
        Чтобы не делать тесты асинхронными, мы просто мокнем таймеры и сами будем управлять временем.
         */
        jest.useFakeTimers();
        // подготавливаем DOM-элемент, куда будем рендерить
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    afterEach(() => {
        // подчищаем после завершения
        unmountComponentAtNode(container);
        container.remove();
        container = null;
        jest.restoreAllMocks();
    });
    it('main', () => {
        render(
            <Bootstrap>
                <Main />
            </Bootstrap>,
            container
        );

        const mainElem = document.getElementById('main');
        expect(mainElem.innerHTML).toBe('false');
    });
    it('withMobile', () => {
        withMobile(() => {
            render(
                <Bootstrap>
                    <Main />
                </Bootstrap>,
                container
            );

            const mainElem = document.getElementById('main');
            expect(mainElem.innerHTML).toBe('true');
        });
    });

    it('touchstart', () => {
        render(
            <Bootstrap>
                <Main />
            </Bootstrap>,
            container
        );

        const mainElem = document.getElementById('main');
        expect(mainElem.innerHTML).toBe('false');
        fireEvent.touchStart(container);

        waitFor(() => {
            expect(mainElem.innerHTML).toBe('true');
            fireEvent.mouseMove(container, { timeStamp: 10 });
            fireEvent.mouseDown(container, { timeStamp: 20 });

            waitFor(() => {
                expect(mainElem.innerHTML).toBe('false');
            });
        });
    });
    it('touchstart with mobile', () => {
        withMobile(() => {
            render(
                <Bootstrap>
                    <Main />
                </Bootstrap>,
                container
            );

            const mainElem = document.getElementById('main');
            expect(mainElem.innerHTML).toBe('true');

            fireEvent.touchStart(container);
            waitFor(() => {
                expect(mainElem.innerHTML).toBe('true');

                fireEvent.mouseMove(container, { timeStamp: 10 });
                fireEvent.mouseDown(container, { timeStamp: 20 });
                waitFor(() => {
                    expect(mainElem.innerHTML).toBe('true');
                });
            });
        });
    });
});
