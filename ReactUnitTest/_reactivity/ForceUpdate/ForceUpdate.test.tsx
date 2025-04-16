/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import Parent from './Parent';

describe('вызов _forceUpdate и изменение реактивного свойства', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        jest.useFakeTimers();
        // Чтобы не зависеть от реализации requestAnimationFrame для jsdom.
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(
            setTimeout
        );
    });

    afterEach(() => {
        jest.useRealTimers();
        unmountComponentAtNode(container);
        container.remove();
        container = null;
        jest.restoreAllMocks();
    });

    test('_forceUpdate', async () => {
        const beforeUpdateSpy = jest
            .spyOn<any, string>(Parent.prototype, '_beforeUpdate')
            .mockName('beforeUpdateSpy');

        let parent: Parent;
        act(() => {
            render(
                <Parent
                    ref={(v) => {
                        parent = v;
                    }}
                />,
                container
            );
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent._forceUpdate();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        expect(beforeUpdateSpy).toBeCalledTimes(1);
        expect(container).toMatchSnapshot();

        beforeUpdateSpy.mockRestore();
    });

    test('реактивность', async () => {
        const beforeUpdateSpy = jest
            .spyOn<any, string>(Parent.prototype, '_beforeUpdate')
            .mockName('beforeUpdateSpy');

        let parent: Parent;
        act(() => {
            render(
                <Parent
                    ref={(v) => {
                        parent = v;
                    }}
                />,
                container
            );
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent.changeReactiveOption();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        expect(beforeUpdateSpy).toBeCalledTimes(1);
        expect(container).toMatchSnapshot();

        beforeUpdateSpy.mockRestore();
    });

    test('_forceUpdate | реактивность', async () => {
        const beforeUpdateSpy = jest
            .spyOn<any, string>(Parent.prototype, '_beforeUpdate')
            .mockName('beforeUpdateSpy');

        let parent: Parent;
        act(() => {
            render(
                <Parent
                    ref={(v) => {
                        parent = v;
                    }}
                />,
                container
            );
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent._forceUpdate();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent.changeReactiveOption();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        expect(beforeUpdateSpy).toBeCalledTimes(2);
        expect(container).toMatchSnapshot();

        beforeUpdateSpy.mockRestore();
    });

    test('реактивность | _forceUpdate', async () => {
        const beforeUpdateSpy = jest
            .spyOn<any, string>(Parent.prototype, '_beforeUpdate')
            .mockName('beforeUpdateSpy');

        let parent: Parent;
        act(() => {
            render(
                <Parent
                    ref={(v) => {
                        parent = v;
                    }}
                />,
                container
            );
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent.changeReactiveOption();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent._forceUpdate();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        expect(beforeUpdateSpy).toBeCalledTimes(2);
        expect(container).toMatchSnapshot();

        beforeUpdateSpy.mockRestore();
    });

    test('_forceUpdate | _forceUpdate | _forceUpdate', async () => {
        const beforeUpdateSpy = jest
            .spyOn<any, string>(Parent.prototype, '_beforeUpdate')
            .mockName('beforeUpdateSpy');

        let parent: Parent;
        act(() => {
            render(
                <Parent
                    ref={(v) => {
                        parent = v;
                    }}
                />,
                container
            );
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent._forceUpdate();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent._forceUpdate();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent._forceUpdate();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        expect(beforeUpdateSpy).toBeCalledTimes(3);
        expect(container).toMatchSnapshot();

        beforeUpdateSpy.mockRestore();
    });

    test('_forceUpdate | _forceUpdate | реактивность', async () => {
        const beforeUpdateSpy = jest
            .spyOn<any, string>(Parent.prototype, '_beforeUpdate')
            .mockName('beforeUpdateSpy');

        let parent: Parent;
        act(() => {
            render(
                <Parent
                    ref={(v) => {
                        parent = v;
                    }}
                />,
                container
            );
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent._forceUpdate();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent._forceUpdate();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent.changeReactiveOption();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        expect(beforeUpdateSpy).toBeCalledTimes(3);
        expect(container).toMatchSnapshot();

        beforeUpdateSpy.mockRestore();
    });

    test('_forceUpdate | реактивность | _forceUpdate', async () => {
        const beforeUpdateSpy = jest
            .spyOn<any, string>(Parent.prototype, '_beforeUpdate')
            .mockName('beforeUpdateSpy');

        let parent: Parent;
        act(() => {
            render(
                <Parent
                    ref={(v) => {
                        parent = v;
                    }}
                />,
                container
            );
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent._forceUpdate();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent.changeReactiveOption();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent._forceUpdate();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        expect(beforeUpdateSpy).toBeCalledTimes(3);
        expect(container).toMatchSnapshot();

        beforeUpdateSpy.mockRestore();
    });

    test('_forceUpdate | реактивность | реактивность', async () => {
        const beforeUpdateSpy = jest
            .spyOn<any, string>(Parent.prototype, '_beforeUpdate')
            .mockName('beforeUpdateSpy');

        let parent: Parent;
        act(() => {
            render(
                <Parent
                    ref={(v) => {
                        parent = v;
                    }}
                />,
                container
            );
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent._forceUpdate();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent.changeReactiveOption();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent.changeReactiveOption();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        expect(beforeUpdateSpy).toBeCalledTimes(3);
        expect(container).toMatchSnapshot();

        beforeUpdateSpy.mockRestore();
    });

    test('реактивность | _forceUpdate | _forceUpdate', async () => {
        const beforeUpdateSpy = jest
            .spyOn<any, string>(Parent.prototype, '_beforeUpdate')
            .mockName('beforeUpdateSpy');

        let parent: Parent;
        act(() => {
            render(
                <Parent
                    ref={(v) => {
                        parent = v;
                    }}
                />,
                container
            );
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent.changeReactiveOption();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent._forceUpdate();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent._forceUpdate();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        expect(beforeUpdateSpy).toBeCalledTimes(3);
        expect(container).toMatchSnapshot();

        beforeUpdateSpy.mockRestore();
    });

    test('реактивность | _forceUpdate | реактивность', async () => {
        const beforeUpdateSpy = jest
            .spyOn<any, string>(Parent.prototype, '_beforeUpdate')
            .mockName('beforeUpdateSpy');

        let parent: Parent;
        act(() => {
            render(
                <Parent
                    ref={(v) => {
                        parent = v;
                    }}
                />,
                container
            );
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent.changeReactiveOption();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent._forceUpdate();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent.changeReactiveOption();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        expect(beforeUpdateSpy).toBeCalledTimes(3);
        expect(container).toMatchSnapshot();

        beforeUpdateSpy.mockRestore();
    });

    test('реактивность | реактивность | _forceUpdate', async () => {
        const beforeUpdateSpy = jest
            .spyOn<any, string>(Parent.prototype, '_beforeUpdate')
            .mockName('beforeUpdateSpy');

        let parent: Parent;
        act(() => {
            render(
                <Parent
                    ref={(v) => {
                        parent = v;
                    }}
                />,
                container
            );
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent.changeReactiveOption();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent.changeReactiveOption();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent._forceUpdate();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        expect(beforeUpdateSpy).toBeCalledTimes(3);
        expect(container).toMatchSnapshot();

        beforeUpdateSpy.mockRestore();
    });

    test('реактивность | реактивность | реактивность', async () => {
        const beforeUpdateSpy = jest
            .spyOn<any, string>(Parent.prototype, '_beforeUpdate')
            .mockName('beforeUpdateSpy');

        let parent: Parent;
        act(() => {
            render(
                <Parent
                    ref={(v) => {
                        parent = v;
                    }}
                />,
                container
            );
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent.changeReactiveOption();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent.changeReactiveOption();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        act(() => {
            parent.changeReactiveOption();
        });

        await act(async () => {
            jest.advanceTimersByTime(0);
            jest.runOnlyPendingTimers();
        });

        expect(beforeUpdateSpy).toBeCalledTimes(3);
        expect(container).toMatchSnapshot();

        beforeUpdateSpy.mockRestore();
    });
});
