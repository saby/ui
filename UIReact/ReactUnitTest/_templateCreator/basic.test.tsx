/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode } from 'react-dom';

import { createSandbox } from 'sinon';
import { act } from 'react-dom/test-utils';

import { Control } from 'UICore/Base';
import { delay } from 'Types/function';

import Main from './Main';
import Main2 from './Main2';
import Main3 from './Main3';
import Main4 from './Main4';
import Main5 from './Main5';

import * as ChildTemplate1 from 'wml!ReactUnitTest/_templateCreator/ChildTemplate1';
import * as ChildTemplate2 from 'wml!ReactUnitTest/_templateCreator/ChildTemplate2';

const creator = Control.createControl;

describe('TemplateCreator', () => {
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

    it('Шаблон не перерисовывается, потому что не изменились его пропсы', async () => {
        let instance;
        act(() => {
            instance = creator(Main, {}, container);
        });
        await tickAsync(0);
        instance.value = 1;
        await tickAsync(0);
        const childEl = document.getElementById('child');
        const child = childEl.controlNodes[0].control;
        expect(child.updated).toBe(0);
    });

    it.skip('Контентная опция не перерисовывается, потому что не изменились ее пропсы', async () => {
        let instance;
        act(() => {
            instance = creator(Main2, {}, container);
        });
        await tickAsync(0);
        instance.value = 1;
        await tickAsync(0);
        const childEl = document.getElementById('child');
        const child = childEl.controlNodes[0].control;
        expect(child.updated).toBe(0);
    });

    it('Шаблон перерисовывается, потому что изменились его пропсы', async () => {
        let instance;
        act(() => {
            instance = creator(Main3, {}, container);
        });
        await tickAsync(0);
        instance.value = 1;
        await tickAsync(0);
        const childEl = document.getElementById('child');
        const child = childEl.controlNodes[0].control;
        expect(child.updated).toBe(0);
    });

    it('Контентная опция перерисовывается, потому что изменились ее пропсы', async () => {
        let instance;
        act(() => {
            instance = creator(Main4, {}, container);
        });
        await tickAsync(0);
        instance.value = 1;
        await tickAsync(0);
        const childEl = document.getElementById('child');
        const child = childEl.controlNodes[0].control;
        expect(child.updated).toBe(1);
    });

    it('partial перерисовывается, потому что изменился шаблон', async () => {
        let instance;
        act(() => {
            instance = creator(
                Main5,
                { childTemplate: ChildTemplate1 },
                container
            );
        });
        await tickAsync(0);
        const childEl = document.getElementById('child');
        expect(childEl.textContent).toBe('1');

        instance.childTemplate = ChildTemplate2;
        await tickAsync(0);
        const childEl2 = document.getElementById('child');
        expect(childEl2.textContent).toBe('2');
    });
});
