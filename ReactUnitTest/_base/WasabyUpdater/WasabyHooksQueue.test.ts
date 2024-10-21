/**
 * @jest-environment jsdom
 */
import { act } from 'react-dom/test-utils';
import { WasabyHooksQueue } from 'UICore/_base/Control/WasabyUpdater/WasabyHooksQueue';
import { Control } from 'UICore/Base';
import WasabyHooksQueueRoot from '../resources/WasabyUpdater/WasabyHooksQueue/Root';
import NumberZero from '../resources/WasabyUpdater/WasabyHooksQueue/NumberZero';
import NumberOne from '../resources/WasabyUpdater/WasabyHooksQueue/NumberOne';
import NumberTwo from '../resources/WasabyUpdater/WasabyHooksQueue/NumberTwo';
import NumberThree from '../resources/WasabyUpdater/WasabyHooksQueue/NumberThree';
import NumberZeroNeighbor from '../resources/WasabyUpdater/WasabyHooksQueue/NumberZeroNeighbor';

describe('класс WasabyHooksQueue', () => {
    let container: HTMLElement;
    let rootControl: Control;
    let wasabyHooksQueue: WasabyHooksQueue;
    beforeEach(() => {
        jest.useFakeTimers();
        container = document.createElement('div');
        document.body.appendChild(container);
        wasabyHooksQueue = new WasabyHooksQueue();
    });

    afterEach(() => {
        jest.useRealTimers();
        Control.destroyControl(rootControl, container);
        container.remove();
        jest.restoreAllMocks();
    });

    type TIndexedControl = Control & {
        index: number;
    };

    describe('Удаление добавленных хуков', () => {
        it('Удаление единственного', () => {
            let zero: NumberZero;
            jest.spyOn(NumberZero.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberZero) {
                    zero = this;
                }
            );

            act(() => {
                rootControl = Control.createControl(
                    WasabyHooksQueueRoot,
                    {},
                    container
                );
            });

            const callOrder = [];
            wasabyHooksQueue.enqueue(zero, () => {
                callOrder.push(zero.index);
            });
            wasabyHooksQueue.dequeue(zero);
            wasabyHooksQueue.release();

            expect(callOrder).toEqual([]);
        });

        it('Удаление первого из двух', () => {
            let one: NumberOne;
            jest.spyOn(NumberOne.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberOne) {
                    one = this;
                }
            );
            let zero: NumberZero;
            jest.spyOn(NumberZero.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberZero) {
                    zero = this;
                }
            );

            act(() => {
                rootControl = Control.createControl(
                    WasabyHooksQueueRoot,
                    {},
                    container
                );
            });

            const callOrder = [];
            wasabyHooksQueue.enqueue(one, () => {
                callOrder.push(one.index);
            });
            wasabyHooksQueue.enqueue(zero, () => {
                callOrder.push(zero.index);
            });
            wasabyHooksQueue.dequeue(one);
            wasabyHooksQueue.release();

            expect(callOrder).toEqual([zero.index]);
        });

        it('Удаление последнего из двух', () => {
            let one: NumberOne;
            jest.spyOn(NumberOne.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberOne) {
                    one = this;
                }
            );
            let zero: NumberZero;
            jest.spyOn(NumberZero.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberZero) {
                    zero = this;
                }
            );

            act(() => {
                rootControl = Control.createControl(
                    WasabyHooksQueueRoot,
                    {},
                    container
                );
            });

            const callOrder = [];
            wasabyHooksQueue.enqueue(one, () => {
                callOrder.push(one.index);
            });
            wasabyHooksQueue.enqueue(zero, () => {
                callOrder.push(zero.index);
            });
            wasabyHooksQueue.dequeue(zero);
            wasabyHooksQueue.release();

            expect(callOrder).toEqual([one.index]);
        });

        it('Удаление первого из трёх', () => {
            let two: NumberTwo;
            jest.spyOn(NumberTwo.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberTwo) {
                    two = this;
                }
            );
            let one: NumberOne;
            jest.spyOn(NumberOne.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberOne) {
                    one = this;
                }
            );
            let zero: NumberZero;
            jest.spyOn(NumberZero.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberZero) {
                    zero = this;
                }
            );

            act(() => {
                rootControl = Control.createControl(
                    WasabyHooksQueueRoot,
                    {},
                    container
                );
            });

            const callOrder = [];
            wasabyHooksQueue.enqueue(two, () => {
                callOrder.push(two.index);
            });
            wasabyHooksQueue.enqueue(one, () => {
                callOrder.push(one.index);
            });
            wasabyHooksQueue.enqueue(zero, () => {
                callOrder.push(zero.index);
            });
            wasabyHooksQueue.dequeue(two);
            wasabyHooksQueue.release();

            expect(callOrder).toEqual([one.index, zero.index]);
        });

        it('Удаление последнего из трёх', () => {
            let two: NumberTwo;
            jest.spyOn(NumberTwo.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberTwo) {
                    two = this;
                }
            );
            let one: NumberOne;
            jest.spyOn(NumberOne.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberOne) {
                    one = this;
                }
            );
            let zero: NumberZero;
            jest.spyOn(NumberZero.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberZero) {
                    zero = this;
                }
            );

            act(() => {
                rootControl = Control.createControl(
                    WasabyHooksQueueRoot,
                    {},
                    container
                );
            });

            const callOrder = [];
            wasabyHooksQueue.enqueue(two, () => {
                callOrder.push(two.index);
            });
            wasabyHooksQueue.enqueue(one, () => {
                callOrder.push(one.index);
            });
            wasabyHooksQueue.enqueue(zero, () => {
                callOrder.push(zero.index);
            });
            wasabyHooksQueue.dequeue(zero);
            wasabyHooksQueue.release();

            expect(callOrder).toEqual([two.index, one.index]);
        });

        it('Удаление среднего из трёх', () => {
            let two: NumberTwo;
            jest.spyOn(NumberTwo.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberTwo) {
                    two = this;
                }
            );
            let one: NumberOne;
            jest.spyOn(NumberOne.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberOne) {
                    one = this;
                }
            );
            let zero: NumberZero;
            jest.spyOn(NumberZero.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberZero) {
                    zero = this;
                }
            );

            act(() => {
                rootControl = Control.createControl(
                    WasabyHooksQueueRoot,
                    {},
                    container
                );
            });

            const callOrder = [];
            wasabyHooksQueue.enqueue(two, () => {
                callOrder.push(two.index);
            });
            wasabyHooksQueue.enqueue(one, () => {
                callOrder.push(one.index);
            });
            wasabyHooksQueue.enqueue(zero, () => {
                callOrder.push(zero.index);
            });
            wasabyHooksQueue.dequeue(one);
            wasabyHooksQueue.release();

            expect(callOrder).toEqual([two.index, zero.index]);
        });

        it('Удаление последнего хука во время запуска среднего', () => {
            let two: NumberTwo;
            jest.spyOn(NumberTwo.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberTwo) {
                    two = this;
                }
            );
            let one: NumberOne;
            jest.spyOn(NumberOne.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberOne) {
                    one = this;
                }
            );
            let zero: NumberZero;
            jest.spyOn(NumberZero.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberZero) {
                    zero = this;
                }
            );

            act(() => {
                rootControl = Control.createControl(
                    WasabyHooksQueueRoot,
                    {},
                    container
                );
            });

            const callOrder = [];
            wasabyHooksQueue.enqueue(two, () => {
                callOrder.push(two.index);
            });
            wasabyHooksQueue.enqueue(one, () => {
                callOrder.push(one.index);
                wasabyHooksQueue.dequeue(zero);
            });
            wasabyHooksQueue.enqueue(zero, () => {
                callOrder.push(zero.index);
            });
            wasabyHooksQueue.release();

            // хук zero не позвался, потому что был удалён до его очереди.
            expect(callOrder).toEqual([two.index, one.index]);
        });

        it('Автоматическое удаление хуков после вызова', () => {
            let two: NumberTwo;
            jest.spyOn(NumberTwo.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberTwo) {
                    two = this;
                }
            );
            let one: NumberOne;
            jest.spyOn(NumberOne.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberOne) {
                    one = this;
                }
            );
            let zero: NumberZero;
            jest.spyOn(NumberZero.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberZero) {
                    zero = this;
                }
            );

            act(() => {
                rootControl = Control.createControl(
                    WasabyHooksQueueRoot,
                    {},
                    container
                );
            });

            const callOrder = [];
            wasabyHooksQueue.enqueue(two, () => {
                callOrder.push(two.index);
            });
            wasabyHooksQueue.enqueue(one, () => {
                callOrder.push(one.index);
            });
            wasabyHooksQueue.enqueue(zero, () => {
                callOrder.push(zero.index);
            });

            wasabyHooksQueue.release();
            expect(callOrder).toEqual([two.index, one.index, zero.index]);

            callOrder.length = 0;
            wasabyHooksQueue.release();
            expect(callOrder).toEqual([]);
        });
    });

    describe('Порядок вызова хуков', () => {
        // Хорошо бы хотя бы 5, но это уже 120 перестановок.
        const permutationLength = 4;
        // Перестановка символизирует, в каком порядке нумерованные сверху вниз контролы добавляются в очередь.
        const allPermutations = generateAllPermutations(permutationLength);
        // Последняя перестановка - лексикографически максимальная, то есть числа по убыванию.
        const expectedPermutation = allPermutations[allPermutations.length - 1];
        // Ожидается, что вне зависимости от порядка добавления порядок вызова хуков будет снизу вверх.
        const table = allPermutations.map((permutation) => {
            return [permutation, expectedPermutation];
        });
        it.each(table)(
            'Для порядка добавления %j должен быть порядок вызова %j',
            (enqueueOrder: TPermutation, expectedCallOrder: TPermutation) => {
                const controlEnqueueOrder: TIndexedControl[] = [];
                for (const NumberedControl of [
                    NumberZero,
                    NumberOne,
                    NumberTwo,
                    NumberThree,
                ]) {
                    jest.spyOn(
                        NumberedControl.prototype,
                        '_beforeMount'
                    ).mockImplementation(function mockedBeforeMount(
                        this: TIndexedControl
                    ) {
                        controlEnqueueOrder[enqueueOrder.indexOf(this.index)] =
                            this;
                    });
                }

                act(() => {
                    rootControl = Control.createControl(
                        WasabyHooksQueueRoot,
                        {},
                        container
                    );
                });

                // На всякий случай проверим, правильный ли порядок контролов получился.
                expect(
                    controlEnqueueOrder.map((control) => {
                        return control.index;
                    })
                ).toEqual(enqueueOrder);

                const callOrder = [];
                for (const control of controlEnqueueOrder) {
                    wasabyHooksQueue.enqueue(control, () => {
                        callOrder.push(control.index);
                    });
                }
                wasabyHooksQueue.release();

                expect(callOrder).toEqual(expectedCallOrder);
            }
        );

        // Если из двух контролов ни один не является предком другого,
        // то есть контролы находятся в соседних ветках дерева компонентов,
        // порядок вызова их хуков совпадает с порядком добавления в очередь.
        it.each([[true], [false]])(
            'Порядок вызова соседей - %#',
            (isNeighborFirst: boolean) => {
                const controlEnqueueOrder: TIndexedControl[] = [];
                for (const NumberedControl of [
                    NumberZero,
                    NumberOne,
                    NumberTwo,
                    NumberThree,
                ]) {
                    jest.spyOn(
                        NumberedControl.prototype,
                        '_beforeMount'
                    ).mockImplementation(function mockedBeforeMount(
                        this: TIndexedControl
                    ) {
                        controlEnqueueOrder.push(this);
                    });
                }
                let neighbor: NumberZeroNeighbor;
                jest.spyOn(
                    NumberZeroNeighbor.prototype,
                    '_beforeMount'
                ).mockImplementation(function mockedBeforeMount(
                    this: NumberZeroNeighbor
                ) {
                    neighbor = this;
                });

                act(() => {
                    rootControl = Control.createControl(
                        WasabyHooksQueueRoot,
                        {},
                        container
                    );
                });

                const callOrder = [];
                if (isNeighborFirst) {
                    wasabyHooksQueue.enqueue(neighbor, () => {
                        callOrder.push(neighbor.index);
                    });
                }
                for (const control of controlEnqueueOrder) {
                    wasabyHooksQueue.enqueue(control, () => {
                        callOrder.push(control.index);
                    });
                }
                if (!isNeighborFirst) {
                    wasabyHooksQueue.enqueue(neighbor, () => {
                        callOrder.push(neighbor.index);
                    });
                }
                wasabyHooksQueue.release();

                const expectedNeighborOrder = isNeighborFirst
                    ? 0
                    : callOrder.length - 1;
                expect(callOrder.length).toBe(controlEnqueueOrder.length + 1);
                expect(callOrder.indexOf(neighbor.index)).toBe(
                    expectedNeighborOrder
                );
            }
        );

        it('Контрол добавляется в очередь только один раз, дальше игнорируется', () => {
            const controlEnqueueOrder: TIndexedControl[] = [];
            for (const NumberedControl of [
                NumberZero,
                NumberOne,
                NumberTwo,
                NumberThree,
            ]) {
                jest.spyOn(
                    NumberedControl.prototype,
                    '_beforeMount'
                ).mockImplementation(function mockedBeforeMount(
                    this: TIndexedControl
                ) {
                    controlEnqueueOrder.push(this);
                });
            }

            act(() => {
                rootControl = Control.createControl(
                    WasabyHooksQueueRoot,
                    {},
                    container
                );
            });
            const callOrder = [];
            for (const control of controlEnqueueOrder) {
                wasabyHooksQueue.enqueue(control, () => {
                    callOrder.push(control.index);
                });
            }
            // Попытаемся добавить те же контролы с другими колбеками.
            for (const control of controlEnqueueOrder) {
                wasabyHooksQueue.enqueue(control, () => {
                    callOrder.push(control.index + controlEnqueueOrder.length);
                });
            }
            wasabyHooksQueue.release();

            const expectedCallOrder = controlEnqueueOrder.map((control) => {
                return control.index;
            });
            // По убыванию.
            expectedCallOrder.sort((a, b) => {
                return b - a;
            });
            expect(callOrder).toEqual(expectedCallOrder);
        });

        it('Контрол, во время запуска добавленный после текущего, успевает в эту очередь', () => {
            let two: NumberTwo;
            jest.spyOn(NumberTwo.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberTwo) {
                    two = this;
                }
            );
            let one: NumberOne;
            jest.spyOn(NumberOne.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberOne) {
                    one = this;
                }
            );
            let zero: NumberZero;
            jest.spyOn(NumberZero.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberZero) {
                    zero = this;
                }
            );

            act(() => {
                rootControl = Control.createControl(
                    WasabyHooksQueueRoot,
                    {},
                    container
                );
            });

            const callOrder = [];
            wasabyHooksQueue.enqueue(two, () => {
                callOrder.push(two.index);
                wasabyHooksQueue.enqueue(zero, () => {
                    callOrder.push(zero.index);
                });
            });
            wasabyHooksQueue.enqueue(one, () => {
                callOrder.push(one.index);
            });
            wasabyHooksQueue.release();

            expect(callOrder).toEqual([two.index, one.index, zero.index]);
        });

        it('Контрол, во время запуска добавленный перед текущим, попадает в следующий запуск', () => {
            let two: NumberTwo;
            jest.spyOn(NumberTwo.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberTwo) {
                    two = this;
                }
            );
            let one: NumberOne;
            jest.spyOn(NumberOne.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberOne) {
                    one = this;
                }
            );
            let zero: NumberZero;
            jest.spyOn(NumberZero.prototype, '_beforeMount').mockImplementation(
                function mockedBeforeMount(this: NumberZero) {
                    zero = this;
                }
            );

            act(() => {
                rootControl = Control.createControl(
                    WasabyHooksQueueRoot,
                    {},
                    container
                );
            });

            const callOrder = [];
            wasabyHooksQueue.enqueue(one, () => {
                callOrder.push(one.index);
                wasabyHooksQueue.enqueue(two, () => {
                    callOrder.push(two.index);
                });
            });
            wasabyHooksQueue.enqueue(zero, () => {
                callOrder.push(zero.index);
            });

            wasabyHooksQueue.release();
            expect(callOrder).toEqual([one.index, zero.index]);

            callOrder.length = 0;
            wasabyHooksQueue.release();
            expect(callOrder).toEqual([two.index]);
        });
    });
});

type TPermutation = number[];

// Генерация всех перестановок чисел от 0 до n - 1.
function generateAllPermutations(n: number): TPermutation[] {
    const allPermutations: TPermutation[] = [];
    const firstPermutation = [];
    for (let i = 0; i < n; i++) {
        firstPermutation.push(i);
    }

    for (
        let currentPermutation = firstPermutation;
        !!currentPermutation;
        currentPermutation = generateNextPermutation(currentPermutation)
    ) {
        allPermutations.push(currentPermutation);
    }
    return allPermutations;
}

// Алгоритм https://www.nayuki.io/page/next-lexicographical-permutation-algorithm
function generateNextPermutation(permutation: TPermutation): TPermutation {
    let i: number = permutation.length - 1;
    while (i > 0 && permutation[i - 1] >= permutation[i]) {
        i--;
    }
    if (i <= 0) {
        // Достигли последней перестановки.
        return;
    }
    let j: number = permutation.length - 1;
    while (permutation[j] <= permutation[i - 1]) {
        j--;
    }

    // Ожидаем новый по ссылке массив.
    const nextPermutation: TPermutation = permutation.slice();

    let temp: number = nextPermutation[i - 1];
    nextPermutation[i - 1] = nextPermutation[j];
    nextPermutation[j] = temp;

    j = nextPermutation.length - 1;
    while (i < j) {
        temp = nextPermutation[i];
        nextPermutation[i] = nextPermutation[j];
        nextPermutation[j] = temp;
        i++;
        j--;
    }
    return nextPermutation;
}
