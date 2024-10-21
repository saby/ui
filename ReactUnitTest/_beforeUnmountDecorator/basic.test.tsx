/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { createSandbox, SinonSandbox, SinonFakeTimers } from 'sinon';
import Main from './Main';
import Middle from './Middle';
import Bottom from './Bottom';

import { Control } from 'UICore/Base';
import { delay } from 'Types/function';

const creator = Control.createControl;
describe('beforeUnmountDecorator', () => {
    let container: HTMLDivElement;
    let sandbox: SinonSandbox;
    let clock: SinonFakeTimers;

    beforeEach(() => {
        sandbox = createSandbox();
        clock = sandbox.useFakeTimers();

        // Чтобы не зависеть от реализации requestAnimationFrame для jsdom.
        sandbox.stub(window, 'requestAnimationFrame').callsFake(setTimeout);

        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        unmountComponentAtNode(container);
        container.remove();
        container = null;

        clock.restore();
        sandbox.restore();
    });

    async function tickAsync(duration: number): Promise<void> {
        return act(async () => {
            await Promise.resolve();

            // За время requestAnimationFrame отвечает jsdom.
            await new Promise<void>((resolve) => {
                let resolved: boolean = false;
                delay(() => {
                    resolved = true;
                    resolve();
                });
                while (!resolved) {
                    clock.tick(1);
                }
            });
        });
    }

    it('проверяем порядок вызовов beforeUnmount', async () => {
        let instance;

        const _beforeUnmountMiddle = sandbox.stub(
            Middle.prototype,
            '_beforeUnmount'
        );
        const _beforeUnmountBottom = sandbox.stub(
            Bottom.prototype,
            '_beforeUnmount'
        );

        act(() => {
            instance = creator(Main, {}, container);
        });
        await tickAsync(0);

        act(() => {
            instance.value = false;
        });

        await tickAsync(0);

        sandbox.assert.calledOnce(_beforeUnmountMiddle);
        sandbox.assert.calledOnce(_beforeUnmountBottom);
        sandbox.assert.callOrder(_beforeUnmountBottom, _beforeUnmountMiddle);
    });
});
