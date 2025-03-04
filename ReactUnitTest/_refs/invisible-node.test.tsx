/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import Top from './invisible-node/Top';
import { WasabyEvents } from 'UICore/Events';
import { CreateInvisibleNodeRef } from '../../UICore/_executor/_Markup/Refs/CreateInvisibleNodeRef';

describe('Обработчики событий перевешиваются с invisible-node на родительский элемент', () => {
    let container;
    let eventSystem;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        eventSystem = WasabyEvents.initInstance(container);
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
        WasabyEvents.destroyInstance(container);
        container.remove();
        container = null;
        eventSystem = null;
    });

    test('событие customevent перевешивается c Bottom на Top, и ловится событие с Middle', async () => {
        let top: Top;
        act(() => {
            render(
                <Top
                    ref={(v) => {
                        top = v;
                    }}
                />,
                container
            );
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
        });
        await act(async () => {
            jest.advanceTimersByTime(10);
        });

        top._children.middle._notify('customevent', []);

        expect(top.valueToCheck).toBe('catch');
    });
});
