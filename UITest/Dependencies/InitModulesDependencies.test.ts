import { ModulesDependencies } from 'UICommon/_deps/InitModulesDependencies';

describe('InitModulesDependencies', () => {
    const contentsModules = {
        // "свои" модули текущего сервиса, /resources/Module
        Module1: {},
        Module2: {},
        // модули "подключенных" сторонних сервисов
        Module3: { path: 'external/service3' },
        Module4: { path: 'external/service4' },
        // модули, в которых описаны опциональные бандлы
        Module5: { hasOptionalBundles: true },
        Module6: { hasOptionalBundles: true },
    };

    beforeEach(() => {
        jest.spyOn(
            ModulesDependencies.prototype,
            'requireModuleDeps'
        ).mockImplementation((moduleName: string) => {
            switch (moduleName) {
                case 'Module3':
                    return {
                        links: { 'Module3/Name': ['SomeModule2/Name'] },
                        nodes: { 'Module3/Name': { path: 'Module3/Name.js' } },
                        bundles: { 'Module3/Name': 'Module3/Name.package.js' },
                    };
                case 'Module4':
                    return {
                        links: { 'Module4/Name': ['SomeModule4/Name'] },
                        nodes: { 'Module4/Name': { path: 'Module4/Name.js' } },
                        bundles: { 'Module4/Name': 'Module4/Name.package.js' },
                    };
                case 'resources':
                default:
                    return {
                        links: {
                            'Module1/Name': ['SomeModule1/Name'],
                            'Module2/Name': ['SomeModule2/Name'],
                        },
                        nodes: {
                            'Module1/Name': { path: 'Module1/Name.js' },
                            'Module2/Name': { path: 'Module2/Name.js' },
                        },
                        bundles: {
                            'Module1/Name': 'Module1/Name.package.js',
                            'Module2/Name': 'Module2/Name.package.js',
                        },
                    };
            }
        });
        jest.spyOn(
            ModulesDependencies.prototype,
            'requireModuleOptionalBundles'
        ).mockImplementation((moduleName: string) => {
            switch (moduleName) {
                case 'Module5':
                    return {
                        bundles: {
                            'Module5/optional-superbundle.package.min': [
                                'SomeModule5/Name',
                            ],
                        },
                    };
                case 'Module6':
                    return {
                        bundles: {
                            'Module6/optional-superbundle.package.min': [
                                'SomeModule6/Name',
                            ],
                        },
                    };
                default:
                    return {};
            }
        });
    });

    test('modules meta', () => {
        const {
            links,
            nodes,
            bundles,
            optionalBundles,
            optionalBundlesModuleNames,
        } = new ModulesDependencies('resources', contentsModules).modulesMeta;

        expect(links).toEqual({
            'Module1/Name': ['SomeModule1/Name'],
            'Module2/Name': ['SomeModule2/Name'],
            'Module3/Name': ['SomeModule2/Name'],
            'Module4/Name': ['SomeModule4/Name'],
        });
        expect(nodes).toEqual({
            'Module1/Name': { path: 'Module1/Name.js' },
            'Module2/Name': { path: 'Module2/Name.js' },
            'Module3/Name': { path: 'Module3/Name.js' },
            'Module4/Name': { path: 'Module4/Name.js' },
        });
        expect(bundles).toEqual({
            'Module1/Name': 'Module1/Name.package.js',
            'Module2/Name': 'Module2/Name.package.js',
            'Module3/Name': 'Module3/Name.package.js',
            'Module4/Name': 'Module4/Name.package.js',
        });
        expect(optionalBundles).toEqual({
            'SomeModule5/Name': 'Module5/optional-superbundle.package.min.js',
            'SomeModule6/Name': 'Module6/optional-superbundle.package.min.js',
        });
        expect(optionalBundlesModuleNames).toEqual(['Module5', 'Module6']);
    });
});
