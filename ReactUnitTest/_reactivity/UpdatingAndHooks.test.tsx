/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';

import { act } from 'react-dom/test-utils';

import { Control } from 'UICore/Base';
import Top from './UpdatingAndHooks/Top';

const creator = Control.createControl;

describe('Порядок обновлений и хуков', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        jest.restoreAllMocks();
        jest.useFakeTimers();
        // Чтобы не зависеть от реализации requestAnimationFrame для jsdom.
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(
            setTimeout
        );
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    test('сначала должны вызваться запланированные обновления, а потом хуки', async () => {
        const order = [];
        act(() => {
            creator(Top, { order }, container);
        });

        await act(async () => {
            jest.advanceTimersByTime(50);
        });
        await act(async () => {
            jest.advanceTimersByTime(50);
        });

        let i = 0;
        expect(order[i++]).toBe('render top control 0');
        expect(order[i++]).toBe('render middle control 0');

        expect(order[i++]).toBe('render top control 1');
        expect(order[i++]).toBe('render middle control 1');
        expect(order[i++]).toBe('afterRender middle control 1');
        expect(order[i++]).toBe('afterRender top control 1');

        expect(order[i++]).toBe('render top control 2');
        expect(order[i++]).toBe('render middle control 2');
        expect(order[i++]).toBe('afterRender middle control 2');
        expect(order[i++]).toBe('afterRender top control 2');

        expect(order[i++]).toBe('render top control 3');
        expect(order[i++]).toBe('render middle control 3');
        expect(order[i++]).toBe('afterRender middle control 3');
        expect(order[i++]).toBe('afterRender top control 3');
    });
});
