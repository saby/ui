/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { createSandbox, SinonSandbox, SinonFakeTimers } from 'sinon';
import ControlWithBeforeMount from './resources/beforeMountTest/ControlWithBeforeMount';

import { Control } from 'UICore/Base';
const creator = Control.createControl;
describe('beforeMount', () => {
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
            // в новой версии sinon есть clock.tickAsync, который в теории делает то же самое
            clock.tick(duration);
            await Promise.resolve();
        });
    }

    it('не должен быть доступ к опциям', async () => {
        act(() => {
            creator(
                ControlWithBeforeMount,
                {
                    beforeMount: function beforeMount(): void {
                        sandbox.assert.match(this._options?.value, undefined);
                    },
                    value: 123,
                },
                container
            );
        });
        await tickAsync(0);
    });
});
