/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import ControlParent from './ControlParent';
import ControlChildAsync from './ControlChildAsync';
import Top from './Top';
import Bottom from './Bottom';

describe('Асинхронное изменение реактивного свойства во время асинхронного построения', () => {
    let container;

    beforeEach(() => {
        /*
        _afterMount и _afterUpdate зовутся в отдельной таске, чтобы браузер мог отрисовать кадр.
        Чтобы не делать тесты асинхронными, мы просто мокнем таймеры и сами будем управлять временем.
         */
        jest.useFakeTimers();
        container = document.createElement('div');
        document.body.appendChild(container);
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

    it('асинхронный родитель, в нём асинхронный процесс завершается раньше _beforeMount, и раньше асинхронного ребенка', async () => {
        // region Setup
        jest.spyOn(ControlParent.prototype, '_beforeMount').mockImplementation(
            function (this: ControlParent): Promise<void> {
                setTimeout(() => {
                    this._value = 'value';
                }, 4);
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 5);
                });
            }
        );
        jest.spyOn(
            ControlChildAsync.prototype,
            '_beforeMount'
        ).mockImplementation(function (this: ControlChildAsync): Promise<void> {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 5);
            });
        });
        // enregion

        act(() => {
            render(<ControlParent />, container);
        });

        expect(container).toMatchSnapshot('1. Ждём Promise ControlParent');

        await act(async () => {
            jest.advanceTimersByTime(5);
        });

        expect(container).toMatchSnapshot(
            '2. Выполнился _beforeMount ControlParent, ControlChildSync построился с новым состоянием'
        );

        await act(async () => {
            jest.advanceTimersByTime(5);
        });

        expect(container).toMatchSnapshot(
            '3. ControlChildAsync построился с актуальным состоянием. Всё отрисовалось'
        );
    });

    it('асинхронный родитель, в нём асинхронный процесс завершается позже _beforeMount, но раньше асинхронного ребенка', async () => {
        // region Setup
        jest.spyOn(ControlParent.prototype, '_beforeMount').mockImplementation(
            function (this: ControlParent): Promise<void> {
                setTimeout(() => {
                    this._value = 'value';
                }, 6);
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 5);
                });
            }
        );
        jest.spyOn(
            ControlChildAsync.prototype,
            '_beforeMount'
        ).mockImplementation(function (this: ControlChildAsync): Promise<void> {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 5);
            });
        });
        // enregion

        act(() => {
            render(<ControlParent />, container);
        });

        expect(container).toMatchSnapshot('1. Ждём Promise ControlParent');

        await act(async () => {
            jest.advanceTimersByTime(5);
        });

        expect(container).toMatchSnapshot(
            '2. Всё пустое, т.к. выполнился _beforeMount ControlParent, но он еще не обновил состояние'
        );

        await act(async () => {
            jest.advanceTimersByTime(1);
        });

        expect(container).toMatchSnapshot(
            '3. Несмотря на то что у ControlParent состояние изменилось, всё пустое, т.к. ждем асинхронного ControlChildAsync'
        );

        await act(async () => {
            jest.advanceTimersByTime(4);
        });

        expect(container).toMatchSnapshot(
            '4. ControlChildAsync построился, но новое состояние ControlParent не проброшено до детей'
        );

        // т.к. в _forceUpdate delay внутри Promise необходимо ждать 2 асинхронных тика
        await act(async () => {
            jest.advanceTimersByTime(0);
        });
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        await act(async () => {
            jest.runOnlyPendingTimers();
        });

        expect(container).toMatchSnapshot(
            '5. Всё отрисовалось, т.к. произошло обновление'
        );
    });

    it('асинхронный родитель, в нём асинхронный процесс завершается позже _beforeMount родителя, и позже асинхронного ребенка', async () => {
        // region Setup
        jest.spyOn(ControlParent.prototype, '_beforeMount').mockImplementation(
            function (this: ControlParent): Promise<void> {
                setTimeout(() => {
                    this._value = 'value';
                }, 11);
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 5);
                });
            }
        );
        jest.spyOn(
            ControlChildAsync.prototype,
            '_beforeMount'
        ).mockImplementation(function (this: ControlChildAsync): Promise<void> {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 5);
            });
        });
        // enregion

        act(() => {
            render(<ControlParent />, container);
        });

        expect(container).toMatchSnapshot('1. Ждём Promise ControlParent');

        await act(async () => {
            jest.advanceTimersByTime(5);
        });

        expect(container).toMatchSnapshot(
            '2. Всё пустое, т.к. выполнился _beforeMount ControlParent, но у него еще старое состояние'
        );

        await act(async () => {
            jest.advanceTimersByTime(5);
        });

        expect(container).toMatchSnapshot(
            '3. ControlChildAsync построился, но в ControlParent еще старое состояние'
        );

        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        expect(container).toMatchSnapshot(
            '4. Несмотря на то что у ControlParent состояние изменилось, всё пустое, т.к. не проброшено до детей'
        );

        act(() => {
            jest.advanceTimersByTime(2);
        });

        expect(container).toMatchSnapshot(
            '5. Всё отрисовалось, т.к. произошло обновление'
        );
    });

    it('синхронный родитель, в нём асинхронный процесс завершается раньше асинхронного ребенка', async () => {
        // region Setup
        jest.spyOn(ControlParent.prototype, '_beforeMount').mockImplementation(
            function (this: ControlParent): void {
                setTimeout(() => {
                    this._value = 'value';
                }, 4);
            }
        );
        jest.spyOn(
            ControlChildAsync.prototype,
            '_beforeMount'
        ).mockImplementation(function (this: ControlChildAsync): Promise<void> {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 5);
            });
        });
        // enregion

        act(() => {
            render(<ControlParent />, container);
        });

        expect(container).toMatchSnapshot(
            '1. Всё пустое, т.к. у ControlParent еще старое состояние'
        );

        await act(async () => {
            jest.advanceTimersByTime(4);
        });

        expect(container).toMatchSnapshot(
            '2. Несмотря на то что у ControlParent состояние изменилось, всё пустое, т.к. не проброшено до детей'
        );

        // дожидаемся в общей сумме 5 мс взведенного setTimeout
        await act(async () => {
            jest.advanceTimersByTime(1);
        });
        // дожидаемся последующей перерисовки
        await act(async () => {
            jest.advanceTimersByTime(1);
        });

        expect(container).toMatchSnapshot(
            '3. ControlChildAsync построился и всё отрисовалось, т.к. произошло обновление'
        );
    });

    it('У контрола в _beforeMount асинхронное изменение свойства, оно должно примениться после маунтинга', async () => {
        let _beforeUpdateCalled = false;
        jest.spyOn(Bottom.prototype, '_beforeUpdate').mockImplementation(
            function (this: Bottom): void {
                _beforeUpdateCalled = true;
            }
        );

        act(() => {
            render(<Top />, container);
        });

        // дожидаемся асинхронщины Bottom
        await act(async () => {
            jest.advanceTimersByTime(20);
        });
        // дожидаемся перерисовки в качестве обновления из-за изменения свойства _value
        await act(async () => {
            jest.advanceTimersByTime(1);
        });

        expect(_beforeUpdateCalled).toBe(true);
    });

    it('синхронный родитель, в нём асинхронный процесс завершается позже асинхронного ребенка', async () => {
        // region Setup
        jest.spyOn(ControlParent.prototype, '_beforeMount').mockImplementation(
            function (this: ControlParent): Promise<void> {
                setTimeout(() => {
                    this._value = 'value';
                }, 6);
            }
        );
        jest.spyOn(
            ControlChildAsync.prototype,
            '_beforeMount'
        ).mockImplementation(function (this: ControlChildAsync): Promise<void> {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 5);
            });
        });
        // enregion

        act(() => {
            render(<ControlParent />, container);
        });

        expect(container).toMatchSnapshot(
            '1. Всё пустое, т.к. у ControlParent еще старое состояние'
        );

        await act(async () => {
            jest.advanceTimersByTime(5);
        });

        expect(container).toMatchSnapshot(
            '2. ControlChildAsync построился, но в ControlParentAsync еще старое состояние'
        );

        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        expect(container).toMatchSnapshot(
            '3. Несмотря на то что у ControlParentAsync состояние изменилось, всё пустое, т.к. не проброшено до детей'
        );

        act(() => {
            jest.advanceTimersByTime(1);
        });

        expect(container).toMatchSnapshot(
            '4. Всё отрисовалось, т.к. произошло обновление'
        );
    });
});
