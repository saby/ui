import { areEqualTemplateWrapperProps } from 'UICore/_executor/_Markup/Creator/TemplateCreator';

describe('TemplateCreator file', function () {
    it('getChangedInternal', function () {
        const prevProps = {
            _$stateToCompareProps: {
                resolvedScope: {},
                template: {
                    prototype: {
                        _moduleName: '1',
                    },
                    internal: {},
                },
            },
        };
        const nextProps = {
            _$stateToCompareProps: {
                resolvedScope: {},
                template: {
                    prototype: {
                        _moduleName: '2',
                    },
                    internal: {},
                },
            },
        };
        // Изменение template.prototype._moduleName теперь заложено в изменение имени.
        // Проверим результат целой функции сравнения props для memo,
        // поскольку до вызова getChangedInternal в реальном сценарии выполнение не доберётся.
        const result = areEqualTemplateWrapperProps(prevProps, nextProps);

        expect(result).toBe(false);
    });
});
