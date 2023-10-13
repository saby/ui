/**
 * @jest-environment jsdom
 */
/* eslint-disable max-classes-per-file */
import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { createSandbox, SinonSandbox, SinonFakeTimers } from 'sinon';
import { delay } from 'Types/function';
import { assert } from 'chai';
import { Control } from 'UICore/Base';

import TestControl from './resources/ControlTest/TestControl';
import TestControl2 from './resources/ControlTest/TestControl2';
import TestControl2Inner from './resources/ControlTest/TestControl2Inner';
import ControlWithState from './resources/ControlTest/ControlWithState';
import TestDefaultOptions from './resources/ControlTest/TestDefaultOptions';
import TestDefaultOptions2 from './resources/ControlTest/TestDefaultOptions2';
import DefaultOptionsWithObjectChild from './resources/ControlTest/DefaultOptionsWithObjectChild';
import DefaultOptionsWithObjectParent from './resources/ControlTest/DefaultOptionsWithObjectParent';
import AttributesHoc from './resources/ControlTest/AttributesParent';
import ParentKey from './resources/ControlTest/RestoreKeyProp/ParentKey';
import ShouldUpdateParent from './resources/ControlTest/ShouldUpdateParent';
import CompatbileEmulate from './resources/ControlTest/CompatbileEmulate';
import AsyncRoot from './resources/ControlTest/ClearAfterUnmount/AsyncRoot';
import SyncRoot from './resources/ControlTest/ClearAfterUnmount/SyncRoot';
import ParentLinkRoot from './resources/ControlTest/ClearAfterUnmount/ParentLinkRoot';
import BeforeUpdateLinkCompareRoot from './resources/ControlTest/BeforeUpdateLinkCompareRoot';

import WasabyRoot from './resources/ControlTest/WasabyReact/WasabyRoot';
import WasabyControl from 'ReactUnitTest/_base/resources/ControlTest/WasabyReact/WasabyControl';
import WasabyControlWithClass from 'ReactUnitTest/_base/resources/ControlTest/WasabyReact/WasabyControlWithClass';
import WasabyControlHoc from 'ReactUnitTest/_base/resources/ControlTest/WasabyReact/WasabyControlHoc';
import WasabyWithTemplate from 'ReactUnitTest/_base/resources/ControlTest/WasabyReact/WasabyWithTemplate';
import WasabyControlHocWithClass from 'ReactUnitTest/_base/resources/ControlTest/WasabyReact/WasabyControlHocWithClass';
import WasabyWithTemplateWithClass from 'ReactUnitTest/_base/resources/ControlTest/WasabyReact/WasabyWithTemplateWithClass';

import HooksCallOrderRoot from './resources/ControlTest/HooksCallOrder/HooksCallOrderRoot';
import ControlToCreate from './resources/ControlTest/HooksCallOrder/ControlToCreate';
import ControlToUpdate from './resources/ControlTest/HooksCallOrder/ControlToUpdate';

import ServiceFields from './resources/ControlTest/ServiceFields/ServiceFields';
import WasabyWithReactInRoot from './resources/ControlTest/ServiceFields/WasabyWithReactInRoot';

const creator = Control.createControl;
const destroyer = Control.destroyControl;

async function callComponentDidMountTick() {
    return act(async () => {
        await Promise.resolve();
    });
}

describe('UIReact/UICore/_base/Control jsdom', () => {
    describe('Создание контрола', () => {
        let container;

        beforeEach(() => {
            /*
            _afterMount и _afterUpdate зовутся в отдельной таске, чтобы браузер мог отрисовать кадр.
            Чтобы не делать тесты асинхронными, мы просто мокнем таймеры и сами будем управлять временем.
             */
            jest.useFakeTimers();
            container = document.createElement('div');
            document.body.appendChild(container);
            jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setTimeout);
        });

        afterEach(() => {
            jest.useRealTimers();
            unmountComponentAtNode(container);
            container.remove();
            container = null;
            jest.restoreAllMocks();
        });

        it('Создание корневого контрола внутри ws3', async () => {
            // region Setup
            let instance;
            act(() => {
                instance = creator(CompatbileEmulate, {}, container);
            });
            // endregion

            // Делаем так, чтобы первое обновление ребенка прошло как обычно
            await act(async () => {
                instance.changeTestOption('some value');
            });

            // пропустить все таймеры, чтобы произошел полный цикл обновления
            await act(async () => {
                jest.runAllTimers();
            });

            expect(container).toMatchSnapshot('Атрибуты смержены');

            destroyer(instance, container);
        });
    });

    describe('хуки жизненного цикла jest', () => {
        /**
         * Эта функция существует для того, чтобы не забывать оборачивать тики в act.
         * Это нужно, чтобы реакт реагировал на изменение времени и обновлял компоненты.
         * @param duration Значение, на которое должно продвинуться время.
         */
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
            return act(async () => {
                // в новой версии sinon есть clock.tickAsync, который в теории делает то же самое
                jest.advanceTimersByTime(duration);
                await Promise.resolve();
            });
        }

        let container: HTMLDivElement;

        beforeEach(() => {
            jest.useFakeTimers();
            container = document.createElement('div');
            document.body.appendChild(container);
            jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setTimeout);
        });

        afterEach(() => {
            jest.useRealTimers();
            unmountComponentAtNode(container);
            container.remove();
            container = null;
            jest.restoreAllMocks();
        });

        it('Порядок _afterMount и _afterUpdate хуков в сложном обновлении', async () => {
            const timer = 100;
            jest.spyOn(ControlToCreate.prototype, '_beforeMount').mockImplementation(
                function (): Promise<void> {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve();
                        }, timer);
                    });
                }
            );
            const afterMountSpy = jest.spyOn(ControlToCreate.prototype, '_afterMount');
            const afterUpdateSpy = jest.spyOn(ControlToUpdate.prototype, '_afterUpdate');
            let instance: HooksCallOrderRoot;
            act(() => {
                instance = creator(HooksCallOrderRoot, {}, container) as HooksCallOrderRoot;
            });
            tick(1);

            instance._children.childWithCreatingInside.showChild();
            instance._children.childWithUpdatingInside.upCounter();

            tick(0);
            await tickAsync(timer);
            tick(0);

            const afterMountCallOrder = afterMountSpy.mock.invocationCallOrder;
            const afterMountLastCall = afterMountCallOrder[afterMountCallOrder.length - 1];
            const afterUpdateCallOrder = afterUpdateSpy.mock.invocationCallOrder;
            const afterUpdateLastCall = afterUpdateCallOrder[afterUpdateCallOrder.length - 1];

            // Несмотря на то, что реакт обновит синхронного ребенка раньше, чем построит асинхронного,
            // _afterMount должен позваться раньше. Потому что запрос на построение асинхронного был раньше.
            expect(afterMountLastCall).toBeLessThan(afterUpdateLastCall);
        });
    });

    describe('хуки жизненного цикла', () => {
        let container: HTMLDivElement;
        let sandbox: SinonSandbox;
        let clock: SinonFakeTimers;
        let consoleMock;

        beforeEach(() => {
            sandbox = createSandbox();
            /*
            _afterMount и _afterUpdate зовутся в отдельной таске, чтобы браузер мог отрисовать кадр.
            Чтобы не делать тесты асинхронными, мы просто мокнем таймеры и сами будем управлять временем.
             */
            clock = sandbox.useFakeTimers();
            consoleMock = jest.spyOn(console, 'error').mockImplementation();
            container = document.createElement('div');
            document.body.appendChild(container);
        });

        afterEach(() => {
            clock.restore();
            sandbox.restore();
            consoleMock.mockRestore();
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
                clock.tick(duration);
                await Promise.resolve();
            });
        }

        // В данный момент довольно сложная система вызова обновления, выделим его тик отдельно.
        async function tickWasabyUpdate(): Promise<void> {
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

        it('при первом построении должны вызываться только хуки mount-фазы', async () => {
            // region Setup
            const _beforeMountStub = sandbox.stub(TestControl.prototype, '_beforeMount');
            const _componentDidMountStub = sandbox.stub(
                TestControl.prototype,
                '_componentDidMount'
            );
            const _afterMountStub = sandbox.stub(TestControl.prototype, '_afterMount');

            const _beforeUpdateStub = sandbox.stub(TestControl.prototype, '_beforeUpdate');
            const _afterRenderStub = sandbox.stub(TestControl.prototype, '_afterRender');
            const _afterUpdateStub = sandbox.stub(TestControl.prototype, '_afterUpdate');

            const _beforeUnmountStub = sandbox.stub(TestControl.prototype, '_beforeUnmount');
            // endregion

            act(() => {
                render(<TestControl />, container);
            });
            await callComponentDidMountTick();
            tick(0);

            sandbox.assert.callOrder(_beforeMountStub, _componentDidMountStub, _afterMountStub);
            sandbox.assert.notCalled(_beforeUpdateStub);
            sandbox.assert.notCalled(_afterRenderStub);
            sandbox.assert.notCalled(_afterUpdateStub);
            sandbox.assert.notCalled(_beforeUnmountStub);
        });

        it('при построении с асинхронным _beforeMount должны вызываться только хуки mount-фазы', async () => {
            // region Setup
            const _componentDidMountStub = sandbox.stub(
                TestControl.prototype,
                '_componentDidMount'
            );
            const _afterMountStub = sandbox.stub(TestControl.prototype, '_afterMount');

            const _beforeUpdateStub = sandbox.stub(TestControl.prototype, '_beforeUpdate');
            const _afterRenderStub = sandbox.stub(TestControl.prototype, '_afterRender');
            const _afterUpdateStub = sandbox.stub(TestControl.prototype, '_afterUpdate');

            const _beforeUnmountStub = sandbox.stub(TestControl.prototype, '_beforeUnmount');
            // endregion
            const PROMISE_WAIT_TIME = 1000;
            const _beforeMountStub = sandbox
                .stub(TestControl.prototype, '_beforeMount')
                .callsFake((): Promise<void> => {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve();
                        }, PROMISE_WAIT_TIME);
                    });
                });

            act(() => {
                render(<TestControl />, container);
            });

            sandbox.assert.calledOnce(_beforeMountStub);
            sandbox.assert.notCalled(_componentDidMountStub);
            sandbox.assert.notCalled(_afterMountStub);

            // на всякий случай проверяем, что даже в следующем тике не вызвался ни один хук
            tick(0);

            sandbox.assert.calledOnce(_beforeMountStub);
            sandbox.assert.notCalled(_componentDidMountStub);
            sandbox.assert.notCalled(_afterMountStub);

            await tickAsync(PROMISE_WAIT_TIME);
            tick(0);

            sandbox.assert.callOrder(_componentDidMountStub, _afterMountStub);

            sandbox.assert.notCalled(_beforeUpdateStub);
            sandbox.assert.notCalled(_afterRenderStub);
            sandbox.assert.notCalled(_afterUpdateStub);
            sandbox.assert.notCalled(_beforeUnmountStub);
        });

        it('при обновлении должны вызываться только хуки update-фазы', async () => {
            // region Setup
            // небольшой компонент, который прокидывает состояние в ребёнка
            class Parent extends React.Component<
                {},
                {
                    childOption: string;
                }
            > {
                constructor(props: {}) {
                    super(props);
                    this.state = {
                        childOption: '123',
                    };
                }
                render(): React.ReactNode {
                    return <TestControl testOption={this.state.childOption} />;
                }
            }
            const _beforeMountStub = sandbox.stub(TestControl.prototype, '_beforeMount');
            const _componentDidMountStub = sandbox.stub(
                TestControl.prototype,
                '_componentDidMount'
            );
            const _afterMountStub = sandbox.stub(TestControl.prototype, '_afterMount');

            const _beforeUpdateStub = sandbox.stub(TestControl.prototype, '_beforeUpdate');
            const _shouldUpdateStub = sandbox.spy(TestControl.prototype, '_shouldUpdate');
            const _afterRenderStub = sandbox.stub(TestControl.prototype, '_afterRender');
            const _afterUpdateStub = sandbox.stub(TestControl.prototype, '_afterUpdate');

            const _beforeUnmountStub = sandbox.stub(TestControl.prototype, '_beforeUnmount');

            // отрисовываем компонент и сразу дожидаемся _afterMount
            let instance;
            act(() => {
                render(
                    <Parent
                        ref={(v) => {
                            instance = v;
                        }}
                    />,
                    container
                );
            });
            await callComponentDidMountTick();
            tick(0);
            // endregion

            // обновлений ещё не было, так что ничего не должно быть вызвано
            sandbox.assert.notCalled(_beforeUpdateStub);
            sandbox.assert.notCalled(_shouldUpdateStub);
            sandbox.assert.notCalled(_afterRenderStub);
            sandbox.assert.notCalled(_afterUpdateStub);

            act(() => {
                instance.setState({
                    childOption: '456',
                });
            });
            tick(0);

            sandbox.assert.callOrder(
                _beforeUpdateStub,
                _shouldUpdateStub,
                _afterRenderStub,
                _afterUpdateStub
            );
            /*
            другой тест проверяет, что хуки mount-фазы вызываются в нужное время,
            здесь мы просто проверяем, что они не вызывались при обновлении
             */
            sandbox.assert.calledOnce(_beforeMountStub);
            sandbox.assert.calledOnce(_componentDidMountStub);
            sandbox.assert.calledOnce(_afterMountStub);
            sandbox.assert.notCalled(_beforeUnmountStub);
        });

        it('_beforeUnmount вызывается при уничтожении компонента', async () => {
            // region Setup
            const _beforeMountStub = sandbox.stub(TestControl.prototype, '_beforeMount');
            const _componentDidMountStub = sandbox.stub(
                TestControl.prototype,
                '_componentDidMount'
            );
            const _afterMountStub = sandbox.stub(TestControl.prototype, '_afterMount');

            const _beforeUpdateStub = sandbox.stub(TestControl.prototype, '_beforeUpdate');
            const _afterRenderStub = sandbox.stub(TestControl.prototype, '_afterRender');
            const _afterUpdateStub = sandbox.stub(TestControl.prototype, '_afterUpdate');

            const _beforeUnmountStub = sandbox.stub(TestControl.prototype, '_beforeUnmount');
            // небольшой компонент, который по флагу рисует детей
            class Parent extends React.Component<
                {
                    children: React.ReactElement;
                },
                {
                    renderChildren: boolean;
                }
            > {
                constructor(props: { children: React.ReactElement }) {
                    super(props);
                    this.state = {
                        renderChildren: true,
                    };
                }
                render(): React.ReactNode {
                    return this.state.renderChildren ? this.props.children : <div>123</div>;
                }
            }

            // отрисовываем компонент и сразу дожидаемся _afterMount
            let instance;
            act(() => {
                render(
                    <Parent
                        ref={(v) => {
                            instance = v;
                        }}
                    >
                        <TestControl />
                    </Parent>,
                    container
                );
            });
            await callComponentDidMountTick();
            tick(0);
            // endregion

            act(() => {
                instance.setState({
                    renderChildren: false,
                });
            });

            // Для поддержания порядка _beforeUnmount вызываются через Promise
            await tickWasabyUpdate();

            sandbox.assert.calledOnce(_beforeUnmountStub);

            /*
            другой тест проверяет, что хуки mount-фазы вызываются в нужное время,
            здесь мы просто проверяем, что они не вызывались при уничтожении
             */
            sandbox.assert.calledOnce(_beforeMountStub);
            sandbox.assert.calledOnce(_componentDidMountStub);
            sandbox.assert.calledOnce(_afterMountStub);
            /*
            другой тест проверяет, что хуки update-фазы вызываются в нужное время,
            здесь мы просто проверяем, что они не вызывались при уничтожении
             */
            sandbox.assert.notCalled(_beforeUpdateStub);
            sandbox.assert.notCalled(_afterRenderStub);
            sandbox.assert.notCalled(_afterUpdateStub);
        });

        it('при вызове синхронного _beforeMount аргументы метода и состояние инстанса совпадают с Wasaby', () => {
            const _beforeMountStub = sandbox
                .stub(TestControl.prototype, '_beforeMount')
                .callsFake(function (this: TestControl): void {
                    assert.isEmpty(this._options);
                });

            act(() => {
                render(<TestControl testOption="123" />, container);
            });

            const expectedOptions = {
                theme: 'default',
                readOnly: false,
                testOption: '123',
            };
            const expectedReceivedState = undefined;
            sandbox.assert.calledWithMatch(
                _beforeMountStub,
                expectedOptions,
                undefined,
                expectedReceivedState
            );
        });

        it('при вызове асинхронного _beforeMount состояние инстанса не меняется до завершения асинхронщины', () => {
            let resolved = false; // по сути это флаг для контроля того, что мы в тесте попали в коллбек Promise
            const PROMISE_WAIT_TIME = 1000;

            const expectedOptions = {
                theme: 'default',
                readOnly: false,
                testOption: '123',
            };

            /**
             * В ходе разбора ошибки https://online.sbis.ru/opendoc.html?guid=6ca01893-a8cd-4135-a2b5-7dad5ce9e0b1
             * выяснилось, что прикладники кладут в StateReceiver объект опций.
             * В реакте для этого объекта появились служебные поля. _beforeMount я вызываю без этих полей,
             * но фактически они есть. Поэтому разницы между expectedOptions и expectedOptionsAtInstance;
             */
            const expectedOptionsAtInstance = {
                ...expectedOptions,
                _$attributes: {
                    _$parentTemplateId: undefined,
                    _isRootElement: true,
                    attributes: {
                        'ws-creates-context': 'true',
                        'ws-delegates-tabfocus': 'true',
                    },
                    context: undefined,
                    events: {},
                    isReactWrapper: true,
                    key: 'undefined_el_',
                },
            };

            const _beforeMountStub = sandbox
                .stub(TestControl.prototype, '_beforeMount')
                .callsFake(function (this: TestControl): Promise<void> {
                    assert.isEmpty(this._options);
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            assert.deepInclude(this._options, expectedOptionsAtInstance);
                            resolved = true;
                            resolve();
                        }, PROMISE_WAIT_TIME);
                    });
                });

            act(() => {
                render(<TestControl testOption="123" />, container);
            });

            const expectedReceivedState = undefined;
            sandbox.assert.calledWithMatch(
                _beforeMountStub,
                expectedOptions,
                undefined,
                expectedReceivedState
            );
            assert.isFalse(resolved);

            tick(PROMISE_WAIT_TIME);

            assert.isTrue(resolved);
        });

        it('_beforeMount вызывается до монтирования DOM', () => {
            const _beforeMountStub = sandbox
                .stub(TestControl.prototype, '_beforeMount')
                .callsFake(() => {
                    // нам нужно проверять состояние DOM в момент вызова, поэтому приходится делать это здесь
                    assert.isNull(document.getElementById('testContainer'));
                });

            act(() => {
                render(<TestControl />, container);
            });

            sandbox.assert.calledOnce(_beforeMountStub);
        });

        it('при вызове _componentDidMount аргументы метода и состояние инстанса совпадают с Wasaby', async () => {
            const expectedOptions = {
                theme: 'default',
                readOnly: false,
                testOption: '123',
            };
            const _componentDidMountStub = sandbox
                .stub(TestControl.prototype, '_componentDidMount')
                .callsFake(function (this: TestControl): void {
                    assert.deepInclude(this._options, expectedOptions);
                });

            act(() => {
                render(<TestControl testOption="123" />, container);
            });
            await callComponentDidMountTick();

            sandbox.assert.calledWithMatch(_componentDidMountStub, expectedOptions);
        });

        it('_componentDidMount вызывается после монтирования DOM, но до отрисовки кадра', async () => {
            /*
            Весь тест завязан на двух вещах:
            1) _beforeMount вызывается до _componentDidMount.
            2) Они вызываются в одной таске.
            Т.е. если мы попытаемся что-то сделать в _beforeMount через setTimeout, то оно не успеет.

            Да, этот тест не идеален, потому что если запустить _componentDidMount в отдельной таске до
            вызова _beforeMount, то поведение сломается, а тест пройдёт, но это лучшее, что я могу сейчас придумать.
             */
            let domPainted = false;
            sandbox.stub(TestControl.prototype, '_beforeMount').callsFake(() => {
                setTimeout(() => {
                    domPainted = true;
                });
            });
            const _componentDidMountStub = sandbox
                .stub(TestControl.prototype, '_componentDidMount')
                .callsFake(() => {
                    // нам нужно проверять состояние DOM в момент вызова, поэтому приходится делать это здесь
                    assert.isFalse(domPainted);
                    assert.equal(document.getElementById('testContainer').textContent, '123');
                });

            act(() => {
                render(<TestControl />, container);
            });
            await callComponentDidMountTick();

            sandbox.assert.calledOnce(_componentDidMountStub);
        });

        it('при вызове _afterMount аргументы метода и состояние инстанса совпадают с Wasaby', async () => {
            const expectedOptions = {
                theme: 'default',
                readOnly: false,
                testOption: '123',
            };
            const _afterMountStub = sandbox
                .stub(TestControl.prototype, '_afterMount')
                .callsFake(function (this: TestControl): void {
                    assert.deepInclude(this._options, expectedOptions);
                });

            act(() => {
                render(<TestControl testOption="123" />, container);
            });
            await act(async () => {
                await Promise.resolve();
            });
            tick(0);

            sandbox.assert.calledWithMatch(_afterMountStub, expectedOptions);
        });

        it('_afterMount вызывается после монтирования DOM и отрисовки кадра', async () => {
            /*
            Здесь довольно простая логика: если _afterMount позвался в отдельной от рендера таске,
            то кадр успел отрисоваться.
             */
            const _afterMountStub = sandbox
                .stub(TestControl.prototype, '_afterMount')
                .callsFake(() => {
                    // нам нужно проверять состояние DOM в момент вызова, поэтому приходится делать это здесь
                    assert.equal(document.getElementById('testContainer').textContent, '123');
                });

            act(() => {
                render(<TestControl />, container);
            });

            sandbox.assert.notCalled(_afterMountStub);

            await callComponentDidMountTick();
            tick(0);

            sandbox.assert.calledOnce(_afterMountStub);
        });

        it('_beforeUpdate вызывается до вызова шаблона', async () => {
            // region Setup
            // небольшой компонент, который прокидывает состояние в ребёнка
            class Parent extends React.Component<
                {},
                {
                    childOption: string;
                }
            > {
                constructor(props: {}) {
                    super(props);
                    this.state = {
                        childOption: '123',
                    };
                }
                render(): React.ReactNode {
                    return <ControlWithState testOption={this.state.childOption} />;
                }
            }
            // отрисовываем компонент и сразу дожидаемся _afterMount
            let instance;
            act(() => {
                render(
                    <Parent
                        ref={(v) => {
                            instance = v;
                        }}
                    />,
                    container
                );
            });
            await callComponentDidMountTick();
            tick(0);
            // endregion
            const _beforeUpdateStub = sandbox
                .stub(ControlWithState.prototype, '_beforeUpdate')
                .callsFake(function (): void {
                    this._someState = 1;
                });

            assert.equal(document.getElementById('testContainer').textContent, '0123');

            act(() => {
                instance.setState({
                    childOption: '456',
                });
            });

            sandbox.assert.calledOnce(_beforeUpdateStub);
            assert.equal(document.getElementById('testContainer').textContent, '1456');
        });

        it('Синхронный Wasaby контрол должен перерисовываться при изменении реактивного свойства', async () => {
            // отрисовываем компонент и сразу дожидаемся _afterMount
            let instance: ControlWithState;
            act(() => {
                render(
                    <ControlWithState
                        ref={(v) => {
                            instance = v;
                        }}
                        testOption=""
                    />,
                    container
                );
            });
            tick(0);

            instance.incSomeState();
            await tickWasabyUpdate();

            expect(container).toMatchSnapshot();
        });

        it('Асинхронный Wasaby контрол должен перерисовываться при изменении реактивного свойства', async () => {
            const PROMISE_WAIT_TIME = 1000;
            sandbox
                .stub(ControlWithState.prototype, '_beforeMount')
                .callsFake((): Promise<void> => {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve();
                        }, PROMISE_WAIT_TIME);
                    });
                });

            // отрисовываем компонент и сразу дожидаемся _afterMount
            let instance: ControlWithState;
            act(() => {
                render(
                    <ControlWithState
                        ref={(v) => {
                            instance = v;
                        }}
                        testOption=""
                    />,
                    container
                );
            });
            await tickAsync(PROMISE_WAIT_TIME);
            tick(0);

            instance.incSomeState();
            await tickWasabyUpdate();

            expect(container).toMatchSnapshot();
        });

        it('при вызове _beforeUpdate аргументы метода и состояние инстанса совпадают с Wasaby', async () => {
            // region Setup
            // небольшой компонент, который прокидывает состояние в ребёнка
            class Parent extends React.Component<
                {},
                {
                    childOption: string;
                }
            > {
                constructor(props: {}) {
                    super(props);
                    this.state = {
                        childOption: '123',
                    };
                }
                render(): React.ReactNode {
                    return <TestControl testOption={this.state.childOption} />;
                }
            }
            const oldOptions = {
                theme: 'default',
                readOnly: false,
                testOption: '123',
            };
            const newOptions = {
                theme: 'default',
                readOnly: false,
                testOption: '456',
            };
            // endregion

            const _beforeUpdateStub = sandbox
                .stub(TestControl.prototype, '_beforeUpdate')
                .callsFake(function (this: TestControl): void {
                    assert.deepInclude(this._options, oldOptions);
                });
            // отрисовываем компонент и сразу дожидаемся _afterMount
            let instance;
            act(() => {
                render(
                    <Parent
                        ref={(v) => {
                            instance = v;
                        }}
                    />,
                    container
                );
            });
            await callComponentDidMountTick();
            tick(0);

            act(() => {
                instance.setState({
                    childOption: '456',
                });
            });

            // TODO: https://online.sbis.ru/opendoc.html?guid=a9962c03-d5ca-432c-bc8b-a244e5a1b1ed
            sandbox.assert.calledWithMatch(_beforeUpdateStub, newOptions);
        });

        it('_beforeUpdate вызывается до обновления DOM', async () => {
            // region Setup
            // небольшой компонент, который прокидывает состояние в ребёнка
            class Parent extends React.Component<
                {},
                {
                    childOption: string;
                }
            > {
                constructor(props: {}) {
                    super(props);
                    this.state = {
                        childOption: '123',
                    };
                }
                render(): React.ReactNode {
                    return <TestControl testOption={this.state.childOption} />;
                }
            }
            // отрисовываем компонент и сразу дожидаемся _afterMount
            let instance;
            act(() => {
                render(
                    <Parent
                        ref={(v) => {
                            instance = v;
                        }}
                    />,
                    container
                );
            });
            await callComponentDidMountTick();
            tick(0);
            // endregion
            const _beforeUpdateStub = sandbox
                .stub(TestControl.prototype, '_beforeUpdate')
                .callsFake(() => {
                    // нам нужно проверять состояние DOM в момент вызова, поэтому приходится делать это здесь
                    assert.equal(document.getElementById('testContainer').textContent, '123');
                });

            act(() => {
                instance.setState({
                    childOption: '456',
                });
            });

            sandbox.assert.calledOnce(_beforeUpdateStub);
            assert.equal(document.getElementById('testContainer').textContent, '456');
        });

        it('при вызове _afterRender аргументы метода и состояние инстанса совпадают с Wasaby', async () => {
            // region Setup
            // небольшой компонент, который прокидывает состояние в ребёнка
            class Parent extends React.Component<
                {},
                {
                    childOption: string;
                }
            > {
                constructor(props: {}) {
                    super(props);
                    this.state = {
                        childOption: '123',
                    };
                }
                render(): React.ReactNode {
                    return <TestControl testOption={this.state.childOption} />;
                }
            }
            const oldOptions = {
                theme: 'default',
                readOnly: false,
                testOption: '123',
            };
            const newOptions = {
                theme: 'default',
                readOnly: false,
                testOption: '456',
            };
            // endregion

            const _afterRenderStub = sandbox
                .stub(TestControl.prototype, '_afterRender')
                .callsFake(function (this: TestControl, a: unknown): void {
                    assert.deepInclude(this._options, newOptions);
                });
            // отрисовываем компонент и сразу дожидаемся _afterMount
            let instance;
            act(() => {
                render(
                    <Parent
                        ref={(v) => {
                            instance = v;
                        }}
                    />,
                    container
                );
            });
            await callComponentDidMountTick();
            tick(0);

            act(() => {
                instance.setState({
                    childOption: '456',
                });
            });

            sandbox.assert.calledWithMatch(_afterRenderStub, oldOptions);
        });

        it('_afterRender вызывается после обновления DOM, но до отрисовки кадра', async () => {
            /*
            Весь тест завязан на двух вещах:
            1) _beforeUpdate вызывается до _afterRender.
            2) Они вызываются в одной таске.
            Т.е. если мы попытаемся что-то сделать в _beforeUpdate через setTimeout, то оно не успеет.

            Да, этот тест не идеален, потому что если запустить _afterRender в отдельной таске до
            вызова _beforeUpdate, то поведение сломается, а тест пройдёт, но это лучшее, что я могу сейчас придумать.
             */
            // region Setup
            // небольшой компонент, который прокидывает состояние в ребёнка
            class Parent extends React.Component<
                {},
                {
                    childOption: string;
                }
            > {
                constructor(props: {}) {
                    super(props);
                    this.state = {
                        childOption: '123',
                    };
                }
                render(): React.ReactNode {
                    return <TestControl testOption={this.state.childOption} />;
                }
            }
            // endregion
            let domPainted = false;
            sandbox.stub(TestControl.prototype, '_beforeUpdate').callsFake(() => {
                setTimeout(() => {
                    domPainted = true;
                });
            });

            const _afterRenderStub = sandbox
                .stub(TestControl.prototype, '_afterRender')
                .callsFake(() => {
                    assert.isFalse(domPainted);
                    assert.equal(document.getElementById('testContainer').textContent, '456');
                });
            // отрисовываем компонент и сразу дожидаемся _afterMount
            let instance;
            act(() => {
                render(
                    <Parent
                        ref={(v) => {
                            instance = v;
                        }}
                    />,
                    container
                );
            });
            await callComponentDidMountTick();
            tick(0);

            act(() => {
                instance.setState({
                    childOption: '456',
                });
            });

            sandbox.assert.calledOnce(_afterRenderStub);
        });

        it('при вызове _afterUpdate аргументы метода и состояние инстанса совпадают с Wasaby', async () => {
            // region Setup
            // небольшой компонент, который прокидывает состояние в ребёнка
            class Parent extends React.Component<
                {},
                {
                    childOption: string;
                }
            > {
                constructor(props: {}) {
                    super(props);
                    this.state = {
                        childOption: '123',
                    };
                }
                render(): React.ReactNode {
                    return <TestControl testOption={this.state.childOption} />;
                }
            }
            const oldOptions = {
                theme: 'default',
                readOnly: false,
                testOption: '123',
            };
            const newOptions = {
                theme: 'default',
                readOnly: false,
                testOption: '456',
            };
            // endregion

            const _afterUpdateStub = sandbox
                .stub(TestControl.prototype, '_afterUpdate')
                .callsFake(function (this: TestControl): void {
                    assert.deepInclude(this._options, newOptions);
                });
            // отрисовываем компонент и сразу дожидаемся _afterMount
            let instance;
            act(() => {
                render(
                    <Parent
                        ref={(v) => {
                            instance = v;
                        }}
                    />,
                    container
                );
            });
            await callComponentDidMountTick();
            tick(0);

            act(() => {
                instance.setState({
                    childOption: '456',
                });
            });
            tick(0);

            sandbox.assert.calledWithMatch(_afterUpdateStub, oldOptions);
        });

        it('_afterUpdate вызывается после обновления DOM и отрисовки кадра', async () => {
            /*
            Здесь довольно простая логика: если _afterUpdate позвался в отдельной от рендера таске,
            то кадр успел отрисоваться.
             */
            // region Setup
            // небольшой компонент, который прокидывает состояние в ребёнка
            class Parent extends React.Component<
                {},
                {
                    childOption: string;
                }
            > {
                constructor(props: {}) {
                    super(props);
                    this.state = {
                        childOption: '123',
                    };
                }
                render(): React.ReactNode {
                    return <TestControl testOption={this.state.childOption} />;
                }
            }
            const _afterUpdateStub = sandbox
                .stub(TestControl.prototype, '_afterUpdate')
                .callsFake(() => {
                    // нам нужно проверять состояние DOM в момент вызова, поэтому приходится делать это здесь
                    assert.equal(document.getElementById('testContainer').textContent, '456');
                });
            // отрисовываем компонент и сразу дожидаемся _afterMount
            let instance;
            act(() => {
                render(
                    <Parent
                        ref={(v) => {
                            instance = v;
                        }}
                    />,
                    container
                );
            });
            await callComponentDidMountTick();
            tick(0);
            // endregion

            act(() => {
                instance.setState({
                    childOption: '456',
                });
            });

            sandbox.assert.notCalled(_afterUpdateStub);

            tick(0);

            sandbox.assert.calledOnce(_afterUpdateStub);
        });

        it('_notify стреляет из _beforeUnmount контролов', async () => {
            // region Setup
            let instance;
            act(() => {
                instance = creator(SyncRoot, {}, container);
            });
            tick(0);
            // endregion
            await tickWasabyUpdate();

            expect(container).toMatchSnapshot();

            destroyer(instance, container);
        });

        it('_notify не стреляет из разрушенных контролов', async () => {
            // region Setup
            let instance;
            act(() => {
                instance = creator(AsyncRoot, {}, container);
            });
            tick(0);
            // endregion
            await tickWasabyUpdate();

            expect(container).toMatchSnapshot();

            destroyer(instance, container);
        });

        it('ссылка на родителький DOM-элемент удаляется, только если существует', async () => {
            // region Setup
            let instance;
            act(() => {
                instance = creator(ParentLinkRoot, {}, container);
            });
            tick(0);
            // endregion
            await tickWasabyUpdate();
            const button = document.getElementById('showButton');
            act(() => {
                button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
            });
            await tickWasabyUpdate();

            expect(container).toMatchSnapshot();

            destroyer(instance, container);
        });

        it('_beforeUpdate сравнение старых и новых опций по ссылке', async () => {
            // region Setup
            let instance;
            act(() => {
                instance = creator(BeforeUpdateLinkCompareRoot, {}, container);
            });
            tick(0);
            // endregion
            await tickWasabyUpdate();
            const button = document.getElementById('updateVersion');
            act(() => {
                button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
            });
            await tickWasabyUpdate();
            expect(container).toMatchSnapshot();

            destroyer(instance, container);
        });

        describe('порядок вызова хуков с детьми', () => {
            // TODO: сейчас тесты написаны только на mount-хуки
            /*
            В Wasaby было так:
            outer _beforeMount
            inner _beforeMount
            inner _componentDidMount
            outer _componentDidMount
            inner _afterMount
            outer _afterMount
            outer _beforeUpdate
            outer _shouldUpdate
            inner _beforeUpdate
            inner _shouldUpdate
            inner _afterRender
            outer _afterRender
            inner _afterUpdate
            outer _afterUpdate
             */

            describe('асинхронный ребёнок', () => {
                it('порядок mount хуков совпадает с Wasaby', async () => {
                    // region Setup
                    const _beforeMountOuter = sandbox.stub(TestControl2.prototype, '_beforeMount');
                    const _componentDidMountOuter = sandbox.stub(
                        TestControl2.prototype,
                        '_componentDidMount'
                    );
                    const _afterMountOuter = sandbox.stub(TestControl2.prototype, '_afterMount');
                    const _beforeUpdateOuter = sandbox.stub(
                        TestControl2.prototype,
                        '_beforeUpdate'
                    );
                    const _afterRenderOuter = sandbox.stub(TestControl2.prototype, '_afterRender');
                    const _afterUpdateOuter = sandbox.stub(TestControl2.prototype, '_afterUpdate');
                    const _shouldUpdateOuter = sandbox.stub(
                        TestControl2.prototype,
                        '_shouldUpdate'
                    );

                    const CHILD_TIMEOUT_DURATION = 100;
                    const _beforeMountInner = sandbox
                        .stub(TestControl2Inner.prototype, '_beforeMount')
                        .callsFake((): Promise<void> => {
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve();
                                }, CHILD_TIMEOUT_DURATION);
                            });
                        });
                    const _componentDidMountInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_componentDidMount'
                    );
                    const _afterMountInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_afterMount'
                    );
                    const _beforeUpdateInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_beforeUpdate'
                    );
                    const _afterRenderInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_afterRender'
                    );
                    const _afterUpdateInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_afterUpdate'
                    );
                    // endregion

                    act(() => {
                        render(<TestControl2 />, container);
                    });

                    sandbox.assert.calledOnce(_beforeMountOuter);
                    sandbox.assert.calledOnce(_beforeMountInner);
                    sandbox.assert.callOrder(_beforeMountOuter, _beforeMountInner);

                    await tickAsync(CHILD_TIMEOUT_DURATION);

                    sandbox.assert.calledOnce(_componentDidMountInner);
                    sandbox.assert.calledOnce(_componentDidMountOuter);
                    sandbox.assert.callOrder(_componentDidMountInner, _componentDidMountOuter);
                    sandbox.assert.notCalled(_afterMountInner);
                    sandbox.assert.notCalled(_afterMountOuter);
                    sandbox.assert.notCalled(_shouldUpdateOuter);

                    tick(0);

                    sandbox.assert.calledOnce(_afterMountInner);
                    sandbox.assert.calledOnce(_afterMountOuter);
                    sandbox.assert.callOrder(_afterMountInner, _afterMountOuter);

                    sandbox.assert.notCalled(_shouldUpdateOuter);
                    sandbox.assert.notCalled(_beforeUpdateOuter);
                    sandbox.assert.notCalled(_afterRenderOuter);
                    sandbox.assert.notCalled(_afterUpdateOuter);
                    sandbox.assert.notCalled(_beforeUpdateInner);
                    sandbox.assert.notCalled(_afterRenderInner);
                    sandbox.assert.notCalled(_afterUpdateInner);
                });

                it('пользовательский _shouldUpdate вызывается только после маунта', async () => {
                    // region Setup
                    const shouldUpdateParent = sandbox.spy(
                        ShouldUpdateParent.prototype,
                        '_shouldUpdate'
                    );

                    let instance;
                    act(() => {
                        instance = creator(ShouldUpdateParent, {}, container);
                    });
                    tick(0);
                    // endregion
                    await tickAsync(5);
                    await tickAsync(0);

                    sandbox.assert.notCalled(shouldUpdateParent);

                    destroyer(instance, container);
                });
            });

            describe('асинхронный родитель', () => {
                it('порядок mount хуков совпадает с Wasaby', async () => {
                    // region Setup
                    const PARENT_TIMEOUT_DURATION = 100;
                    const _beforeMountOuter = sandbox
                        .stub(TestControl2.prototype, '_beforeMount')
                        .callsFake((): Promise<void> => {
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve();
                                }, PARENT_TIMEOUT_DURATION);
                            });
                        });
                    const _componentDidMountOuter = sandbox.stub(
                        TestControl2.prototype,
                        '_componentDidMount'
                    );
                    const _afterMountOuter = sandbox.stub(TestControl2.prototype, '_afterMount');
                    const _beforeUpdateOuter = sandbox.stub(
                        TestControl2.prototype,
                        '_beforeUpdate'
                    );
                    const _afterRenderOuter = sandbox.stub(TestControl2.prototype, '_afterRender');
                    const _afterUpdateOuter = sandbox.stub(TestControl2.prototype, '_afterUpdate');

                    const _beforeMountInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_beforeMount'
                    );
                    const _componentDidMountInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_componentDidMount'
                    );
                    const _afterMountInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_afterMount'
                    );
                    const _beforeUpdateInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_beforeUpdate'
                    );
                    const _afterRenderInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_afterRender'
                    );
                    const _afterUpdateInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_afterUpdate'
                    );
                    // endregion

                    act(() => {
                        render(<TestControl2 />, container);
                    });

                    sandbox.assert.calledOnce(_beforeMountOuter);
                    sandbox.assert.notCalled(_beforeMountInner);

                    await tickAsync(PARENT_TIMEOUT_DURATION);

                    sandbox.assert.calledOnce(_beforeMountInner);
                    sandbox.assert.calledOnce(_componentDidMountInner);
                    sandbox.assert.calledOnce(_componentDidMountOuter);
                    sandbox.assert.callOrder(_componentDidMountInner, _componentDidMountOuter);
                    sandbox.assert.notCalled(_afterMountInner);
                    sandbox.assert.notCalled(_afterMountOuter);

                    tick(0);

                    sandbox.assert.calledOnce(_afterMountInner);
                    sandbox.assert.calledOnce(_afterMountOuter);
                    sandbox.assert.callOrder(_afterMountInner, _afterMountOuter);

                    sandbox.assert.notCalled(_beforeUpdateOuter);
                    sandbox.assert.notCalled(_afterRenderOuter);
                    sandbox.assert.notCalled(_afterUpdateOuter);
                    sandbox.assert.notCalled(_beforeUpdateInner);
                    sandbox.assert.notCalled(_afterRenderInner);
                    sandbox.assert.notCalled(_afterUpdateInner);
                });
            });

            describe('синхронный ребёнок', () => {
                it('порядок mount хуков совпадает с Wasaby', async () => {
                    // region Setup
                    const _beforeMountOuter = sandbox.stub(TestControl2.prototype, '_beforeMount');
                    const _componentDidMountOuter = sandbox.stub(
                        TestControl2.prototype,
                        '_componentDidMount'
                    );
                    const _afterMountOuter = sandbox.stub(TestControl2.prototype, '_afterMount');
                    const _beforeUpdateOuter = sandbox.stub(
                        TestControl2.prototype,
                        '_beforeUpdate'
                    );
                    const _afterRenderOuter = sandbox.stub(TestControl2.prototype, '_afterRender');
                    const _afterUpdateOuter = sandbox.stub(TestControl2.prototype, '_afterUpdate');

                    const _beforeMountInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_beforeMount'
                    );
                    const _componentDidMountInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_componentDidMount'
                    );
                    const _afterMountInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_afterMount'
                    );
                    const _beforeUpdateInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_beforeUpdate'
                    );
                    const _afterRenderInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_afterRender'
                    );
                    const _afterUpdateInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_afterUpdate'
                    );
                    // endregion

                    act(() => {
                        render(<TestControl2 />, container);
                    });

                    sandbox.assert.calledOnce(_beforeMountOuter);
                    sandbox.assert.calledOnce(_beforeMountInner);

                    await callComponentDidMountTick();

                    sandbox.assert.calledOnce(_componentDidMountInner);
                    sandbox.assert.calledOnce(_componentDidMountOuter);
                    sandbox.assert.callOrder(
                        _beforeMountOuter,
                        _beforeMountInner,
                        _componentDidMountInner,
                        _componentDidMountOuter
                    );
                    sandbox.assert.notCalled(_afterMountInner);
                    sandbox.assert.notCalled(_afterMountOuter);

                    tick(0);

                    sandbox.assert.calledOnce(_afterMountInner);
                    sandbox.assert.calledOnce(_afterMountOuter);
                    sandbox.assert.callOrder(_afterMountInner, _afterMountOuter);

                    sandbox.assert.notCalled(_beforeUpdateOuter);
                    sandbox.assert.notCalled(_afterRenderOuter);
                    sandbox.assert.notCalled(_afterUpdateOuter);
                    sandbox.assert.notCalled(_beforeUpdateInner);
                    sandbox.assert.notCalled(_afterRenderInner);
                    sandbox.assert.notCalled(_afterUpdateInner);
                });
            });

            describe('асинхронные родитель и ребёнок', () => {
                it('порядок mount хуков совпадает с Wasaby', async () => {
                    // region Setup
                    const PARENT_TIMEOUT_DURATION = 100;
                    const _beforeMountOuter = sandbox
                        .stub(TestControl2.prototype, '_beforeMount')
                        .callsFake((): Promise<void> => {
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve();
                                }, PARENT_TIMEOUT_DURATION);
                            });
                        });
                    const _componentDidMountOuter = sandbox.stub(
                        TestControl2.prototype,
                        '_componentDidMount'
                    );
                    const _afterMountOuter = sandbox.stub(TestControl2.prototype, '_afterMount');
                    const _beforeUpdateOuter = sandbox.stub(
                        TestControl2.prototype,
                        '_beforeUpdate'
                    );
                    const _afterRenderOuter = sandbox.stub(TestControl2.prototype, '_afterRender');
                    const _afterUpdateOuter = sandbox.stub(TestControl2.prototype, '_afterUpdate');

                    const _beforeMountInner = sandbox
                        .stub(TestControl2Inner.prototype, '_beforeMount')
                        .callsFake((): Promise<void> => {
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolve();
                                }, PARENT_TIMEOUT_DURATION);
                            });
                        });
                    const _componentDidMountInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_componentDidMount'
                    );
                    const _afterMountInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_afterMount'
                    );
                    const _beforeUpdateInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_beforeUpdate'
                    );
                    const _afterRenderInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_afterRender'
                    );
                    const _afterUpdateInner = sandbox.stub(
                        TestControl2Inner.prototype,
                        '_afterUpdate'
                    );
                    // endregion

                    act(() => {
                        render(<TestControl2 />, container);
                    });

                    sandbox.assert.calledOnce(_beforeMountOuter);
                    sandbox.assert.notCalled(_beforeMountInner);

                    await tickAsync(PARENT_TIMEOUT_DURATION);

                    sandbox.assert.calledOnce(_beforeMountInner);
                    sandbox.assert.notCalled(_componentDidMountOuter);

                    await tickAsync(PARENT_TIMEOUT_DURATION);

                    sandbox.assert.calledOnce(_componentDidMountInner);
                    sandbox.assert.calledOnce(_componentDidMountOuter);
                    sandbox.assert.callOrder(_componentDidMountInner, _componentDidMountOuter);
                    sandbox.assert.notCalled(_afterMountInner);
                    sandbox.assert.notCalled(_afterMountOuter);

                    tick(0);

                    sandbox.assert.calledOnce(_afterMountInner);
                    sandbox.assert.calledOnce(_afterMountOuter);
                    sandbox.assert.callOrder(_afterMountInner, _afterMountOuter);

                    sandbox.assert.notCalled(_beforeUpdateOuter);
                    sandbox.assert.notCalled(_afterRenderOuter);
                    sandbox.assert.notCalled(_afterUpdateOuter);
                    sandbox.assert.notCalled(_beforeUpdateInner);
                    sandbox.assert.notCalled(_afterRenderInner);
                    sandbox.assert.notCalled(_afterUpdateInner);
                });
            });
        });
    });

    describe('Опции на клиенте', () => {
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

        // В данный момент довольно сложная система вызова обновления, выделим его тик отдельно.
        async function tickWasabyUpdate(): Promise<void> {
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

        it('нет лишней перерисовки из-за перегенерации getDefaultOptions', async () => {
            // region Setup
            const beforeUpdateStub = sandbox.stub(
                DefaultOptionsWithObjectChild.prototype,
                '_beforeUpdate'
            );

            let instance: DefaultOptionsWithObjectParent;

            act(() => {
                render(
                    <DefaultOptionsWithObjectParent
                        ref={(v) => {
                            instance = v;
                        }}
                    />,
                    container
                );
            });
            tick(0);
            // endregion

            instance.setNewValue();
            await tickWasabyUpdate();

            expect(container).toMatchSnapshot();
            sandbox.assert.notCalled(beforeUpdateStub);
        });

        it('undefined удаляется из defaultProps ', async () => {
            // region Setup
            class Parent extends React.Component<
                {},
                {
                    maxValue: number;
                }
            > {
                constructor(props: {}) {
                    super(props);
                    this.state = {
                        maxValue: 10,
                    };
                }

                render(): React.ReactNode {
                    return <TestDefaultOptions maxValue={this.state.maxValue} />;
                }
            }

            let instance;
            act(() => {
                render(
                    <Parent
                        ref={(v) => {
                            instance = v;
                        }}
                    />,
                    container
                );
            });
            await callComponentDidMountTick();
            tick(0);
            // endregion

            act(() => {
                instance.setState({
                    value: 5,
                    maxValue: 100,
                });
            });

            tick(0);

            expect(container).toMatchSnapshot();
        });

        it('Опции правильно мержатся с опциями по-умолчанию ', () => {
            // region Setup
            let instance;
            act(() => {
                instance = creator(TestDefaultOptions2, {}, container);
            });
            tick(0);
            // endregion

            expect(container).toMatchSnapshot();
        });

        it.skip('Опция "key" восстанавливается', () => {
            // region Setup
            let instance;
            act(() => {
                instance = creator(ParentKey, {}, container);
            });
            tick(0);
            // endregion

            expect(container).toMatchSnapshot();

            destroyer(instance, container);
        });
    });

    describe('Атрибуты', () => {
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

        // В данный момент довольно сложная система вызова обновления, выделим его тик отдельно.
        async function tickWasabyUpdate(): Promise<void> {
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

        describe('сохраняем в атрибутах className из react props', () => {
            describe('в react вставляем wasaby-контрол без класса на корневой ноде', () => {
                it('прямая вставка', () => {
                    // region Setup
                    const reactControl = React.forwardRef(function ReactControl(props, ref?) {
                        return (
                            <div>
                                <WasabyControl caption="reactClass" className="reactClass" />
                            </div>
                        );
                    });
                    let instance;
                    act(() => {
                        instance = creator(WasabyRoot, { control: reactControl }, container);
                    });
                    tick(0);
                    // endregion

                    expect(container).toMatchSnapshot();

                    destroyer(instance, container);
                });

                it('вставляем wasaby HOC с опцией class и scope = {{_options}}', () => {
                    // region Setup
                    const reactControl = React.forwardRef(function ReactControl(props, ref?) {
                        return (
                            <div>
                                <WasabyControlHoc
                                    caption="wasabyHocClass reactClass"
                                    className="reactClass"
                                />
                            </div>
                        );
                    });
                    let instance;
                    act(() => {
                        instance = creator(WasabyRoot, { control: reactControl }, container);
                    });
                    tick(0);
                    // endregion

                    expect(container).toMatchSnapshot();

                    destroyer(instance, container);
                });

                it('вставляем wasaby template с опцией class и scope = {{_options}}', () => {
                    // region Setup
                    const reactControl = React.forwardRef(function ReactControl(props, ref?) {
                        return (
                            <div>
                                <WasabyWithTemplate
                                    caption="wasabyHocTemplateClass reactClass"
                                    className="reactClass"
                                />
                            </div>
                        );
                    });
                    let instance;
                    act(() => {
                        instance = creator(WasabyRoot, { control: reactControl }, container);
                    });
                    tick(0);
                    // endregion

                    expect(container).toMatchSnapshot();

                    destroyer(instance, container);
                });
            });
            describe('в react вставляем wasaby-контрол с классом на корневой ноде', () => {
                it('прямая вставка', () => {
                    // region Setup
                    const reactControl = React.forwardRef(function ReactControl(props, ref?) {
                        return (
                            <div>
                                <WasabyControlWithClass
                                    caption="wasabyClass reactClass"
                                    className="reactClass"
                                />
                            </div>
                        );
                    });
                    let instance;
                    act(() => {
                        instance = creator(WasabyRoot, { control: reactControl }, container);
                    });
                    tick(0);
                    // endregion

                    expect(container).toMatchSnapshot();

                    destroyer(instance, container);
                });
                it('вставляем wasaby HOC с опцией class и scope = {{_options}}', () => {
                    // region Setup
                    const reactControl = React.forwardRef(function ReactControl(props, ref?) {
                        return (
                            <div>
                                <WasabyControlHocWithClass
                                    caption="wasabyClass wasabyHocClass reactClass"
                                    className="reactClass"
                                />
                            </div>
                        );
                    });
                    let instance;
                    act(() => {
                        instance = creator(WasabyRoot, { control: reactControl }, container);
                    });
                    tick(0);
                    // endregion

                    expect(container).toMatchSnapshot();

                    destroyer(instance, container);
                });

                it('вставляем wasaby template с опцией class и scope = {{_options}}', () => {
                    // region Setup
                    const reactControl = React.forwardRef(function ReactControl(props, ref?) {
                        return (
                            <div>
                                <WasabyWithTemplateWithClass
                                    caption="wasabyClass wasabyHocTemplateClass reactClass"
                                    className="reactClass"
                                />
                            </div>
                        );
                    });
                    let instance;
                    act(() => {
                        instance = creator(WasabyRoot, { control: reactControl }, container);
                    });
                    tick(0);
                    // endregion

                    expect(container).toMatchSnapshot();

                    destroyer(instance, container);
                });
            });
        });

        it('В атрибутах декорируются только свойства из списка', async () => {
            // region Setup
            let instance;

            act(() => {
                instance = creator(AttributesHoc, {}, container);
            });
            await callComponentDidMountTick();
            tick(0);
            // endregion

            await tickWasabyUpdate();
            expect(container).toMatchSnapshot();

            destroyer(instance, container);
        });
    });

    describe('Служебные поля', () => {
        let container: HTMLDivElement;
        let sandbox: SinonSandbox;
        let clock: SinonFakeTimers;

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
            jest.restoreAllMocks();
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

        // В данный момент довольно сложная система вызова обновления, выделим его тик отдельно.
        async function tickWasabyUpdate(): Promise<void> {
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

        it('Поле _mounted', async () => {
            // region Setup
            let instance: ServiceFields;

            act(() => {
                instance = creator(ServiceFields, {}, container) as ServiceFields;
            });
            await callComponentDidMountTick();
            tick(0);
            // endregion

            const serviceFieldsChild = instance.getChild();
            expect(serviceFieldsChild._mounted).toBe(true);

            instance.hideChild();
            await tickWasabyUpdate();

            expect(serviceFieldsChild._mounted).toBe(false);

            destroyer(instance, container);
        });

        it('Поле _logicParent', () => {
            // region Setup
            let instance: ServiceFields;

            act(() => {
                instance = creator(ServiceFields, {}, container);
            });
            tick(0);
            // endregion

            const serviceFieldsChild = instance.getChild();
            expect(serviceFieldsChild._logicParent).toBe(instance);

            destroyer(instance, container);
        });

        it('Поле _unmounted', async () => {
            // region Setup
            let instance: ServiceFields;

            act(() => {
                instance = creator(ServiceFields, {}, container);
            });
            tick(0);

            const serviceFieldsChild = instance.getChild();
            instance.hideChild();
            await tickWasabyUpdate();
            // endregion

            expect(serviceFieldsChild._unmounted).toBe(true);

            destroyer(instance, container);
        });

        it('Поле _destroyed', async () => {
            // region Setup
            let instance: ServiceFields;

            act(() => {
                instance = creator(ServiceFields, {}, container);
            });
            tick(0);

            const serviceFieldsChild = instance.getChild();
            instance.hideChild();
            await tickWasabyUpdate();
            // endregion

            expect(serviceFieldsChild._destroyed).toBe(true);

            destroyer(instance, container);
        });

        it('Поле _container. Ошибка в консоли, если реакт в корне не прокинул ref.', () => {
            const consoleMock = jest.spyOn(console, 'error').mockImplementation();
            let instance: WasabyWithReactInRoot;
            act(() => {
                creator(
                    WasabyWithReactInRoot,
                    {
                        passRef: false,
                        ref: (inst: WasabyWithReactInRoot) => {
                            instance = inst;
                        },
                    },
                    container
                );
            });
            expect(container).toMatchSnapshot('Всё построилось, несмотря на ошибку');
            expect(consoleMock).toHaveBeenCalledTimes(1);
            expect(consoleMock.mock.calls[0][1]).toContain(
                'отсутствует _container'
            );
            destroyer(instance, container);
        });

        it('Поле _container. Нет ошибки в консоли, если реакт в корне прокинул ref.', () => {
            const consoleMock = jest.spyOn(console, 'error').mockImplementation();
            let instance: WasabyWithReactInRoot;
            act(() => {
                creator(
                    WasabyWithReactInRoot,
                    {
                        passRef: true,
                        ref: (inst: WasabyWithReactInRoot) => {
                            instance = inst;
                        },
                    },
                    container
                );
            });
            expect(instance.getCurrentContainer()).toMatchSnapshot(
                'В поле _container верный элемент'
            );
            expect(consoleMock).toHaveBeenCalledTimes(0);
            destroyer(instance, container);
        });
    });
});
