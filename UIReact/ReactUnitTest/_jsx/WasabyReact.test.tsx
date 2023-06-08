/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { createSandbox, SinonSandbox, SinonFakeTimers } from 'sinon';
import { delay } from 'Types/function';
import { Control } from 'UICore/Base';
import { default as WasabyReact } from './resources/WasabyReact/Root';
import { default as NullEvent } from './resources/CreateEvent/Root';
import { default as WasabyCallback } from './resources/WasabyCallback/Root';
import { default as CustomEvent } from './resources/CustomEvent/Root';

const creator = Control.createControl;
const destroyer = Control.destroyControl;

describe('Подписки на контролы', () => {
    let container: HTMLDivElement;
    let sandbox: SinonSandbox;
    let clock: SinonFakeTimers;
    let consoleMock;

    beforeEach(() => {
        sandbox = createSandbox();
        /*
        _afterMount и _afterUpdate зовутся в отдельной таске, чтобы браузер мог отрисовать кадр.
        Чтобы не делать тесты асинхронными, мы просто мокнем таймеры и сами будем управлять временем.
        */
        clock = sandbox.useFakeTimers();
        consoleMock = jest.spyOn(console, 'error').mockImplementation();
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        clock.restore();
        sandbox.restore();
        consoleMock.mockRestore();
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    /**
     * Эта функция существует для того, чтобы не забывать оборачивать тики в act.
     * Это нужно, чтобы реакт реагировал на изменение времени и обновлял компоненты.
     * @param duration Значение, на которое должно продвинуться время.
     */
    function tick(duration: number): void {
        act(() => {
            clock.tick(duration);
        });
    }

    /**
     * Асинхронный аналог {@link tick}, отличается тем, что эта версия позволяет выполниться коллбекам промисов.
     * @param duration Значение, на которое должно продвинуться время.
     */
    async function tickAsync(duration: number): Promise<void> {
        return act(async () => {
            // в новой версии sinon есть clock.tickAsync, который в теории делает то же самое
            clock.tick(duration);
            clock.tick(duration);
            await Promise.resolve();
        });
    }

    // В данный момент довольно сложная система вызова обновления, выделим его тик отдельно.
    async function tickWasabyUpdate(): Promise<void> {
        return act(async () => {
            await Promise.resolve();

            // За время requestAnimationFrame отвечает jsdom.
            // Можно было бы с запасом сделать clock.tick(100), но так точнее.
            await new Promise<void>((resolve) => {
                let resolved: boolean = false;
                // forceUpdate занимает 2 delay
                delay(() => {
                    delay(() => {
                        resolved = true;
                        resolve();
                    });
                });
                while (!resolved) {
                    clock.tick(1);
                }
            });
        });
    }

    it('bind работает через react HOC', async () => {
        // region Setup
        let instance;
        act(() => {
            instance = creator(WasabyReact, {}, container);
        });
        tick(0);
        // endregion
        await tickWasabyUpdate();
        const button = document.getElementById('reactHOC');
        act(() => {
            button.dispatchEvent(
                new window.MouseEvent('click', { bubbles: true })
            );
        });
        await tickWasabyUpdate();

        expect(container).toMatchSnapshot();

        destroyer(instance, container);
    });
    it('bind работает через функциональный react компонент', async () => {
        // region Setup
        let instance;
        act(() => {
            instance = creator(WasabyReact, {}, container);
        });
        tick(0);
        // endregion
        await tickWasabyUpdate();
        const button = document.getElementById('reactFunc');
        act(() => {
            button.dispatchEvent(
                new window.MouseEvent('click', { bubbles: true })
            );
        });
        await tickWasabyUpdate();

        expect(container).toMatchSnapshot();

        destroyer(instance, container);
    });

    it('bind работает при вызове callback-функции из react', async () => {
        // region Setup
        let instance;
        act(() => {
            instance = creator(WasabyReact, {}, container);
        });
        tick(0);
        // endregion
        await tickWasabyUpdate();
        const button = document.getElementById('reactControl');
        act(() => {
            button.dispatchEvent(
                new window.MouseEvent('click', { bubbles: true })
            );
        });
        await tickWasabyUpdate();

        expect(container).toMatchSnapshot();

        destroyer(instance, container);
    });

    it('вызов wasaby-обработчика из реакта с передачей события и аргументов', async () => {
        // region Setup
        let instance;
        act(() => {
            instance = creator(WasabyCallback, {}, container);
        });
        tick(0);
        // endregion
        await tickWasabyUpdate();
        const button = document.getElementById('reactControlEvent');
        act(() => {
            button.dispatchEvent(
                new window.MouseEvent('click', { bubbles: true })
            );
        });
        await tickWasabyUpdate();

        expect(container).toMatchSnapshot();

        destroyer(instance, container);
    });

    it('вызов wasaby-обработчика из реакта с передачей только аргументов', async () => {
        // region Setup
        let instance;
        act(() => {
            instance = creator(WasabyCallback, {}, container);
        });
        tick(0);
        // endregion
        await tickWasabyUpdate();
        const button = document.getElementById('reactControlNoEvent');
        act(() => {
            button.dispatchEvent(
                new window.MouseEvent('click', { bubbles: true })
            );
        });
        await tickWasabyUpdate();

        expect(container).toMatchSnapshot();

        destroyer(instance, container);
    });

    it('вызов wasaby-обработчика из реакта с без передачи аргументов', async () => {
        // region Setup
        let instance;
        act(() => {
            instance = creator(WasabyCallback, {}, container);
        });
        tick(0);
        // endregion
        await tickWasabyUpdate();
        const button = document.getElementById('reactControlEmpty');
        act(() => {
            button.dispatchEvent(
                new window.MouseEvent('click', { bubbles: true })
            );
        });
        await tickWasabyUpdate();

        expect(container).toMatchSnapshot();

        destroyer(instance, container);
    });

    it('Передача null в event createElement', async () => {
        // region Setup
        let instance;
        act(() => {
            instance = creator(NullEvent, {}, container);
        });
        tick(0);
        // endregion
        await tickWasabyUpdate();

        expect(container).toMatchSnapshot();

        destroyer(instance, container);
    });

    it('Передача customEvents в wasaby из react', async () => {
        // region Setup
        let instance;
        act(() => {
            instance = creator(CustomEvent, {}, container);
        });
        tick(0);
        // endregion
        await tickWasabyUpdate();

        expect(container).toMatchSnapshot();

        destroyer(instance, container);
    });
});
