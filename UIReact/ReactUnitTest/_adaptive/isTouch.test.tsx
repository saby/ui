/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import Bootstrap from 'UI/Bootstrap';
import Main from './isTouch/Main';
import { detection } from 'Env/Env';
import { fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Storage } from 'UICore/Adaptive';

// Сочетание delay 0 и jest.useFakeTimers() вызывает бесконечный клик.
const user = userEvent.setup({
    delay: null,
});

const delayBeetweenTouchAndClick = 300;

describe('isTouch', () => {
    async function withMobile(cb: () => Promise<void>) {
        const prevIsMobilePlatform = detection.isMobilePlatform;
        try {
            detection.isMobilePlatform = true;
            await cb();
        } finally {
            detection.isMobilePlatform = prevIsMobilePlatform;
        }
    }
    let container: HTMLDivElement;
    beforeEach(() => {
        jest.useFakeTimers();
        // подготавливаем DOM-элемент, куда будем рендерить
        container = document.createElement('div');
        document.body.appendChild(container);

        // Под jest окружение определяется как тач, это не поправить. См комментарий в:
        // https://online.sbis.ru/doc/e6be38a6-0e9e-4564-b418-749d4c2dae16
        // Руками инициализируем окружение как не тач.
        // fireEvent.mouseMove(container);
        fireEvent.mouseDown(container);
    });
    afterEach(() => {
        Storage.getInstance()._clear();
        // подчищаем после завершения
        unmountComponentAtNode(container);
        container.remove();
        container = null;
        jest.restoreAllMocks();
        jest.useRealTimers();
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

    it('withMobile', async () => {
        await withMobile(async () => {
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

    it('touchstart', async () => {
        render(
            <Bootstrap>
                <Main />
            </Bootstrap>,
            container
        );

        const mainElem = document.getElementById('main');
        expect(mainElem.innerHTML).toBe('false');

        // в user-event пока не реализованы тач события. https://github.com/testing-library/user-event/issues/880
        fireEvent.touchStart(container);

        await waitFor(() => {
            expect(mainElem.innerHTML).toBe('true');
        });

        jest.advanceTimersByTime(delayBeetweenTouchAndClick);
        await user.click(container);
        await waitFor(() => {
            expect(mainElem.innerHTML).toBe('false');
        });
    });
    it('touchstart with mobile', async () => {
        await withMobile(async () => {
            render(
                <Bootstrap>
                    <Main />
                </Bootstrap>,
                container
            );

            const mainElem = document.getElementById('main');
            expect(mainElem.innerHTML).toBe('true');

            fireEvent.touchStart(container);
            await waitFor(() => {
                expect(mainElem.innerHTML).toBe('true');
            });

            jest.advanceTimersByTime(delayBeetweenTouchAndClick);
            await user.click(container);
            await waitFor(() => {
                expect(mainElem.innerHTML).toBe('true');
            });
        });
    });
});
