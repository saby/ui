/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';

import { act } from 'react-dom/test-utils';

import { Record } from 'Types/entity';
import { Control } from 'UICore/Base';

import InitReactiveProps from './resources/InitReactiveProps';
import ReactiveControl from './resources/ReactiveControl';
import ReactiveControl2 from './resources/ReactiveControl2';
import ReactiveControl3 from './resources/ReactiveControl3';
import ReactiveControl4 from './resources/ReactiveControl4';
import ReactiveControl5 from './resources/ReactiveControl5';
import ReactiveControl6 from './resources/ReactiveControl6';
import ReactiveControl7 from './resources/ReactiveControl7';
import ReactiveControl8 from './resources/ReactiveControl8';
import ReactiveControl9 from './resources/ReactiveControl9';
import ReactiveControl10 from './resources/ReactiveControl10';
import ControlParentReactive from './resources/ControlParentReactive';
import ControlChildReactive from './resources/ControlChildReactive';
import ControlWithInvisible from './resources/ControlWithInvisible';
import AlreadyRoot from './resources/AlreadyReactive/AlreadyRoot';

import ParentWithConditionChild from './resources/ParentWithConditionChild';
import SimpleChild from './resources/SimpleChild';
import AsyncChild from './resources/AsyncChild';
import ParentWithSyncAndAsyncChilds from './resources/ParentWithSyncAndAsyncChilds';

import ControlWithArrayVersion from './resources/ControlWithArrayVersion';
import ControlWithManyReactiveProps from './resources/ControlWithManyReactiveProps';
import ControlWithBind from './resources/ControlWithBind';
import ControlWithoutBind from './resources/ControlWithoutBind';
import ControlWithRadioInput from './resources/ControlWithRadioInput';

import ControlWithContentBind from './ControlWithContentBind/Top';

import FunctionComponent from './resources/ClearReact/FunctionComponent';
import ClassComponent from './resources/ClearReact/ClassComponent';

const creator = Control.createControl;
const destroyer = Control.destroyControl;

function tick(duration: number = 1): void {
    act(() => {
        jest.advanceTimersByTime(duration);
    });
}

async function tickAsync(duration: number = 1): Promise<void> {
    await act(async () => {
        jest.advanceTimersByTime(duration);
    });
}

describe('WasabyReact Reactivity', () => {
    let container: HTMLDivElement;
    let instance: Control<unknown, unknown>;

    beforeEach(() => {
        jest.useFakeTimers();
        container = document.createElement('div');
        document.body.appendChild(container);
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(
            setTimeout
        );
    });

    afterEach(() => {
        if (instance) {
            destroyer(instance, container);
            instance = undefined;
        }
        container.remove();
        container = null;
        jest.restoreAllMocks();
        jest.runAllTimers();
        jest.useRealTimers();
    });

    it('инициализация реактивных свойств', () => {
        // region Setup
        act(() => {
            instance = creator(InitReactiveProps, {}, container);
        });
        tick();
        // endregion
        const reactiveValues = instance.reactiveValues;

        expect(Object.keys(reactiveValues).sort()).toEqual(
            ['value', 'class', 'value2'].sort()
        );
    });

    it('изменение реактивного свойства вызывает перерисовку', () => {
        // region Setup
        act(() => {
            instance = creator(ReactiveControl, {}, container);
        });
        tick();
        // endregion
        const button = document.getElementById('start');
        act(() => {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        tick();
        expect(container).toMatchSnapshot();
    });

    it('изменение реактивного свойства в _beforeUpdate не вызывает перерисовку', () => {
        // region Setup
        const _beforeUpdateSpy = jest.spyOn(
            ReactiveControl2.prototype,
            '_beforeUpdate'
        );
        act(() => {
            instance = creator(ReactiveControl2, {}, container);
        });
        tick();
        // endregion
        const button = document.getElementById('start');
        act(() => {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        act(() => {
            jest.runAllTimers();
        });
        expect(container).toMatchSnapshot();
        expect(_beforeUpdateSpy).toBeCalledTimes(1);
    });

    it('изменение шаблона должно изменять reactiveValues', () => {
        // region Setup
        act(() => {
            instance = creator(ReactiveControl3, {}, container);
        });
        tick();
        // endregion

        expect(Object.keys(instance.reactiveValues)).toContain('valueOne');

        const button = document.getElementById('startTemplateChange');
        act(() => {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        tick();
        expect(Object.keys(instance.reactiveValues)).toContain('valueTwo');
    });

    it('нет изменений если меняется старые reactiveValues', () => {
        // region Setup
        act(() => {
            instance = creator(ReactiveControl3, {}, container);
        });
        tick();
        // endregion

        let button = document.getElementById('startTemplateChange');
        act(() => {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        tick();
        expect(Object.keys(instance.reactiveValues)).toContain('valueTwo');
        button = document.getElementById('startValueOneChange');
        act(() => {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        tick();
        expect(container).toMatchSnapshot();
    });

    it('есть изменений если меняется новые reactiveValues', () => {
        // region Setup
        act(() => {
            instance = creator(ReactiveControl3, {}, container);
        });
        tick();
        // endregion

        let button = document.getElementById('startTemplateChange');
        act(() => {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        tick();
        expect(Object.keys(instance.reactiveValues)).toContain('valueTwo');
        button = document.getElementById('startValueTwoChange');
        act(() => {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        tick();
        expect(container).toMatchSnapshot();
    });

    it('изменение реактивного массива вызывает перерисовку', () => {
        // region Setup
        act(() => {
            instance = creator(ReactiveControl4, {}, container);
        });
        tick();
        // endregion

        let button = document.getElementById('startPush');
        act(() => {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        tick();

        expect(container).toMatchSnapshot();

        button = document.getElementById('startUnshift');
        act(() => {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        tick();
        expect(container).toMatchSnapshot();
    });

    it('изменение версии вызывает перерисовку', () => {
        // region Setup
        act(() => {
            instance = creator(ReactiveControl5, {}, container);
        });
        tick();
        // endregion

        const button = document.getElementById('start');
        act(() => {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        tick();
        expect(container).toMatchSnapshot();
    });

    it('перерисовка с пользовательским геттером и сеттером', () => {
        // region Setup
        act(() => {
            instance = creator(ReactiveControl6, {}, container);
        });
        tick();
        // endregion

        const button = document.getElementById('start');
        act(() => {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        tick();
        expect(container).toMatchSnapshot();
    });

    it('изменение опции вызывает перерисовку', () => {
        // region Setup
        act(() => {
            instance = creator(ReactiveControl7, {}, container);
        });
        tick();
        // endregion

        const button = document.getElementById('start');
        act(() => {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        tick();
        expect(container).toMatchSnapshot();
    });

    it('изменение опции вызывает перерисовку - версионируемый объект', () => {
        // region Setup
        act(() => {
            instance = creator(ReactiveControl8, {}, container);
        });
        tick();
        // endregion

        const button = document.getElementById('start');
        act(() => {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        tick();
        expect(container).toMatchSnapshot();
    });

    it('изменение опции вызывает перерисовку - массив', () => {
        // region Setup
        act(() => {
            instance = creator(ReactiveControl9, {}, container);
        });
        tick();
        // endregion

        const button = document.getElementById('startPush');
        act(() => {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        tick();
        expect(container).toMatchSnapshot();
    });

    it('Обновление запускается один раз для контрола, если изменили несколько свойств сразу', () => {
        // region Setup
        const componentDidUpdateSpy = jest.spyOn(
            ControlWithManyReactiveProps.prototype,
            'componentDidUpdate'
        );
        act(() => {
            instance = creator(ControlWithManyReactiveProps, {}, container);
        });
        tick();
        // endregion

        const button = document.getElementById('startReactive');
        act(() => {
            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        tick();
        expect(componentDidUpdateSpy).toBeCalledTimes(1);
        expect(container).toMatchSnapshot();
    });

    it('Обновление invisible-node', () => {
        // region Setup
        act(() => {
            instance = creator(ControlWithInvisible, {}, container);
        });
        tick(0);
        // endregion
        expect(container).toMatchSnapshot();

        tick();
        expect(container).toMatchSnapshot();
    });

    it('освобождение реактивных свойств переданных по ссылке', () => {
        // region Setup
        act(() => {
            instance = creator(AlreadyRoot, {}, container);
        });
        tick();
        // endregion
        const changeBtn = document.getElementById('changeBtn');
        const toggleBtn = document.getElementById('toggleBtn');
        act(() => {
            toggleBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        tick();
        act(() => {
            changeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        act(() => {
            toggleBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        tick();
        act(() => {
            changeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        act(() => {
            toggleBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        tick();
        expect(container).toMatchSnapshot();
    });

    describe('Сложная реактивность', () => {
        it('Бинд на значение должен срабатывать до изменения версии модели', () => {
            // region Setup
            act(() => {
                instance = creator(ControlWithBind, {}, container);
            });
            tick();
            // endregion

            const button = document.getElementById('startReactive');
            act(() => {
                button.dispatchEvent(
                    new MouseEvent('click', { bubbles: true })
                );
            });
            tick();

            expect(container).toMatchSnapshot();
        });

        it('Изменение значения реактивной модели', () => {
            // region Setup
            act(() => {
                instance = creator(ControlWithoutBind, {}, container);
            });
            tick();
            // endregion

            const button = document.getElementById('startReactive');
            act(() => {
                button.dispatchEvent(
                    new MouseEvent('click', { bubbles: true })
                );
            });
            tick();

            expect(container).toMatchSnapshot();
        });

        it('Изменение значения поля ввода авто дополняется', () => {
            // region Setup
            act(() => {
                instance = creator(ReactiveControl10, {}, container);
            });
            tick();
            // endregion

            const input = document.getElementById(
                'inputField'
            ) as HTMLInputElement;
            const focusOut = document.getElementById('focusOut');
            act(() => {
                input.focus();
            });
            tick();
            act(() => {
                input.value = '1';
            });
            act(() => {
                input.dispatchEvent(new Event('input', { bubbles: true }));
            });
            tick();
            act(() => {
                focusOut.focus();
            });
            tick();
            expect(input.value).toBe('10000');
            expect(container).toMatchSnapshot();
        });

        it('ручной вызов _forceUpdate в процессе запущенной синхронизации', () => {
            // region Setup
            const beforeUpdateSpy = jest.spyOn(
                ControlChildReactive.prototype,
                '_beforeUpdate'
            );
            act(() => {
                instance = creator(ControlParentReactive, {}, container);
            });
            tick();
            // endregion

            const button = document.getElementById('ControlChildReactive');
            act(() => {
                button.dispatchEvent(new Event('click', { bubbles: true }));
            });

            // До склейки вызовов _forceUpdate было вот так:
            // У ребенка вызвали _forceUpdate вручную - произошёл вызов _beforeUpdate ребенка со старыми опциями.
            // Одновременно с этим вызывается _notify bind'а реактивного свойства родителя.
            // Поэтому ждём все таймеры, чтобы точно дождаться всех "лишних" перерисовок.
            jest.runAllTimers();

            expect(beforeUpdateSpy).toBeCalledTimes(1);
            expect(container).toMatchSnapshot();
        });

        it('Изменение стейта живого родителя по время оживления асинхронного ребёнка', async () => {
            const timer: number = 1000;
            const fullTimerRatio = 3;
            jest.spyOn(
                SimpleChild.prototype,
                '_beforeMount'
            ).mockImplementation(async () => {
                return new Promise<void>((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, timer * fullTimerRatio);
                });
            });
            act(() => {
                instance = creator(ParentWithConditionChild, {}, container);
            });
            const parentWithConditionChild =
                instance as ParentWithConditionChild;
            tick();
            // Важно начать показывать асинхронного ребёнка уже после оживления родителя.
            parentWithConditionChild.showChild();
            tick(timer);
            await tickAsync();

            parentWithConditionChild.updateOwnState();
            tick(timer);
            await tickAsync();
            expect(container).toMatchSnapshot(
                '1. Несмотря на то, что стейт обновился, родитель не перерисовался.'
            );

            tick(timer);
            await tickAsync();
            expect(container).toMatchSnapshot(
                '2. Асинхронный ребёнок отрисовался. Изменённый стейт пока ещё нет.'
            );

            tick();
            expect(container).toMatchSnapshot(
                '3. Перерисовался стейт родителя.'
            );
        });

        it('Вызов _afterMount у синхронного и асинхронного соседа', async () => {
            const timer: number = 1000;
            const fullTimerRatio = 2;
            jest.spyOn(AsyncChild.prototype, '_beforeMount').mockImplementation(
                async () => {
                    return new Promise<void>((resolve) => {
                        setTimeout(() => {
                            resolve();
                        }, timer * fullTimerRatio);
                    });
                }
            );
            const asyncChildAfterMount = jest.spyOn(
                AsyncChild.prototype,
                '_afterMount'
            );
            const simpleChildAfterMount = jest.spyOn(
                SimpleChild.prototype,
                '_afterMount'
            );
            act(() => {
                instance = creator(ParentWithSyncAndAsyncChilds, {}, container);
            });
            tick();

            expect(container).toMatchSnapshot(
                '1. Синхронный ребёнок отрисовался.'
            );

            tick(timer);
            await tickAsync();

            // Синхронный ребёнок давно отрисовался, но _afterMount ещё не вызвался.
            expect(simpleChildAfterMount).not.toBeCalled();

            tick(timer);
            await tickAsync();
            tick();
            expect(asyncChildAfterMount).toBeCalledTimes(1);
            expect(simpleChildAfterMount).toBeCalledTimes(1);
            expect(container).toMatchSnapshot(
                '2. Асинхронный ребёнок отрисовался, и только сейчас позвались все хуки'
            );
        });

        it('Изменение реактивного значения изменяет значение checked', () => {
            // region Setup
            act(() => {
                instance = creator(ControlWithRadioInput, {}, container);
            });
            tick();
            // endregion

            const radioOne = document.getElementById(
                'radioOne'
            ) as HTMLInputElement;
            const radioTwo = document.getElementById(
                'radioTwo'
            ) as HTMLInputElement;
            act(() => {
                radioTwo.dispatchEvent(
                    new MouseEvent('click', { bubbles: true })
                );
            });
            tick();
            expect(radioOne.checked).toBeFalsy();
            expect(radioTwo.checked).toBeTruthy();
            act(() => {
                radioOne.dispatchEvent(
                    new MouseEvent('click', { bubbles: true })
                );
            });
            tick();
            expect(radioOne.checked).toBeTruthy();
            expect(radioTwo.checked).toBeFalsy();
        });

        it('Изменение реактивного значения в контентной опции с биндом на текущий scope', () => {
            // region Setup
            act(() => {
                instance = creator(ControlWithContentBind, {}, container);
            });
            tick();
            // endregion

            const controlWithContentBind = instance as ControlWithContentBind;
            controlWithContentBind._children.bottom.changeValue('text');

            // прокинули value наверх, пошла сверху перерисовка. она должна дойти до нижнего контрола и отобразить
            // новое значение value - "text". TemplateCreator не должен мешать, значение предыдущее и новое должны
            // отличаться
            tick();
            expect(container).toMatchSnapshot();
        });
    });

    describe('Использование внутреннего API реактивности', () => {
        it('Использование getArrayVersion()', () => {
            // region Setup
            act(() => {
                instance = creator(ControlWithArrayVersion, {}, container);
            });
            tick();
            // endregion

            let button = document.getElementById('startPush');
            act(() => {
                button.dispatchEvent(
                    new MouseEvent('click', { bubbles: true })
                );
            });
            tick();

            expect(container).toMatchSnapshot();

            button = document.getElementById('startUnshift');
            act(() => {
                button.dispatchEvent(
                    new MouseEvent('click', { bubbles: true })
                );
            });

            tick();
            expect(container).toMatchSnapshot();
        });
    });
});

describe('WasabyReactivity for clear react', () => {
    let container: HTMLDivElement;
    let setRecord: (newRecord: Record) => void;
    function onNewRecord(newSetRecord: typeof setRecord) {
        setRecord = newSetRecord;
    }
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        setRecord = undefined;
    });
    afterEach(() => {
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    it('Фунцкиональный компонент', () => {
        act(() => {
            render(<ClassComponent onNewRecord={onNewRecord} />, container);
        });
        expect(container).toMatchSnapshot('1. Рекорда ещё нет');

        const record = new Record({
            rawData: {
                text: 'first text',
            },
        });
        act(() => {
            setRecord(record);
        });
        expect(container).toMatchSnapshot(
            '2. Компонент получил рекорд через API'
        );

        act(() => {
            record.set('text', 'second text');
        });
        expect(container).toMatchSnapshot(
            '3. Компонент перерисовался после изменения содержимого рекорда'
        );
    });

    it('Классовый компонент', () => {
        act(() => {
            render(<FunctionComponent onNewRecord={onNewRecord} />, container);
        });
        expect(container).toMatchSnapshot('1. Рекорда ещё нет');

        const record = new Record({
            rawData: {
                text: 'first text',
            },
        });
        act(() => {
            setRecord(record);
        });
        expect(container).toMatchSnapshot(
            '2. Компонент получил рекорд через API'
        );

        act(() => {
            record.set('text', 'second text');
        });
        expect(container).toMatchSnapshot(
            '3. Компонент перерисовался после изменения содержимого рекорда'
        );
    });
});
