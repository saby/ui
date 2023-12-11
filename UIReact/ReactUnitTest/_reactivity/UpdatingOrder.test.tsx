/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';

import { createSandbox } from 'sinon';
import { act } from 'react-dom/test-utils';

import { Control } from 'UICore/Base';

import Top from './UpdatingOrder/Top';
import { delay } from 'Types/function';

const creator = Control.createControl;

describe('Порядок обновлений', () => {
    let container;
    let sandbox;
    let clock;

    beforeEach(() => {
        sandbox = createSandbox();
        clock = sandbox.useFakeTimers();
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        clock.restore();
        sandbox.restore();
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

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
            await Promise.resolve();

            // За время requestAnimationFrame отвечает jsdom.
            // Можно было бы с запасом сделать clock.tick(100), но так точнее.
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

    it('обновления должны вызываться от родительского контрола к дочерним', async () => {
        let instance;
        const order = [];
        act(() => {
            instance = creator(Top, { order }, container);
        });
        await tickAsync(0);

        instance._forceUpdate();
        instance._children.bottom._forceUpdate();

        await tickAsync(0);
        await tickAsync(0);

        // первый запуск forceUpdate отрабатывает для Top - рисуется Top и следом Bottom
        sandbox.assert.match(
            order[0],
            'ReactUnitTest/_reactivity/UpdatingOrder/Top'
        );
        // первый запуск forceUpdate отрабатывает для Bottom - рисуется только он
        sandbox.assert.match(
            order[1],
            'ReactUnitTest/_reactivity/UpdatingOrder/Bottom'
        );
    });

    it('обновления должны вызываться от родительского контрола к дочерним 2', async () => {
        let instance;
        const order = [];
        act(() => {
            instance = creator(Top, { order }, container);
        });
        await tickAsync(0);
        instance._children.bottom._forceUpdate();
        instance._forceUpdate();

        await tickAsync(0);
        await tickAsync(0);

        // первый запуск forceUpdate отрабатывает для Top - рисуется Top и следом Bottom
        sandbox.assert.match(
            order[0],
            'ReactUnitTest/_reactivity/UpdatingOrder/Top'
        );
        // первый запуск forceUpdate отрабатывает для Bottom - рисуется только он
        sandbox.assert.match(
            order[1],
            'ReactUnitTest/_reactivity/UpdatingOrder/Bottom'
        );
    });
});
