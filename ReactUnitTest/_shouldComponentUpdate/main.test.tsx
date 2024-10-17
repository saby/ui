/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { createSandbox } from 'sinon';
import { assert } from 'chai';
import Container from './Container';

describe('Тесты принятия решения о перерисовке', () => {
    let container;
    let sandbox;

    let clock;
    beforeEach(() => {
        sandbox = createSandbox();
        /*
        _afterMount и _afterUpdate зовутся в отдельной таске, чтобы браузер мог отрисовать кадр.
        Чтобы не делать тесты асинхронными, мы просто мокнем таймеры и сами будем управлять временем.
         */
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
            await Promise.resolve();
        });
    }

    it('Блочные опции в шаблоне должны игнорироваться', async () => {
        let inst;
        act(() => {
            render(
                <Container
                    ref={(v) => {
                        inst = v;
                    }}
                />,
                container
            );
        });
        await tickAsync(10);
        await tickAsync(0);
        inst.aaa = 234;
        // ожидание перерисовки на изменение свойства aaa
        await tickAsync(10);
        await tickAsync(0);
        // ожидание перерисовки на изменение свойства в _afterUpdate контрола Control
        await tickAsync(10);
        await tickAsync(0);
        // ожидание перерисовки на изменение свойства в _afterUpdate контрола InnerControl
        await tickAsync(10);
        await tickAsync(0);

        // должно было перерисоватья потому что меняется свойство aaa
        assert.equal(inst._children.control.updated, 1);
        // не должно перерисоваться потому что в InnerControl не меняются опции которые могли бы повлиять на перерисовку
        // а блочные опции заданные в шаблоне не должны влиять на перерисовку - это и проверяется в тесте
        assert.equal(inst._children.control._children.innerControl.updated, 0);
    });
});
