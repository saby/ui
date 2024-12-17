/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import DynamicParent from './DynamicParent';
import DynamicParentChildren1 from './DynamicParentChildren1';
import DynamicParentChildren2 from './DynamicParentChildren2';
import ObservableParent from './_observableOption/Parent';
import ObservableChild1 from './_observableOption/Child1';
import ObservableChild2 from './_observableOption/Child2';

expect.extend({
    // проверяет, что порядок вызовов возрастающий
    toBeAscendingCallOrder(
        received: jest.SpyInstance[]
    ): jest.CustomMatcherResult {
        const callOrder = received.map((callSpy) => {
            return callSpy.mock.invocationCallOrder[0];
        });
        const isSorted = callOrder.every((currItem, index, arr) => {
            return !index || arr[index - 1] <= currItem;
        });
        const mockNames = received
            .map((callSpy) => {
                return callSpy.getMockName();
            })
            .join(',');
        if (isSorted) {
            return {
                message: () => {
                    return `expected ${mockNames} not to be in ascending call order`;
                },
                pass: true,
            };
        } else {
            return {
                message: () => {
                    return `expected ${mockNames} to be in ascending call order`;
                },
                pass: false,
            };
        }
    },
});

describe('Порядок вызова _beforeUpdate вложенных контролов', () => {
    let container;

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
        container.remove();
        container = null;
    });

    test('изменямеый синхронно синхронный|*асинхронный*|асинхронный', async () => {
        let beforeMountOptions;

        jest.spyOn<any, string>(
            DynamicParentChildren1.prototype,
            '_beforeMount'
        ).mockImplementation(function (): Promise<void> {
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 50);
            });
        });

        jest.spyOn<any, string>(
            DynamicParentChildren2.prototype,
            '_beforeMount'
        ).mockImplementation(function (options): Promise<void> {
            beforeMountOptions = options;
            return new Promise<void>((resolve) => {
                resolve();
            });
        });

        const child1AfterMountSpy = jest.spyOn<any, string>(
            DynamicParentChildren1.prototype,
            '_afterMount'
        );
        const child2AfterMountSpy = jest.spyOn<any, string>(
            DynamicParentChildren2.prototype,
            '_afterMount'
        );

        const child1BeforeUpdateSpy = jest.spyOn<any, string>(
            DynamicParentChildren1.prototype,
            '_beforeUpdate'
        );

        let beforeUpdateOptions;
        let beforeUpdateOldOptions;
        const child2BeforeUpdateSpy = jest
            .spyOn<any, string>(
                DynamicParentChildren2.prototype,
                '_beforeUpdate'
            )
            .mockImplementation(function (options) {
                beforeUpdateOldOptions = this._options;
                beforeUpdateOptions = options;
            });

        act(() => {
            render(<DynamicParent />, container);
        });

        await act(async () => {
            jest.advanceTimersByTime(50);
        });

        await act(async () => {
            jest.advanceTimersByTime(10);
        });

        await act(async () => {
            jest.runOnlyPendingTimers();
        });

        expect(container).toMatchSnapshot();

        /* beforeUpdate детей вызываны */
        expect(child1BeforeUpdateSpy).toBeCalledTimes(1);
        expect(child2BeforeUpdateSpy).toBeCalledTimes(1);

        expect(beforeMountOptions.param).toBe(beforeUpdateOldOptions.param);
        expect(beforeUpdateOldOptions.param).not.toBe(
            beforeUpdateOptions.param
        );

        const child2BeforeUpdateOrder =
            child2BeforeUpdateSpy.mock.invocationCallOrder[0];
        const child1BeforeUpdateOrder =
            child1BeforeUpdateSpy.mock.invocationCallOrder[0];
        const child2AfterMountOrder =
            child2AfterMountSpy.mock.invocationCallOrder[0];
        const child1AfterMountOrder =
            child1AfterMountSpy.mock.invocationCallOrder[0];

        // test('beforeUpdate 1 ребёнка вызван после всех afterMount', () => {
        expect(child2AfterMountOrder).toBeLessThan(child1BeforeUpdateOrder);
        expect(child1AfterMountOrder).toBeLessThan(child1BeforeUpdateOrder);
        // });

        // test('beforeUpdate 2 ребёнка вызван после всех afterMount', () => {
        expect(child2AfterMountOrder).toBeLessThan(child2BeforeUpdateOrder);
        expect(child1AfterMountOrder).toBeLessThan(child2BeforeUpdateOrder);
        // });

        // test('beforeUpdate 2 ребёнка вызван после всех beforeUpdate 1 ребёнка', () => {
        expect(child1BeforeUpdateOrder).toBeLessThan(child2BeforeUpdateOrder);
        // });
    });

    test('синхронный|Асинхронный|синхронный - версионируемое реактивное свойство приводит к обновлению ребенка', async () => {
        // У Parent есть реактивное свойство _prefetchRecord и асинхронный процесс, который его обновит когда-то.
        // У Child1 есть реактивное версионируемое свойство _record, которое проброшено к Child2.
        // Это свойство меняется в _beforeMount Child2, что вызывает отложенный _forceUpdate у Child1.
        // Потом асинхронный процесс Parent обновляет свое реактивное свойство _prefetchRecord ещё до маунта всего,
        // поэтому render для Parent и Child1 позовется (соотв. options.prefetchRecord у Child1 уже станет новый),
        // но т.к. не будет вызова _beforeUpdate, ничего не обновится.
        // И вот из-за отложенного _forceUpdate позовется _beforeUpdate у Child1,
        // у которого в this._options должны быть старые опции (которые были при _beforeMount).

        let beforeMountOptions;
        const child1BeforeMount = ObservableChild1.prototype._beforeMount;
        jest.spyOn<any, string>(
            ObservableChild1.prototype,
            '_beforeMount'
        ).mockImplementation(function (options): Promise<void> {
            beforeMountOptions = options;
            return child1BeforeMount.call(this, options);
        });
        jest.spyOn<any, string>(ObservableChild2.prototype, '_beforeMount');

        const child1AfterMountSpy = jest
            .spyOn<any, string>(ObservableChild1.prototype, '_afterMount')
            .mockName('child1AfterMountSpy');
        const child2AfterMountSpy = jest
            .spyOn<any, string>(ObservableChild2.prototype, '_afterMount')
            .mockName('child2AfterMountSpy');

        let beforeUpdateOptions;
        let beforeUpdateOldOptions;
        const child1BeforeUpdate = ObservableChild1.prototype._beforeUpdate;
        const child1BeforeUpdateSpy = jest
            .spyOn<any, string>(ObservableChild1.prototype, '_beforeUpdate')
            .mockName('child1BeforeUpdateSpy')
            .mockImplementationOnce(function (options) {
                beforeUpdateOldOptions = this._options;
                beforeUpdateOptions = options;
                child1BeforeUpdate.call(this, options);
            });

        const child2BeforeUpdateSpy = jest
            .spyOn<any, string>(ObservableChild2.prototype, '_beforeUpdate')
            .mockName('child2BeforeUpdateSpy');

        act(() => {
            render(<ObservableParent />, container);
        });

        await act(async () => {
            jest.runAllTimers();
        });

        await act(async () => {
            jest.runAllTimers();
        });

        expect(container).toMatchSnapshot();

        expect(beforeMountOptions.prefetchRecord).toBe(
            beforeUpdateOldOptions.prefetchRecord
        );
        expect(beforeUpdateOldOptions.prefetchRecord).not.toBe(
            beforeUpdateOptions.prefetchRecord
        );

        /* beforeUpdate детей вызываны */
        expect(child1BeforeUpdateSpy).toBeCalled();
        expect(child2BeforeUpdateSpy).toBeCalled();

        // beforeUpdate 1 ребёнка вызван после всех afterMount
        expect([
            child2AfterMountSpy,
            child1BeforeUpdateSpy,
        ]).toBeAscendingCallOrder();
        expect([
            child1AfterMountSpy,
            child1BeforeUpdateSpy,
        ]).toBeAscendingCallOrder();

        // beforeUpdate 2 ребёнка вызван после всех afterMount
        expect([
            child2AfterMountSpy,
            child2BeforeUpdateSpy,
        ]).toBeAscendingCallOrder();
        expect([
            child1AfterMountSpy,
            child2BeforeUpdateSpy,
        ]).toBeAscendingCallOrder();

        // beforeUpdate 2 ребёнка вызван после всех beforeUpdate 1 ребёнка
        expect([
            child1BeforeUpdateSpy,
            child2BeforeUpdateSpy,
        ]).toBeAscendingCallOrder();
    });
});
