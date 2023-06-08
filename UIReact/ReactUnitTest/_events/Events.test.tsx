/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { createSandbox } from 'sinon';
import { assert } from 'chai';
import { Control } from 'UICore/Base';
import OuterControl from './resources/EventsTest/OuterControl';
import CounterControl from './resources/EventsTest/CounterControl';
import InvisibleRoot from './resources/EventsTest/InvisibleRoot';
import BeforeUnmountParent from './resources/EventsTest/BeforeUnmountParent';
import NativeRootWithArgs from './resources/EventsTest/NativeRootWithArgs';
import InvisibleRootPartialControl from './resources/EventsTest/InvisibleRootPartialControl';
import InvisibleRootPartialTemplate from './resources/EventsTest/InvisibleRootPartialTemplate';
import SpecialEvent from './resources/EventsTest/SpecialEvent';

import { WasabyEvents } from 'UICore/Events';
import { TouchHandlers } from 'UICommon/_events/Touch/TouchHandlers';

const creator = Control.createControl;
const destroyer = Control.destroyControl;

describe('Подписки на контролы', () => {
    let container;
    let sandbox;

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

    async function tickAsync(duration: number): Promise<void> {
        return act(async () => {
            // в новой версии sinon есть clock.tickAsync, который в теории делает то же самое
            clock.tick(duration);
            await Promise.resolve();
        });
    }
    let clock;
    let eventSystem;
    let instance;
    let eventClickMock;

    beforeEach(() => {
        sandbox = createSandbox();
        /*
        _afterMount и _afterUpdate зовутся в отдельной таске, чтобы браузер мог отрисовать кадр.
        Чтобы не делать тесты асинхронными, мы просто мокнем таймеры и сами будем управлять временем.
         */
        clock = sandbox.useFakeTimers();
        container = document.createElement('div');
        document.body.appendChild(container);
        eventSystem = WasabyEvents.initInstance(container);
        eventClickMock = jest.fn();
    });
    afterEach(() => {
        clock.restore();
        sandbox.restore();
        destroyer(instance, container);
        unmountComponentAtNode(container);
        WasabyEvents.destroyInstance(container);
        container.remove();
        container = null;
        eventClickMock.mockClear();
    });

    it('подписка на нативное событие на контроле должна навешиваться на внутренний контейнер', () => {
        act(() => {
            instance = render(
                <OuterControl clickHandler={eventClickMock} />,
                container
            );
        });
        tick(0);

        const button = document.getElementById('clickMe');

        act(() => {
            button.dispatchEvent(
                new window.MouseEvent('click', { bubbles: true })
            );
        });
        tick(0);

        expect(eventClickMock).toHaveBeenCalledTimes(1);
    });

    it('Проверка работы обработчика события on:', () => {
        act(() => {
            render(
                <CounterControl
                    ref={(v) => {
                        instance = v;
                    }}
                />,
                container
            );
        });
        tick(0);

        const button = container.querySelector('button');
        assert.equal(instance.clickCount, '0');

        act(() => {
            button.dispatchEvent(
                new window.MouseEvent('click', { bubbles: true })
            );
        });
        tick(0);

        assert.equal(instance.clickCount, '1');
    });

    it.skip('Проверяем события тача', async () => {
        global.navigation = { maxTouchPoints: 1 };
        const originalTouchState = TouchHandlers.shouldUseClickByTap;
        TouchHandlers.shouldUseClickByTap = () => {
            return true;
        };
        act(() => {
            render(
                <CounterControl
                    ref={(v) => {
                        instance = v;
                    }}
                />,
                container
            );
        });
        tick(0);

        const button = container.querySelector('button');
        assert.equal(instance.clickCount, '0');
        const sendTouchEvent = (x, y, element, eventType) => {
            const touchObj = {
                identifier: Date.now(),
                target: element,
                clientX: x,
                clientY: y,
                radiusX: 2.5,
                radiusY: 2.5,
                rotationAngle: 10,
                force: 0.5,
            };

            const touchEvent = new window.TouchEvent(eventType, {
                cancelable: true,
                bubbles: true,
                touches: [touchObj],
                targetTouches: [],
                changedTouches: [touchObj],
                shiftKey: true,
            });

            element.dispatchEvent(touchEvent);
        };
        act(() => {
            sendTouchEvent(150, 150, button, 'touchstart');
            sendTouchEvent(150, 150, button, 'touchend');
        });
        await tickAsync(500);
        tick(0);

        assert.equal(instance.clickCount, '1');

        TouchHandlers.shouldUseClickByTap = originalTouchState;
        delete global.navigation;
    });

    it('Подписка на invisible-node сохраняется на родительском dom', async () => {
        act(() => {
            instance = creator(InvisibleRoot, {}, container);
        });
        tick(0);

        const button = document.getElementById('button');
        act(() => {
            button.dispatchEvent(
                new window.MouseEvent('click', { bubbles: true })
            );
        });
        tick(0);
        expect(instance.value).toEqual('inner');
    });

    it('Подписка на invisible-node сохраняется на родительском dom, если в patrial передали контрол', async () => {
        act(() => {
            instance = creator(InvisibleRootPartialControl, {}, container);
        });
        tick(0);

        const button = document.getElementById('button');
        act(() => {
            button.dispatchEvent(
                new window.MouseEvent('click', { bubbles: true })
            );
        });
        tick(0);
        expect(instance.value).toEqual('inner');
    });

    it('Подписка на invisible-node не сохраняется на родительском dom, если в patrial передали шаблон', async () => {
        act(() => {
            instance = creator(InvisibleRootPartialTemplate, {}, container);
        });
        tick(0);

        const button = document.getElementById('button');
        act(() => {
            button.dispatchEvent(
                new window.MouseEvent('click', { bubbles: true })
            );
        });
        tick(0);
        expect(instance.value).toEqual('init');
    });

    it('Проверяем события на unmount фазе', async () => {
        act(() => {
            instance = creator(BeforeUnmountParent, {}, container);
        });
        tick(0);
        const button = document.getElementById('removeInner');
        act(() => {
            button.dispatchEvent(
                new window.MouseEvent('click', { bubbles: true })
            );
        });
        tick(0);
        await tickAsync(50);
        expect(instance.childUnmounted).toEqual(true);
        expect(instance._innerChild).toEqual(undefined);
    });

    it('Проверяем что нативное событие вызывается после маунта контрола с нужными аргументами', async () => {
        act(() => {
            instance = creator(NativeRootWithArgs, {}, container);
        });
        tick(0);
        const enterHere = document.getElementById('enterHere');
        act(() => {
            enterHere.dispatchEvent(
                new window.MouseEvent('mouseenter', { bubbles: true })
            );
        });
        await tickAsync(50);
        expect(instance._state).toEqual('entered 0');
    });
});
