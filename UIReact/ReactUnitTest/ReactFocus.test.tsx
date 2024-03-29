/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import {
    focus,
    activate,
    startDOMFocusSystem,
    stopDOMFocusSystem,
} from 'UICore/Focus';
import { Control } from 'UICore/Base';
import FocusCallbacksRoot from './Focus/Callbacks/Root';
import FocusCallbacksRootWithReact from './Focus/Callbacks/RootWithReact';
import RestoreFocusRoot from './Focus/RestoreFocus/Root';
import RootWithReactOpener from './Focus/RestoreFocus/RootWithReactOpener';
import RestoreFocusRoot2 from './Focus/RestoreFocus/Root2';
import FocusTabPressRoot from './Focus/TabPress/Root';
import StopTab from './Focus/TabPress/StopTab';
import FocusPreventFocusRoot from './Focus/PreventFocus/Root';

import getParentFocusComponents from 'UICore/_focus/Component/getParentFocusComponents';

const creator = Control.createControl;

describe('ReactFocus', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        jest.restoreAllMocks();
        jest.useFakeTimers();
        // Чтобы не зависеть от реализации requestAnimationFrame для jsdom.
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(
            setTimeout
        );
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
        unmountComponentAtNode(container);
        stopDOMFocusSystem(container);
        container.remove();
        container = null;
    });

    function tick(duration: number): void {
        act(() => {
            jest.advanceTimersByTime(duration);
        });
    }

    /**
     * Асинхронный аналог {@link tick}, отличается тем, что эта версия позволяет выполниться коллбекам промисов.
     * @param duration Значение, на которое должно продвинуться время.
     */
    async function tickAsync(duration: number): Promise<void> {
        await act(async () => {
            jest.advanceTimersByTime(duration);
        });
    }

    function createTabDownEvent(shiftKey: boolean = false): KeyboardEvent {
        return new KeyboardEvent('keydown', {
            key: 'Tab',
            bubbles: true,
            shiftKey,
        });
    }

    describe('Колбеки активации и деактивации', () => {
        const FocusCallbacksRootProto = FocusCallbacksRoot.prototype;

        let firstHOCActivatedSpy: jest.SpyInstance;
        let firstHOCDeactivatedSpy: jest.SpyInstance;

        let firstInputActivatedSpy: jest.SpyInstance;
        let firstInputDeactivatedSpy: jest.SpyInstance;

        let secondHOCActivatedSpy: jest.SpyInstance;

        let secondInputActivatedSpy: jest.SpyInstance;
        let secondInputDeactivatedSpy: jest.SpyInstance;

        let commonHOCActivatedSpy: jest.SpyInstance;
        let commonHOCDeactivatedSpy: jest.SpyInstance;

        beforeEach(async () => {
            firstHOCActivatedSpy = jest.spyOn(
                FocusCallbacksRootProto,
                'firstHOCActivatedCallback'
            );
            firstHOCDeactivatedSpy = jest.spyOn(
                FocusCallbacksRootProto,
                'firstHOCDeactivatedCallback'
            );

            firstInputActivatedSpy = jest.spyOn(
                FocusCallbacksRootProto,
                'firstInputActivatedCallback'
            );
            firstInputDeactivatedSpy = jest.spyOn(
                FocusCallbacksRootProto,
                'firstInputDeactivatedCallback'
            );

            secondHOCActivatedSpy = jest.spyOn(
                FocusCallbacksRootProto,
                'secondHOCActivatedCallback'
            );

            secondInputActivatedSpy = jest.spyOn(
                FocusCallbacksRootProto,
                'secondInputActivatedCallback'
            );
            secondInputDeactivatedSpy = jest.spyOn(
                FocusCallbacksRootProto,
                'secondInputDeactivatedCallback'
            );

            commonHOCActivatedSpy = jest.spyOn(
                FocusCallbacksRootProto,
                'commonHOCActivatedCallback'
            );
            commonHOCDeactivatedSpy = jest.spyOn(
                FocusCallbacksRootProto,
                'commonHOCDeactivatedCallback'
            );

            startDOMFocusSystem(container, {
                focusEvents: true,
                tabDown: true,
                restoreFocus: false,
            });
            act(() => {
                creator(FocusCallbacksRoot, {}, container);
            });
            await tickAsync(0);
        });

        describe('Аргументы колбеков', () => {
            it('Перевод фокуса без нажатия на tab: isTabPressed false, isShiftKey false', () => {
                act(() => {
                    focus(document.getElementById('firstInputElement'));
                });
                tick(0);

                act(() => {
                    focus(document.getElementById('secondInputElement'));
                });
                tick(0);

                const expectedArg = {
                    keyPressedData: null,
                    isTabPressed: false,
                    isShiftKey: false,
                };

                const expectedActivatedArg = {
                    _$to: expect.anything(),
                    ...expectedArg,
                };
                expect(firstInputDeactivatedSpy).toHaveBeenCalledWith(
                    expect.anything(),
                    expectedArg
                );
                expect(secondInputActivatedSpy).toHaveBeenCalledWith(
                    expect.anything(),
                    expectedActivatedArg
                );
            });

            it('Перевод фокуса нажатием на tab: isTabPressed true, isShiftKey false', () => {
                const firstInputElement =
                    document.getElementById('firstInputElement');
                const tabEvent = createTabDownEvent();
                act(() => {
                    focus(firstInputElement);
                });
                tick(0);

                act(() => {
                    firstInputElement.dispatchEvent(tabEvent);
                });
                tick(0);

                const expectedArg = {
                    keyPressedData: {
                        key: 'Tab',
                        shiftKey: false,
                        target: firstInputElement,
                        altKey: false,
                        ctrlKey: false,
                    },
                    isTabPressed: true,
                    isShiftKey: false,
                };

                const expectedActivatedArg = {
                    _$to: expect.anything(),
                    ...expectedArg,
                };
                expect(firstInputDeactivatedSpy).toHaveBeenCalledWith(
                    expect.anything(),
                    expectedArg
                );
                expect(secondInputActivatedSpy).toHaveBeenCalledWith(
                    expect.anything(),
                    expectedActivatedArg
                );
            });

            it('Перевод фокуса нажатием на shift+tab: isTabPressed true, isShiftKey true', () => {
                const secondInputElement =
                    document.getElementById('secondInputElement');
                const tabEvent = createTabDownEvent(true);
                act(() => {
                    focus(secondInputElement);
                });
                tick(0);

                act(() => {
                    secondInputElement.dispatchEvent(tabEvent);
                });
                tick(0);

                const expectedArg = {
                    keyPressedData: {
                        key: 'Tab',
                        shiftKey: true,
                        target: secondInputElement,
                        altKey: false,
                        ctrlKey: false,
                    },
                    isTabPressed: true,
                    isShiftKey: true,
                };

                const expectedActivatedArg = {
                    _$to: expect.anything(),
                    ...expectedArg,
                };
                expect(secondInputDeactivatedSpy).toHaveBeenCalledWith(
                    expect.anything(),
                    expectedArg
                );
                expect(firstInputActivatedSpy).toHaveBeenCalledWith(
                    expect.anything(),
                    expectedActivatedArg
                );
            });
        });

        it('При первой фокусировке должны стрелять все родительские колбеки', () => {
            act(() => {
                focus(document.getElementById('firstInputElement'));
            });
            tick(0);

            expect(
                firstInputActivatedSpy.mock.invocationCallOrder[0]
            ).toBeLessThan(firstHOCActivatedSpy.mock.invocationCallOrder[0]);
            expect(
                firstHOCActivatedSpy.mock.invocationCallOrder[0]
            ).toBeLessThan(commonHOCActivatedSpy.mock.invocationCallOrder[0]);
        });

        it('Колбеки хоков должны стрелять только один раз', () => {
            act(() => {
                focus(document.getElementById('firstInputElement'));
            });
            tick(0);

            expect(commonHOCActivatedSpy.mock.calls.length).toBe(1);
            expect(firstHOCActivatedSpy.mock.calls.length).toBe(1);
            expect(firstInputActivatedSpy.mock.calls.length).toBe(1);
        });

        it('При смене фокуса должны стрелять только колбеки до общего родителя', () => {
            act(() => {
                focus(document.getElementById('firstInputElement'));
            });
            tick(0);

            act(() => {
                focus(document.getElementById('secondInputElement'));
            });
            tick(0);

            expect(
                firstInputActivatedSpy.mock.invocationCallOrder[0]
            ).toBeLessThan(firstHOCActivatedSpy.mock.invocationCallOrder[0]);
            expect(
                firstHOCActivatedSpy.mock.invocationCallOrder[0]
            ).toBeLessThan(commonHOCActivatedSpy.mock.invocationCallOrder[0]);
            expect(
                commonHOCActivatedSpy.mock.invocationCallOrder[0]
            ).toBeLessThan(
                firstInputDeactivatedSpy.mock.invocationCallOrder[0]
            );
            expect(
                firstInputDeactivatedSpy.mock.invocationCallOrder[0]
            ).toBeLessThan(firstHOCDeactivatedSpy.mock.invocationCallOrder[0]);
            expect(
                firstHOCDeactivatedSpy.mock.invocationCallOrder[0]
            ).toBeLessThan(secondInputActivatedSpy.mock.invocationCallOrder[0]);
            expect(
                secondInputActivatedSpy.mock.invocationCallOrder[0]
            ).toBeLessThan(secondHOCActivatedSpy.mock.invocationCallOrder[0]);

            expect(commonHOCDeactivatedSpy.mock.calls.length).toBe(0);
        });

        it('Колбеки смены активности для чистого реакта', () => {
            let instance: FocusCallbacksRootWithReact;
            act(() => {
                unmountComponentAtNode(container);
                instance = creator(
                    FocusCallbacksRootWithReact,
                    {},
                    container,
                    false
                ) as FocusCallbacksRootWithReact;
            });
            tick(0);

            // FocusCallbacksRootWithReact активируется на afterMount. Должен сфокусироваться input внутри ReactInput.
            // Соответсвенно, из данных колбеков должен стрельнуть только onRootActivated.
            expect(document.activeElement.id).toBe('focusCallbacksReactId');
            expect([
                instance.onRootActivatedCount,
                instance.onRootDeactivatedCount,
                instance.onWasabyActivatedCount,
                instance.onReactDeactivatedCount,
            ]).toEqual([1, 0, 0, 0]);

            // Переводим фокус на input внутри WasabyInput. WasabyInput становится активным,
            // а ReactInput теряет активность. Активность корня не меняется.
            act(() => {
                document.getElementById('focusCallbacksWasabyId').focus();
            });
            expect(document.activeElement.id).toBe('focusCallbacksWasabyId');
            expect([
                instance.onRootActivatedCount,
                instance.onRootDeactivatedCount,
                instance.onWasabyActivatedCount,
                instance.onReactDeactivatedCount,
            ]).toEqual([1, 0, 1, 1]);
        });
    });

    describe('Восстановление фокуса', () => {
        beforeEach(() => {
            startDOMFocusSystem(container, {
                focusEvents: false,
                tabDown: false,
                restoreFocus: true,
            });
        });

        it('При удалении активного элемента из DOM фокус должен восстановиться поблизости', async () => {
            // отрисовываем компонент и сразу дожидаемся _afterMount
            let instance: RestoreFocusRoot;
            act(() => {
                render(
                    <RestoreFocusRoot
                        ref={(v) => {
                            instance = v;
                        }}
                    />,
                    container
                );
            });
            await tickAsync(0);
            await tickAsync(100);

            focus(document.getElementById('firstInputElement'));

            instance.hideFirstInput();
            // при изменении реактивного свойства _forceUpdate вызывается через Promise.resolve
            await tickAsync(0);

            expect(document.activeElement.id).toBe('restoreFocusHere');
        });

        it('при восстановлении фокуса, если есть незамаунченный опенер в родителях, он не должен мешать', async () => {
            // отрисовываем компонент и сразу дожидаемся _afterMount
            let instance: RestoreFocusRoot;
            act(() => {
                instance = creator(
                    RestoreFocusRoot,
                    { opener: { _options: {} } },
                    container
                );
            });
            await tickAsync(0);
            await tickAsync(100);

            const firstInputElement =
                document.getElementById('firstInputElement');
            const parents = getParentFocusComponents(firstInputElement);

            expect(parents.length).toBe(3);
            expect(parents[0]._moduleName).toBe('ReactUnitTest/Focus/Input');
            expect(parents[1]._moduleName).toBe('ReactUnitTest/Focus/HOC');
            expect(parents[2]._moduleName).toBe(
                'ReactUnitTest/Focus/RestoreFocus/Root'
            );
        });

        it('при восстановлении фокуса, если есть замаунченный опенер в родителях, он должен участвовать', async () => {
            // отрисовываем компонент и сразу дожидаемся _afterMount
            let instance: RestoreFocusRoot;
            act(() => {
                instance = creator(
                    RestoreFocusRoot,
                    {
                        opener: {
                            _moduleName: 'opener',
                            _container: document.createElement('div'),
                            _options: {},
                        },
                    },
                    container
                );
            });
            await tickAsync(0);
            await tickAsync(100);

            const firstInputElement =
                document.getElementById('firstInputElement');
            const parents = getParentFocusComponents(firstInputElement);

            expect(parents.length).toBe(4);
            expect(parents[0]._moduleName).toBe('ReactUnitTest/Focus/Input');
            expect(parents[1]._moduleName).toBe('ReactUnitTest/Focus/HOC');
            expect(parents[2]._moduleName).toBe(
                'ReactUnitTest/Focus/RestoreFocus/Root'
            );
            expect(parents[3]._moduleName).toBe('opener');
        });

        it('при восстановлении фокуса корректно обрабатывается чистый реакт компонент опенер', () => {
            // отрисовываем компонент и дожидаемся перерисовки, заявленной в _afterMount.
            let instance: RootWithReactOpener;
            act(() => {
                instance = creator(RootWithReactOpener, {}, container);
            });
            // ждём _afterMount
            tick(0);
            // ждём перерисовку из _afterMount.
            tick(1);

            const firstInputElement =
                document.getElementById('firstInputElement');
            const parents = getParentFocusComponents(firstInputElement);

            expect(
                parents.map((parent) => {
                    return parent._moduleName;
                })
            ).toMatchSnapshot();
        });

        // it('При удалении активного элемента из WS3 фокус должен восстановиться поблизости', async () => {
        //     // отрисовываем компонент и сразу дожидаемся _afterMount
        //     let instance: RestoreFocusRoot2;
        //     act(() => {
        //         render(<RestoreFocusRoot2 ref={(v) => {instance = v;}}/>, container);
        //     });
        //     tick(0);
        //
        //     activate(document.getElementById('wsControl'));
        //
        //     instance.hideFirstInput();
        //     // при изменении реактивного свойства _forceUpdate вызывается через Promise.resolve
        //     await tickAsync(0);
        //
        //     expect(document.activeElement.id).toBe('restoreFocusHere');
        // });
    });

    it.each([
        [
            'нет вызова stopPropagation, обработчик системы фокусов вызывается.',
            false,
            'secondInputElement',
        ],
        [
            'есть вызов stopPropagation, обработчик системы фокусов не вызывается.',
            true,
            'firstInputElement',
        ],
    ])(
        'В прикладном обработчике при нажатии на tab %s',
        (name, shouldStopTabPress, expectedActiveId) => {
            startDOMFocusSystem(container, {
                focusEvents: false,
                tabDown: true,
                restoreFocus: false,
            });
            const tabEvent = createTabDownEvent();

            // StopTab фокусирует firstInputElement сразу после маунта
            act(() => {
                render(
                    <StopTab shouldStopTabPress={shouldStopTabPress} />,
                    container
                );
            });

            document.activeElement.dispatchEvent(tabEvent);
            expect(document.activeElement.id).toBe(expectedActiveId);
        }
    );

    describe('Обработка нажатия на tab', () => {
        beforeEach(() => {
            startDOMFocusSystem(container, {
                focusEvents: false,
                tabDown: true,
                restoreFocus: false,
            });

            act(() => {
                render(<FocusTabPressRoot />, container);
            });
        });

        it('Переход по tab на следующее поле ввода', () => {
            const firstInputElement =
                document.getElementById('firstInputElement');
            const tabEvent = createTabDownEvent();

            act(() => {
                focus(firstInputElement);
                firstInputElement.dispatchEvent(tabEvent);
            });

            expect(document.activeElement.id).toBe('secondInputElement');
        });

        it('Переход на поле ввода внутри inline шаблона (ws:template)', () => {
            const secondInputElement =
                document.getElementById('secondInputElement');
            const tabEvent = createTabDownEvent();

            act(() => {
                focus(secondInputElement);
                secondInputElement.dispatchEvent(tabEvent);
            });

            expect(document.activeElement.id).toBe('thirdInputElement');
        });

        it('Переход по shift+tab на предыдущее поле ввода', () => {
            const secondInputElement =
                document.getElementById('secondInputElement');
            const shiftTabEvent = createTabDownEvent(true);

            act(() => {
                focus(secondInputElement);
                secondInputElement.dispatchEvent(shiftTabEvent);
            });

            expect(document.activeElement.id).toBe('firstInputElement');
        });
    });
    describe('Запрет фокуса', () => {
        beforeEach(() => {
            startDOMFocusSystem(container, {
                focusEvents: true,
                tabDown: false,
                restoreFocus: false,
            });
        });

        it('Запрет фокуса по клику внутри области с атрибутом ws-no-focus', () => {
            act(() => {
                render(<FocusPreventFocusRoot />, container);
            });
            tick(0);

            const inputElement = document.getElementById('inputElement');
            const mouseDownEvent = new MouseEvent('mousedown', {
                bubbles: true,
            });
            const preventDefaultMock = jest.spyOn(
                mouseDownEvent,
                'preventDefault'
            );

            act(() => {
                inputElement.dispatchEvent(mouseDownEvent);
            });

            expect(preventDefaultMock).toHaveBeenCalled();
        });
    });
});
