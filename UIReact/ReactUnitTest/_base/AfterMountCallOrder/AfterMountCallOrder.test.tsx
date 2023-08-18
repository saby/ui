/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';

import ControlParent from './ControlParent';
import ControlChild1 from './ControlChild1';
import ControlChild2 from './ControlChild2';

describe('Порядок вызова _afterMount вложенных контролов', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        jest.useFakeTimers();
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.useRealTimers();
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    async function callComponentDidMountTick() {
        return act(async () => {
            await Promise.resolve();
        });
    }

    it('синхронный|синхронный|синхронный', async () => {
        // region Setup
        const parentAfterMountSpy = jest.spyOn(
            ControlParent.prototype,
            '_afterMount'
        );
        const child1AfterMountSpy = jest.spyOn(
            ControlChild1.prototype,
            '_afterMount'
        );
        const child2AfterMountSpy = jest.spyOn(
            ControlChild2.prototype,
            '_afterMount'
        );
        // endregion

        act(() => {
            render(<ControlParent />, container);
        });
        await callComponentDidMountTick();

        act(() => {
            jest.runAllTimers();
        });

        expect(child2AfterMountSpy).toBeCalledTimes(1);
        expect(child1AfterMountSpy).toBeCalledTimes(1);
        expect(parentAfterMountSpy).toBeCalledTimes(1);

        const child2AfterMountOrder =
            child2AfterMountSpy.mock.invocationCallOrder[0];
        const child1AfterMountOrder =
            child1AfterMountSpy.mock.invocationCallOrder[0];
        const parentAfterMountOrder =
            parentAfterMountSpy.mock.invocationCallOrder[0];
        expect(child2AfterMountOrder).toBeLessThan(child1AfterMountOrder);
        expect(child1AfterMountOrder).toBeLessThan(parentAfterMountOrder);
    });

    it('синхронный|синхронный|Асинхронный', async () => {
        // region Setup
        jest.spyOn(ControlChild2.prototype, '_beforeMount').mockImplementation(
            function (): Promise<void> {
                return new Promise<void>((resolve) => {
                    resolve();
                });
            }
        );
        const parentAfterMountSpy = jest.spyOn(
            ControlParent.prototype,
            '_afterMount'
        );
        const child1AfterMountSpy = jest.spyOn(
            ControlChild1.prototype,
            '_afterMount'
        );
        const child2AfterMountSpy = jest.spyOn(
            ControlChild2.prototype,
            '_afterMount'
        );
        // endregion

        act(() => {
            render(<ControlParent />, container);
        });

        await act(async () => {
            jest.runAllTimers();
        });

        act(() => {
            jest.runAllTimers();
        });

        expect(child2AfterMountSpy).toBeCalledTimes(1);
        expect(child1AfterMountSpy).toBeCalledTimes(1);
        expect(parentAfterMountSpy).toBeCalledTimes(1);

        const child2AfterMountOrder =
            child2AfterMountSpy.mock.invocationCallOrder[0];
        const child1AfterMountOrder =
            child1AfterMountSpy.mock.invocationCallOrder[0];
        const parentAfterMountOrder =
            parentAfterMountSpy.mock.invocationCallOrder[0];
        expect(child2AfterMountOrder).toBeLessThan(child1AfterMountOrder);
        expect(child1AfterMountOrder).toBeLessThan(parentAfterMountOrder);
    });

    it('синхронный|Асинхронный|синхронный', async () => {
        // region Setup
        jest.spyOn(ControlChild1.prototype, '_beforeMount').mockImplementation(
            function (): Promise<void> {
                return new Promise<void>((resolve) => {
                    resolve();
                });
            }
        );
        const parentAfterMountSpy = jest.spyOn(
            ControlParent.prototype,
            '_afterMount'
        );
        const child1AfterMountSpy = jest.spyOn(
            ControlChild1.prototype,
            '_afterMount'
        );
        const child2AfterMountSpy = jest.spyOn(
            ControlChild2.prototype,
            '_afterMount'
        );
        // endregion

        act(() => {
            render(<ControlParent />, container);
        });

        await act(async () => {
            jest.runAllTimers();
        });

        act(() => {
            jest.runAllTimers();
        });

        expect(child2AfterMountSpy).toBeCalledTimes(1);
        expect(child1AfterMountSpy).toBeCalledTimes(1);
        expect(parentAfterMountSpy).toBeCalledTimes(1);

        const child2AfterMountOrder =
            child2AfterMountSpy.mock.invocationCallOrder[0];
        const child1AfterMountOrder =
            child1AfterMountSpy.mock.invocationCallOrder[0];
        const parentAfterMountOrder =
            parentAfterMountSpy.mock.invocationCallOrder[0];
        expect(child2AfterMountOrder).toBeLessThan(child1AfterMountOrder);
        expect(child1AfterMountOrder).toBeLessThan(parentAfterMountOrder);
    });

    it('синхронный|Асинхронный|Асинхронный', async () => {
        // region Setup
        jest.spyOn(ControlChild1.prototype, '_beforeMount').mockImplementation(
            function (): Promise<void> {
                return new Promise<void>((resolve) => {
                    resolve();
                });
            }
        );
        jest.spyOn(ControlChild2.prototype, '_beforeMount').mockImplementation(
            function (): Promise<void> {
                return new Promise<void>((resolve) => {
                    resolve();
                });
            }
        );
        const parentAfterMountSpy = jest.spyOn(
            ControlParent.prototype,
            '_afterMount'
        );
        const child1AfterMountSpy = jest.spyOn(
            ControlChild1.prototype,
            '_afterMount'
        );
        const child2AfterMountSpy = jest.spyOn(
            ControlChild2.prototype,
            '_afterMount'
        );
        // endregion

        act(() => {
            render(<ControlParent />, container);
        });

        await act(async () => {
            jest.runAllTimers();
        });

        act(() => {
            jest.runAllTimers();
        });

        expect(child2AfterMountSpy).toBeCalledTimes(1);
        expect(child1AfterMountSpy).toBeCalledTimes(1);
        expect(parentAfterMountSpy).toBeCalledTimes(1);

        const child2AfterMountOrder =
            child2AfterMountSpy.mock.invocationCallOrder[0];
        const child1AfterMountOrder =
            child1AfterMountSpy.mock.invocationCallOrder[0];
        const parentAfterMountOrder =
            parentAfterMountSpy.mock.invocationCallOrder[0];
        expect(child2AfterMountOrder).toBeLessThan(child1AfterMountOrder);
        expect(child1AfterMountOrder).toBeLessThan(parentAfterMountOrder);
    });

    it('Асинхронный|синхронный|синхронный', async () => {
        // region Setup
        jest.spyOn(ControlParent.prototype, '_beforeMount').mockImplementation(
            function (): Promise<void> {
                return new Promise<void>((resolve) => {
                    resolve();
                });
            }
        );
        const parentAfterMountSpy = jest.spyOn(
            ControlParent.prototype,
            '_afterMount'
        );
        const child1AfterMountSpy = jest.spyOn(
            ControlChild1.prototype,
            '_afterMount'
        );
        const child2AfterMountSpy = jest.spyOn(
            ControlChild2.prototype,
            '_afterMount'
        );
        // endregion

        act(() => {
            render(<ControlParent />, container);
        });

        await act(async () => {
            jest.runAllTimers();
        });

        act(() => {
            jest.runAllTimers();
        });

        expect(child2AfterMountSpy).toBeCalledTimes(1);
        expect(child1AfterMountSpy).toBeCalledTimes(1);
        expect(parentAfterMountSpy).toBeCalledTimes(1);

        const child2AfterMountOrder =
            child2AfterMountSpy.mock.invocationCallOrder[0];
        const child1AfterMountOrder =
            child1AfterMountSpy.mock.invocationCallOrder[0];
        const parentAfterMountOrder =
            parentAfterMountSpy.mock.invocationCallOrder[0];
        expect(child2AfterMountOrder).toBeLessThan(child1AfterMountOrder);
        expect(child1AfterMountOrder).toBeLessThan(parentAfterMountOrder);
    });

    it('Асинхронный|синхронный|Асинхронный', async () => {
        // region Setup
        jest.spyOn(ControlParent.prototype, '_beforeMount').mockImplementation(
            function (): Promise<void> {
                return new Promise<void>((resolve) => {
                    resolve();
                });
            }
        );
        jest.spyOn(ControlChild2.prototype, '_beforeMount').mockImplementation(
            function (): Promise<void> {
                return new Promise<void>((resolve) => {
                    resolve();
                });
            }
        );
        const parentAfterMountSpy = jest.spyOn(
            ControlParent.prototype,
            '_afterMount'
        );
        const child1AfterMountSpy = jest.spyOn(
            ControlChild1.prototype,
            '_afterMount'
        );
        const child2AfterMountSpy = jest.spyOn(
            ControlChild2.prototype,
            '_afterMount'
        );
        // endregion

        act(() => {
            render(<ControlParent />, container);
        });

        await act(async () => {
            jest.runAllTimers();
        });

        act(() => {
            jest.runAllTimers();
        });

        expect(child2AfterMountSpy).toBeCalledTimes(1);
        expect(child1AfterMountSpy).toBeCalledTimes(1);
        expect(parentAfterMountSpy).toBeCalledTimes(1);

        const child2AfterMountOrder =
            child2AfterMountSpy.mock.invocationCallOrder[0];
        const child1AfterMountOrder =
            child1AfterMountSpy.mock.invocationCallOrder[0];
        const parentAfterMountOrder =
            parentAfterMountSpy.mock.invocationCallOrder[0];
        expect(child2AfterMountOrder).toBeLessThan(child1AfterMountOrder);
        expect(child1AfterMountOrder).toBeLessThan(parentAfterMountOrder);
    });

    it('Асинхронный|Асинхронный|синхронный', async () => {
        // region Setup
        jest.spyOn(ControlParent.prototype, '_beforeMount').mockImplementation(
            function (): Promise<void> {
                return new Promise<void>((resolve) => {
                    resolve();
                });
            }
        );
        jest.spyOn(ControlChild1.prototype, '_beforeMount').mockImplementation(
            function (): Promise<void> {
                return new Promise<void>((resolve) => {
                    resolve();
                });
            }
        );
        const parentAfterMountSpy = jest.spyOn(
            ControlParent.prototype,
            '_afterMount'
        );
        const child1AfterMountSpy = jest.spyOn(
            ControlChild1.prototype,
            '_afterMount'
        );
        const child2AfterMountSpy = jest.spyOn(
            ControlChild2.prototype,
            '_afterMount'
        );
        // endregion

        act(() => {
            render(<ControlParent />, container);
        });

        await act(async () => {
            jest.runAllTimers();
        });

        act(() => {
            jest.runAllTimers();
        });

        expect(child2AfterMountSpy).toBeCalledTimes(1);
        expect(child1AfterMountSpy).toBeCalledTimes(1);
        expect(parentAfterMountSpy).toBeCalledTimes(1);

        const child2AfterMountOrder =
            child2AfterMountSpy.mock.invocationCallOrder[0];
        const child1AfterMountOrder =
            child1AfterMountSpy.mock.invocationCallOrder[0];
        const parentAfterMountOrder =
            parentAfterMountSpy.mock.invocationCallOrder[0];
        expect(child2AfterMountOrder).toBeLessThan(child1AfterMountOrder);
        expect(child1AfterMountOrder).toBeLessThan(parentAfterMountOrder);
    });

    it('Асинхронный|Асинхронный|Асинхронный', async () => {
        // region Setup
        jest.spyOn(ControlParent.prototype, '_beforeMount').mockImplementation(
            function (): Promise<void> {
                return new Promise<void>((resolve) => {
                    resolve();
                });
            }
        );
        jest.spyOn(ControlChild1.prototype, '_beforeMount').mockImplementation(
            function (): Promise<void> {
                return new Promise<void>((resolve) => {
                    resolve();
                });
            }
        );
        jest.spyOn(ControlChild2.prototype, '_beforeMount').mockImplementation(
            function (): Promise<void> {
                return new Promise<void>((resolve) => {
                    resolve();
                });
            }
        );
        const parentAfterMountSpy = jest.spyOn(
            ControlParent.prototype,
            '_afterMount'
        );
        const child1AfterMountSpy = jest.spyOn(
            ControlChild1.prototype,
            '_afterMount'
        );
        const child2AfterMountSpy = jest.spyOn(
            ControlChild2.prototype,
            '_afterMount'
        );
        // endregion

        act(() => {
            render(<ControlParent />, container);
        });

        await act(async () => {
            jest.runAllTimers();
        });

        act(() => {
            jest.runAllTimers();
        });

        expect(child2AfterMountSpy).toBeCalledTimes(1);
        expect(child1AfterMountSpy).toBeCalledTimes(1);
        expect(parentAfterMountSpy).toBeCalledTimes(1);

        const child2AfterMountOrder =
            child2AfterMountSpy.mock.invocationCallOrder[0];
        const child1AfterMountOrder =
            child1AfterMountSpy.mock.invocationCallOrder[0];
        const parentAfterMountOrder =
            parentAfterMountSpy.mock.invocationCallOrder[0];
        expect(child2AfterMountOrder).toBeLessThan(child1AfterMountOrder);
        expect(child1AfterMountOrder).toBeLessThan(parentAfterMountOrder);
    });
});
