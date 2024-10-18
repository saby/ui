/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { createSandbox } from 'sinon';
import { assert } from 'chai';
import OuterControl from './resources/OuterControl';
import InnerControl from './resources/InnerControl';
import OuterControl2 from './resources/OuterControl2';
import UserControl from './resources/UserControl';

describe('Тестирование ref', () => {
    let container;
    let sandbox;
    let clock;

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

    it('Ref навешенные пользователем должны срабатывать - объекты', () => {
        let instance;
        act(() => {
            render(
                <OuterControl
                    ref={(v) => {
                        instance = v;
                    }}
                />,
                container
            );
        });
        tick(0);

        assert.instanceOf(instance.controlRef.current, InnerControl);
        assert.strictEqual(
            instance.controlRef.current,
            instance._children.control
        );
        assert.strictEqual(
            instance.elementRef.current,
            instance._children.element
        );
    });

    it('Ref навешенные пользователем должны срабатывать - функции', () => {
        let instance;
        act(() => {
            render(
                <OuterControl2
                    ref={(v) => {
                        instance = v;
                    }}
                />,
                container
            );
        });
        tick(0);

        assert.strictEqual(instance.controlResult, instance._children.control);
        assert.strictEqual(instance.elementResult, instance._children.element);
    });

    it('Цепочка ref работает, контрол строится', () => {
        let instance;
        act(() => {
            render(
                <UserControl
                    ref={(v) => {
                        instance = v;
                    }}
                />,
                container
            );
        });
        tick(0);

        expect(container).toMatchSnapshot();
    });
});
