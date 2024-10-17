/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/dom';

import FocusEnvironment from './_focusTabScenarios/TestEnvironment';
import Root1 from './_focusTabScenarios/Root1';
import Root2 from './_focusTabScenarios/Root2';
import Root3 from './_focusTabScenarios/Root3';
import Root4 from './_focusTabScenarios/Root4';
import Root5 from './_focusTabScenarios/Root5';

const user = userEvent.setup();

const withoutShift = {
    shift: false,
    toString: () => 'без shift',
};

const withShift = {
    shift: true,
    toString: () => 'с shift',
};

describe('Комплексные тесты обхода по табу', () => {
    // Начало большинства сценариев одно и то же.
    async function testScenarioStart(): Promise<void> {
        const startElement = await screen.findByText('Начинаем с клика сюда');
        await user.click(startElement);
        expect(document.activeElement?.className).toBe('testStart');
    }

    // Сценарий обхода по табу тоже идентичный.
    async function collectTabOrder(
        tabConfig: { shift: boolean },
        pressCount: number
    ): Promise<string[]> {
        const actualFocusedClassNames = [];
        for (let i = 0; i < pressCount; i++) {
            await user.tab(tabConfig);
            actualFocusedClassNames.push(document.activeElement?.className);
        }
        return actualFocusedClassNames;
    }

    let container: HTMLElement;
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    afterEach(() => {
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    describe('Сценарий номер 1', () => {
        test.each([
            [
                withoutShift,
                [
                    'input2',
                    'input1',
                    'input3',
                    'input9',
                    'input7',
                    'input8',
                    'input6',
                    'input5',
                    'input4',
                    'input10',
                    'div1',
                    'input11',
                    'input13',
                    'input15',
                    'input17',
                    'input18',
                    'input19',
                    'div3',
                    'input2',
                    'input1',
                ],
            ],
            [
                withShift,
                [
                    'div3',
                    'input19',
                    'input18',
                    'input17',
                    'input15',
                    'input13',
                    'div1',
                    'input11',
                    'input10',
                    'input4',
                    'input5',
                    'input6',
                    'input8',
                    'input7',
                    'input9',
                    'input3',
                    'input1',
                    'input2',
                    'div3',
                    'input19',
                ],
            ],
        ])('tab нажимается %s', async (tabConfig, expectedOrderClassNames) => {
            act(() => {
                render(
                    <FocusEnvironment>
                        <Root1 />
                    </FocusEnvironment>,
                    container
                );
            });

            await testScenarioStart();

            const actualOrderClassNames = await collectTabOrder(
                tabConfig,
                expectedOrderClassNames.length
            );
            expect(actualOrderClassNames).toEqual(expectedOrderClassNames);
        });
    });

    describe('Сценарий номер 2', () => {
        test.each([
            [
                withoutShift,
                [
                    'input2',
                    'input1',
                    'input3',
                    'input9',
                    'input7',
                    'input8',
                    'input6',
                    'input5',
                    'input4',
                    'testStart',
                ],
            ],
            [
                withShift,
                [
                    'input4',
                    'input5',
                    'input6',
                    'input8',
                    'input7',
                    'input9',
                    'input3',
                    'input1',
                    'input2',
                    'testStart',
                ],
            ],
        ])('tab нажимается %s', async (tabConfig, expectedOrderClassNames) => {
            act(() => {
                render(
                    <FocusEnvironment>
                        <Root2 />
                    </FocusEnvironment>,
                    container
                );
            });

            await testScenarioStart();

            const actualOrderClassNames = await collectTabOrder(
                tabConfig,
                expectedOrderClassNames.length
            );
            expect(actualOrderClassNames).toEqual(expectedOrderClassNames);
        });
    });

    describe('Сценарий номер 3', () => {
        test.each([
            [
                withoutShift,
                ['input1', 'input2', 'input3', 'input4', 'input2', 'input3'],
                ['input5', 'input5', 'input5'],
                ['testStart'],
            ],
            [
                withShift,
                ['input6', 'input4', 'input3', 'input2', 'input4', 'input3'],
                ['input5', 'input5', 'input5'],
                ['input4', 'input3', 'input2', 'input4', 'input3'],
            ],
        ])(
            'tab нажимается %s',
            async (
                tabConfig,
                expectedOrderClassNamesS1,
                expectedOrderClassNamesS2,
                expectedOrderClassNamesS3
            ) => {
                act(() => {
                    render(
                        <FocusEnvironment>
                            <Root3 />
                        </FocusEnvironment>,
                        container
                    );
                });

                await testScenarioStart();

                const actualOrderClassNamesS1 = await collectTabOrder(
                    tabConfig,
                    expectedOrderClassNamesS1.length
                );
                expect(actualOrderClassNamesS1).toEqual(expectedOrderClassNamesS1);

                const stageTwoElement = await screen.findByTestId('Клик перед второй фазой');
                await user.click(stageTwoElement);
                expect(document.activeElement?.getAttribute('data-qa')).toBe(
                    'Клик перед второй фазой'
                );

                const actualOrderClassNamesS2 = await collectTabOrder(
                    tabConfig,
                    expectedOrderClassNamesS2.length
                );
                expect(actualOrderClassNamesS2).toEqual(expectedOrderClassNamesS2);

                const stageThreeElement = await screen.findByTestId('Клик перед третьей фазой');
                await user.click(stageThreeElement);
                expect(document.activeElement?.getAttribute('data-qa')).toBe(
                    'Клик перед третьей фазой'
                );

                const actualOrderClassNamesS3 = await collectTabOrder(
                    tabConfig,
                    expectedOrderClassNamesS3.length
                );
                expect(actualOrderClassNamesS3).toEqual(expectedOrderClassNamesS3);
            }
        );
    });

    describe('Сценарий номер 4', () => {
        test.each([
            [withoutShift, ['input3', 'input1', 'input4', 'testStart']],
            [withShift, ['input1', 'input3', 'testStart']],
        ])('tab нажимается %s', async (tabConfig, expectedOrderClassNames) => {
            act(() => {
                render(
                    <FocusEnvironment>
                        <Root4 />
                    </FocusEnvironment>,
                    container
                );
            });

            const startElement = await screen.findByTestId('Этот сценарий начинается здесь');
            await user.click(startElement);
            expect(document.activeElement?.getAttribute('data-qa')).toBe(
                'Этот сценарий начинается здесь'
            );

            const actualOrderClassNames = await collectTabOrder(
                tabConfig,
                expectedOrderClassNames.length
            );
            expect(actualOrderClassNames).toEqual(expectedOrderClassNames);
        });
    });

    describe('Сценарий номер 5', () => {
        test('Каскадный перевод фокуса', async () => {
            const onFirstFocus = jest.fn();
            const onSecondFocusResult = jest.fn();
            act(() => {
                render(
                    <FocusEnvironment>
                        <Root5
                            getSecondFocusResult={onSecondFocusResult}
                            onFirstFocus={onFirstFocus}
                        />
                    </FocusEnvironment>,
                    container
                );
            });

            await testScenarioStart();
            await user.tab();

            expect(document.activeElement?.className).toBe('input3');
            expect(onFirstFocus).toBeCalledTimes(1);
            expect(onSecondFocusResult).toHaveBeenCalledWith(true);
        });
    });
});
