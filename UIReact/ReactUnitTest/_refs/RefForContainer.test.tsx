/**
 * @jest-environment jsdom
 */
import * as template from 'wml!ReactUnitTest/_refs/RefForContainer/MergeTypeNone/Template';
import { GeneratorVdom } from 'UICore/_executor/_Markup/Vdom/Generator';

describe('Тестирование проброса refForContainer через шаблон не в корне', () => {
    it('Базовый тест', async () => {
        const generator = new GeneratorVdom({});
        const res = generator.createControlNew(
            'resolver',
            template,
            {},
            {},
            {
                readOnly: false,
                theme: false,
            },
            {
                isVdom: true,
                attr: {
                    refForContainer: true,
                    _isRootElement: true,
                },
                mergeType: 'none',
                data: {},
            }
        );
        expect(
            res?.props?._$stateToCompareProps?.templateAttributes
        ).toBeTruthy();
        // refForContainer не прокинулся в partial, а значит controlNodes навесился на корневой элемент шаблона,
        // а не на корневой элемент внутри partial
        expect(
            res?.props._$stateToCompareProps.templateAttributes.refForContainer
        ).toBeFalsy();
    });
});
