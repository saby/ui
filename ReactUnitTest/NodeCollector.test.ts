/**
 * @jest-environment jsdom
 */
import { act } from 'react-dom/test-utils';
import { unmountComponentAtNode } from 'react-dom';

import { Control } from 'UICore/Base';
import { goUpByControlTree } from 'UICore/NodeCollector';

import RootControlOpenerLowerHisParent from './_nodeCollector/RootControlOpenerLowerHisParent';

describe('NodeCollector', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        jest.useFakeTimers();
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setTimeout);
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    describe('goUpByControlTree', () => {
        test('При зацикливании выдаётся ошибка, без бесконечной рекурсии', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            act(() => {
                Control.createControl(RootControlOpenerLowerHisParent, {}, container);
            });
            // Ждём все таймеры: Сначала маунт, потом из _afterMount новая перерисовка с присваиванием плохого опенера.
            jest.runAllTimers();

            expect(container).toMatchSnapshot('Убедимся, что дождались: класс должен поменяться');

            let hasUncaughtException = false;
            try {
                goUpByControlTree(document.getElementById('startNodeCollectorHere'));
            } catch (e) {
                hasUncaughtException = true;
            }

            expect(hasUncaughtException).toBeFalsy();
            expect(consoleErrorSpy.mock.calls.length).toBe(1);

            const message = consoleErrorSpy.mock.calls[0][1];
            expect(message).toContain(
                'ReactUnitTest/_nodeCollector/LowerOpener -> ReactUnitTest/_nodeCollector/ControlWithOpener -> ReactUnitTest/_nodeCollector/LowerOpener'
            );
        });
    });
});
