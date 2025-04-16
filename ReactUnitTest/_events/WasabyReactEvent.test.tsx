/**
 * @jest-environment jsdom
 */
import { createSandbox } from 'sinon';
import { act } from 'react-dom/test-utils';

import { Control } from 'UICore/Base';
import WasabyRoot from './resources/WasabyReact/WasabyRoot';
import WasabyRootWithPropsOnClick from './resources/WasabyReact/WasabyRootWithPropsOnClick';
import WasabyControl from './resources/WasabyReact/TransferEvent/WasabyControl';

const creator = Control.createControl;
const destroyer = Control.destroyControl;

describe('WasabyReact Events', () => {
    let container;
    let sandbox;
    let clock;
    let consoleMock;
    let reactControlOnClickMock;
    let instance;

    beforeEach(() => {
        sandbox = createSandbox();
        clock = sandbox.useFakeTimers();
        consoleMock = jest.spyOn(console, 'error').mockImplementation();
        container = document.createElement('div');
        document.body.appendChild(container);
        reactControlOnClickMock = jest.fn();
    });

    afterEach(() => {
        clock.restore();
        sandbox.restore();
        consoleMock.mockRestore();
        destroyer(instance, container);
        container.remove();
        container = null;
        reactControlOnClickMock.mockClear();
    });

    function tick(duration: number): void {
        act(() => {
            clock.tick(duration);
        });
    }

    it('Проверяем события, если подписка добавлена через onClick на wasaby-контрол', () => {
        // region Setup
        act(() => {
            instance = creator(WasabyRoot, { clickFn: reactControlOnClickMock }, container);
        });
        tick(0);
        // endregion
        const button = document.getElementById('wasabyControl');

        act(() => {
            button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        });
        tick(0);

        expect(reactControlOnClickMock).toHaveBeenCalledTimes(1);
    });

    it('Проверяем события, если подписка добавлена через onClick на wasaby-контрол (HOC)', () => {
        // region Setup
        act(() => {
            instance = creator(WasabyRoot, { clickFn: reactControlOnClickMock }, container);
        });
        tick(0);
        // endregion
        const button = document.getElementById('wasabyControlHoc');
        act(() => {
            button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        });
        tick(0);

        expect(reactControlOnClickMock).toHaveBeenCalledTimes(1);
    });

    it('Проверяем события, если подписка добавлена через onClick на wasaby-контрол в корне которого partial с шаблоном', () => {
        // region Setup
        act(() => {
            instance = creator(WasabyRoot, { clickFn: reactControlOnClickMock }, container);
        });
        tick(0);
        // endregion
        const button = document.getElementById('wasabyControlTemplate');
        act(() => {
            button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        });
        tick(0);

        expect(reactControlOnClickMock).toHaveBeenCalledTimes(1);
    });

    it('Проверяем события, react-обработчик использует аргумент event', () => {
        // region Setup
        act(() => {
            instance = creator(WasabyRoot, { clickFn: reactControlOnClickMock }, container);
        });
        tick(0);
        // endregion
        const button = document.getElementById('wasabyControlWithArgs');
        act(() => {
            button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        });
        tick(0);

        expect(reactControlOnClickMock).toHaveBeenCalledTimes(1);
    });

    it('Проверяем события, react-обработчик использует аргумент event', () => {
        // region Setup
        act(() => {
            instance = creator(WasabyRoot, { clickFn: reactControlOnClickMock }, container);
        });
        tick(0);
        // endregion
        const button = document.getElementById('wasabyControlWithArgs2');
        act(() => {
            button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        });
        tick(0);

        expect(reactControlOnClickMock).toHaveBeenCalledTimes(1);
    });

    it('Проверяем события, если именование опции совпадает с именем реакт-события, но не является обработчиком', () => {
        // region Setup
        act(() => {
            instance = creator(WasabyRootWithPropsOnClick, {}, container);
        });
        tick(0);
        // endregion
        const button = document.getElementById('testButton');
        act(() => {
            button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        });
        tick(0);

        expect(consoleMock).not.toHaveBeenCalled();
        expect(container).toMatchSnapshot();
    });
});
