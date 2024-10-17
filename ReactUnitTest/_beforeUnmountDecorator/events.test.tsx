/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { createSandbox, SinonSandbox, SinonFakeTimers } from 'sinon';
import EventMain from './EventMain';

import { Control } from 'UICore/Base';
import { delay } from 'Types/function';

const creator = Control.createControl;
describe('events while unmounting', () => {
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

    it('проверяем работу событий в beforeUnmount', async () => {
        let instance;

        act(() => {
            instance = creator(EventMain, {}, container);
        });
        await tickAsync(0);

        const instanceBeforeUnmountSpy = jest
            .spyOn<any, string>(instance, '_customEventHandler')
            .mockName('instanceBeforeUnmountSpy');
        const childBeforeUnmountSpy = jest
            .spyOn<any, string>(
                instance._children.eventMiddle,
                '_customEventHandler'
            )
            .mockName('childBeforeUnmountSpy');

        act(() => {
            instance.value = false;
        });

        await tickAsync(0);

        expect(instanceBeforeUnmountSpy).toBeCalledTimes(1);
        expect(childBeforeUnmountSpy).toBeCalledTimes(1);
    });
});
