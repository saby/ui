/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { fireEvent } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import {
    focus,
    startDOMFocusSystem,
    stopDOMFocusSystem,
    FocusRoot,
    FocusArea,
    activate,
    FocusEnvironment,
} from 'UICore/Focus';
import { Control } from 'UICore/Base';
import InHooksActivateCaller from './Focus/Activate/InHooksActivateCaller';
import ActivationInReact from './Focus/Activate/ActivationInReact';
import FocusCallbacksRoot from './Focus/Callbacks/Root';
import FocusCallbacksRootWithReact from './Focus/Callbacks/RootWithReact';
import RootReactWithPortal from './Focus/Callbacks/RootReactWithPortal';
import RootWasabyWithPortal from './Focus/Callbacks/RootWasabyWithPortal';
import RestoreFocusRoot from './Focus/RestoreFocus/Root';
import RootWithReactOpener from './Focus/RestoreFocus/RootWithReactOpener';
import RestoreFocusRoot2 from './Focus/RestoreFocus/Root2';
import * as LayerCompatible from 'Lib/Control/LayerCompatible/LayerCompatible';
import FocusTabPressRoot from './Focus/TabPress/Root';
import StopTab from './Focus/TabPress/StopTab';
import FocusPreventFocusRoot from './Focus/PreventFocus/Root';
import RefsForwardingRoot from './Focus/FocusArea/RefsForwardingRoot';
import UpdateFocusRootTopComponent from './Focus/FocusRoot/UpdateFocusRootTopComponent';
import WasabyWithFocusRootReact from './Focus/WmlReactCompat/WasabyWithFocusRootReact';
import FocusSameElementFromOnFocus from './Focus/EnableScrollToElement/FocusSameElementFromOnFocus';
import EmulateScrollOnFocus from './Focus/EnableScrollToElement/EmulateScrollOnFocus';
import OneBigTestGetElementProps from 'ReactUnitTest/Focus/ElementFinder/OneBigTestGetElementProps';

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
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setTimeout);
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
        unmountComponentAtNode(container);
        stopDOMFocusSystem(container);
        container.remove();
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
            firstHOCActivatedSpy = jest.spyOn(FocusCallbacksRootProto, 'firstHOCActivatedCallback');
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
                const firstInputElement = document.getElementById('firstInputElement');
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
                const secondInputElement = document.getElementById('secondInputElement');
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

            expect(firstInputActivatedSpy.mock.invocationCallOrder[0]).toBeLessThan(
                firstHOCActivatedSpy.mock.invocationCallOrder[0]
            );
            expect(firstHOCActivatedSpy.mock.invocationCallOrder[0]).toBeLessThan(
                commonHOCActivatedSpy.mock.invocationCallOrder[0]
            );
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

            expect(firstInputActivatedSpy.mock.invocationCallOrder[0]).toBeLessThan(
                firstHOCActivatedSpy.mock.invocationCallOrder[0]
            );
            expect(firstHOCActivatedSpy.mock.invocationCallOrder[0]).toBeLessThan(
                commonHOCActivatedSpy.mock.invocationCallOrder[0]
            );
            expect(commonHOCActivatedSpy.mock.invocationCallOrder[0]).toBeLessThan(
                firstInputDeactivatedSpy.mock.invocationCallOrder[0]
            );
            expect(firstInputDeactivatedSpy.mock.invocationCallOrder[0]).toBeLessThan(
                firstHOCDeactivatedSpy.mock.invocationCallOrder[0]
            );
            expect(firstHOCDeactivatedSpy.mock.invocationCallOrder[0]).toBeLessThan(
                secondInputActivatedSpy.mock.invocationCallOrder[0]
            );
            expect(secondInputActivatedSpy.mock.invocationCallOrder[0]).toBeLessThan(
                secondHOCActivatedSpy.mock.invocationCallOrder[0]
            );

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

    describe('Вызов активации', () => {
        let consoleError: jest.SpyInstance;
        beforeEach(() => {
            consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        it('Вызов из _afterMount', () => {
            act(() => {
                creator(InHooksActivateCaller, { shouldActivateAfterMount: true }, container);
            });
            tick(0);

            expect(document.activeElement?.id).toBe('inHooksActivateCallerInnerInput');
            expect(consoleError).not.toHaveBeenCalled();
        });
        it('Вызов из _beforeMount', () => {
            act(() => {
                creator(InHooksActivateCaller, { shouldActivateBeforeMount: true }, container);
            });
            tick(0);

            expect(document.activeElement?.id).not.toBe('inHooksActivateCallerInnerInput');
            expect(consoleError).toHaveBeenCalledTimes(1);
            expect(consoleError).toHaveBeenCalledWith(
                expect.anything(),
                expect.stringMatching('Активация без DOM элемента невозможна'),
                expect.anything()
            );
        });
        it('Настройка автофокуса в чистом реакте', () => {
            act(() => {
                render(<ActivationInReact />, container);
                activate(container);
            });

            expect(document.activeElement?.getAttribute('data-qa')).toBe(
                'insideCorrectAutofocusChild'
            );

            const expectedRegExp =
                /Обнаружен атрибут ws-autofocus на DOM элементе .* data-qa="wrongAutofocusChild"/;
            expect(consoleError).toHaveBeenCalledWith(
                expect.anything(),
                expect.stringMatching(expectedRegExp),
                expect.anything()
            );
        });
    });

    describe('Фокусы в Порталах', () => {
        let onRootActivated: () => void;
        let onRootDeactivated: () => void;
        let onInputActivated: () => void;
        let onInputDeactivated: () => void;
        let onPortalActivated: () => void;
        let onPortalDeactivated: () => void;

        const inputId = 'inputId';
        const portalInputId = 'portalInputId';

        beforeEach(() => {
            onRootActivated = jest.fn();
            onRootDeactivated = jest.fn();
            onInputActivated = jest.fn();
            onInputDeactivated = jest.fn();
            onPortalActivated = jest.fn();
            onPortalDeactivated = jest.fn();
        });
        it('Подъём колбеков смены активности в чистом реакте', () => {
            act(() => {
                render(
                    <FocusEnvironment>
                        <RootReactWithPortal
                            onRootActivated={onRootActivated}
                            onRootDeactivated={onRootDeactivated}
                            onInputActivated={onInputActivated}
                            onInputDeactivated={onInputDeactivated}
                            inputId={inputId}
                            onPortalActivated={onPortalActivated}
                            onPortalDeactivated={onPortalDeactivated}
                            portalInputId={portalInputId}
                        />
                    </FocusEnvironment>,
                    container
                );
            });

            // Сначала сфокусируем инпут в портале.
            act(() => {
                focus(document.getElementById(portalInputId) as HTMLElement);
            });
            // Корень активировался
            expect(onRootActivated).toBeCalledTimes(1);
            expect(onRootDeactivated).toBeCalledTimes(0);

            // Портал активировался
            expect(onPortalActivated).toBeCalledTimes(1);
            expect(onPortalDeactivated).toBeCalledTimes(0);

            // С инпутом в приложении ничего не произошло
            expect(onInputActivated).toBeCalledTimes(0);
            expect(onInputDeactivated).toBeCalledTimes(0);

            // Переводим фокус на инпут в приложении.
            act(() => {
                focus(document.getElementById(inputId) as HTMLElement);
            });
            // С корнем ничего не произошло.
            expect(onRootActivated).toBeCalledTimes(1);
            expect(onRootDeactivated).toBeCalledTimes(0);

            // Портал деактивировался
            expect(onPortalActivated).toBeCalledTimes(1);
            expect(onPortalDeactivated).toBeCalledTimes(1);

            // Инпут в приложении активировался.
            expect(onInputActivated).toBeCalledTimes(1);
            expect(onInputDeactivated).toBeCalledTimes(0);
        });

        it('Нет ошибок в консоли, если у портала и его родителя общий Wasaby предок', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error');
            act(() => {
                creator(
                    RootWasabyWithPortal,
                    {
                        onRootActivated,
                        onRootDeactivated,
                        onInputActivated,
                        onInputDeactivated,
                        onPortalActivated,
                        onPortalDeactivated,
                        inputId,
                        portalInputId,
                    },
                    container
                );
            });

            // Сначала сфокусируем инпут в портале.
            act(() => {
                focus(document.getElementById(portalInputId) as HTMLElement);
            });

            // Портал активировался
            expect(onPortalActivated).toBeCalledTimes(1);
            expect(onPortalDeactivated).toBeCalledTimes(0);

            // Переводим фокус на инпут в приложении.
            act(() => {
                focus(document.getElementById(inputId) as HTMLElement);
            });

            // Портал деактивировался
            expect(onPortalActivated).toBeCalledTimes(1);
            expect(onPortalDeactivated).toBeCalledTimes(1);

            // И всё это без ошибок в консоли.
            expect(consoleErrorSpy).not.toBeCalled();
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
            act(() => {
                creator(RestoreFocusRoot, { opener: { _options: {} } }, container);
            });
            await tickAsync(0);
            await tickAsync(100);

            const firstInputElement = document.getElementById('firstInputElement');
            const parents = getParentFocusComponents(firstInputElement);

            expect(parents.length).toBe(3);
            expect(parents[0]._moduleName).toBe('ReactUnitTest/Focus/Input');
            expect(parents[1]._moduleName).toBe('ReactUnitTest/Focus/HOC');
            expect(parents[2]._moduleName).toBe('ReactUnitTest/Focus/RestoreFocus/Root');
        });

        it('при восстановлении фокуса, если есть замаунченный опенер в родителях, он должен участвовать', async () => {
            // отрисовываем компонент и сразу дожидаемся _afterMount
            act(() => {
                creator(
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

            const firstInputElement = document.getElementById('firstInputElement');
            const parents = getParentFocusComponents(firstInputElement);

            expect(parents.length).toBe(4);
            expect(parents[0]._moduleName).toBe('ReactUnitTest/Focus/Input');
            expect(parents[1]._moduleName).toBe('ReactUnitTest/Focus/HOC');
            expect(parents[2]._moduleName).toBe('ReactUnitTest/Focus/RestoreFocus/Root');
            expect(parents[3]._moduleName).toBe('opener');
        });

        it('при восстановлении фокуса корректно обрабатывается чистый реакт компонент опенер', () => {
            // отрисовываем компонент и дожидаемся перерисовки, заявленной в _afterMount.
            act(() => {
                creator(RootWithReactOpener, {}, container);
            });
            // ждём _afterMount
            tick(0);
            // ждём перерисовку из _afterMount.
            tick(1);

            const firstInputElement = document.getElementById('firstInputElement');
            const parents = getParentFocusComponents(firstInputElement);

            expect(
                parents.map((parent) => {
                    return parent._moduleName;
                })
            ).toMatchSnapshot();
        });

        it('При удалении активного элемента из WS3 фокус должен восстановиться поблизости', async () => {
            // LayerCompatible.load внутри ходит на BL.
            // Этот кейс не тестирует загрузку совместимости, только восстановление фокуса в ней.
            // Поэтому замокаем load, а все зависимости загрузим руками синхронно в тестовом модуле.
            jest.spyOn(LayerCompatible, 'load').mockImplementation(() => ({
                addCallback: (cb) => {
                    cb();
                },
            }));
            // отрисовываем компонент и сразу дожидаемся _afterMount
            let instance: RestoreFocusRoot2;
            act(() => {
                render(
                    <RestoreFocusRoot2
                        ref={(v) => {
                            instance = v;
                        }}
                    />,
                    container
                );
            });

            const ws3input = await screen.findByTestId('ws3input');

            focus(ws3input);
            expect(document.activeElement).toBe(ws3input);

            instance.hideFirstInput();
            await screen.findByText('WsControl is hidden');
            expect(document.activeElement.id).toBe('restoreFocusHere');
        });
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
                render(<StopTab shouldStopTabPress={shouldStopTabPress} />, container);
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
            const firstInputElement = document.getElementById('firstInputElement');
            const tabEvent = createTabDownEvent();

            act(() => {
                focus(firstInputElement);
                firstInputElement.dispatchEvent(tabEvent);
            });

            expect(document.activeElement.id).toBe('secondInputElement');
        });

        it('Переход на поле ввода внутри inline шаблона (ws:template)', () => {
            const secondInputElement = document.getElementById('secondInputElement');
            const tabEvent = createTabDownEvent();

            act(() => {
                focus(secondInputElement);
                secondInputElement.dispatchEvent(tabEvent);
            });

            expect(document.activeElement.id).toBe('thirdInputElement');
        });

        it('Переход по shift+tab на предыдущее поле ввода', () => {
            const secondInputElement = document.getElementById('secondInputElement');
            const shiftTabEvent = createTabDownEvent(true);

            act(() => {
                focus(secondInputElement);
                secondInputElement.dispatchEvent(shiftTabEvent);
            });

            expect(document.activeElement.id).toBe('firstInputElement');
        });

        it('Работает атрибут ws-tab-cycling, повешенный на обычный div в wml', () => {
            const fourthInputElement = document.getElementById('fourthInputElement');
            const fifthInputElement = document.getElementById('fifthInputElement');
            const tabEvent = createTabDownEvent();

            act(() => {
                focus(fourthInputElement);
                fourthInputElement.dispatchEvent(tabEvent);
            });
            expect(document.activeElement).toBe(fifthInputElement);

            act(() => {
                fifthInputElement.dispatchEvent(tabEvent);
            });
            expect(document.activeElement).toBe(fourthInputElement);
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
            const preventDefaultMock = jest.spyOn(mouseDownEvent, 'preventDefault');

            act(() => {
                inputElement.dispatchEvent(mouseDownEvent);
            });

            expect(preventDefaultMock).toHaveBeenCalled();
        });
    });

    describe('UI/Focus:FocusArea', () => {
        it('Проброс ref', () => {
            const refsTargetIdArr = [];
            act(() => {
                render(<RefsForwardingRoot refsTargetIdArr={refsTargetIdArr} />, container);
            });
            expect(refsTargetIdArr).toStrictEqual([
                'targetRefsId_thirdRef',
                'targetRefsId_secondRef',
                'targetRefsId_firstRef',
            ]);
        });
    });

    describe('UI/Focus:FocusRoot', () => {
        it('FocusArea докидывает свои пропсы только до ближайшего FocusRoot, ниже они не спускаются', () => {
            // Слишком простой тест для отдельного файла компонента.
            function RootComponent() {
                return (
                    <div>
                        <FocusArea tabIndex={1} autofocus={true}>
                            <FocusRoot as="div" className="expectFocusAreaTabIndex">
                                <FocusRoot as="div" className="expectDefaultTabIndex" />
                            </FocusRoot>
                        </FocusArea>
                    </div>
                );
            }
            act(() => {
                render(<RootComponent />, container);
            });
            expect(container).toMatchSnapshot();
        });
        it('При обновлении FocusRoot не теряются полученные из FocusArea пропсы', () => {
            act(() => {
                render(<UpdateFocusRootTopComponent />, container);
            });
            expect(container).toMatchSnapshot(
                '1. Первая отрисовка, пропсы из FocusArea долетели до FocusRoot'
            );

            act(() => {
                fireEvent.click(document.getElementById('elementToClick'));
            });

            expect(container).toMatchSnapshot(
                '2. FocusRoot обновился, пропсы из FocusArea не пропали'
            );
        });
    });

    describe('wml-react совместимость', () => {
        it('фокус-атрибуты из wml долетают до FocusRoot в реакте', () => {
            act(() => {
                creator(WasabyWithFocusRootReact, {}, container);
            });
            expect(container).toMatchSnapshot();
        });
    });

    describe('метод getElementProps', () => {
        it('Один большой тест, покрывающий метод целиком', () => {
            const testingResult = {};
            act(() => {
                render(<OneBigTestGetElementProps testingResult={testingResult} />, container);
            });
            expect(testingResult).toMatchSnapshot();
        });
    });

    describe('конфиг метода focus:', () => {
        it('enableScrollToElement равен true', () => {
            act(() => {
                render(<EmulateScrollOnFocus />, container);
            });
            const input = document.getElementById('input');
            const scrolledElement = document.getElementById('scrolledElement');

            act(() => {
                focus(input, { enableScrollToElement: true });
            });

            expect(document.activeElement?.id).toBe('input');
            expect(scrolledElement.scrollTop).toBe(1);
            expect(scrolledElement.scrollLeft).toBe(1);
            expect(input.scrollTop).toBe(1);
            expect(input.scrollLeft).toBe(1);
        });
        it('enableScrollToElement равен false', () => {
            act(() => {
                render(<EmulateScrollOnFocus />, container);
            });
            const input = document.getElementById('input');
            const scrolledElement = document.getElementById('scrolledElement');

            act(() => {
                focus(input, { enableScrollToElement: false });
            });

            expect(document.activeElement?.id).toBe('input');
            expect(scrolledElement.scrollTop).toBe(0);
            expect(scrolledElement.scrollLeft).toBe(0);
            expect(input.scrollTop).toBe(0);
            expect(input.scrollLeft).toBe(0);
        });
        it('enableScrollToElement равен "vertical"', () => {
            act(() => {
                render(<EmulateScrollOnFocus />, container);
            });
            const input = document.getElementById('input');
            const scrolledElement = document.getElementById('scrolledElement');

            act(() => {
                focus(input, { enableScrollToElement: 'vertical' });
            });

            expect(document.activeElement?.id).toBe('input');
            expect(scrolledElement.scrollTop).toBe(1);
            expect(scrolledElement.scrollLeft).toBe(0);
            expect(input.scrollTop).toBe(1);
            expect(input.scrollLeft).toBe(0);
        });
        it('enableScrollToElement равен "horizontal"', () => {
            act(() => {
                render(<EmulateScrollOnFocus />, container);
            });
            const input = document.getElementById('input');
            const scrolledElement = document.getElementById('scrolledElement');

            act(() => {
                focus(input, { enableScrollToElement: 'horizontal' });
            });

            expect(document.activeElement?.id).toBe('input');
            expect(scrolledElement.scrollTop).toBe(0);
            expect(scrolledElement.scrollLeft).toBe(1);
            expect(input.scrollTop).toBe(0);
            expect(input.scrollLeft).toBe(1);
        });

        it('enableScrollToElement равен "vertical", предварительно дважды вызван фокус одного элемента: сначала при маунте, потом из обработчика onFocus', () => {
            act(() => {
                render(
                    <FocusSameElementFromOnFocus>
                        <EmulateScrollOnFocus />
                    </FocusSameElementFromOnFocus>,
                    container
                );
            });
            const input = document.getElementById('input');
            const scrolledElement = document.getElementById('scrolledElement');

            act(() => {
                focus(input, { enableScrollToElement: 'vertical' });
            });

            expect(document.activeElement?.id).toBe('input');
            expect(scrolledElement.scrollTop).toBe(1);
            expect(scrolledElement.scrollLeft).toBe(0);
            expect(input.scrollTop).toBe(1);
            expect(input.scrollLeft).toBe(0);
        });
    });
});