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
        // модули, в которых есть модули-фичи
        Module7: { features: { 'Module7/Name': 'Module77' } },
        Module8: { features: { 'Module8/Name': 'Module88' } },
    };

    beforeEach(() => {
        jest.spyOn(ModulesDependencies.prototype, 'require').mockImplementation((path: string) => {
            switch (path) {
                case 'json!Module3/module-dependencies':
                    return {
                        links: { 'Module3/Name': ['SomeModule2/Name'] },
                        nodes: { 'Module3/Name': { path: 'Module3/Name.js' } },
                    };
                case 'json!Module4/module-dependencies':
                    return {
                        links: { 'Module4/Name': ['SomeModule4/Name'] },
                        nodes: { 'Module4/Name': { path: 'Module4/Name.js' } },
                    };
                case 'json!resources/module-dependencies':
                    return {
                        links: {
                            'Module1/Name': ['SomeModule1/Name'],
                            'Module2/Name': ['SomeModule2/Name'],
                        },
                        nodes: {
                            'Module1/Name': { path: 'Module1/Name.js' },
                            'Module2/Name': { path: 'Module2/Name.js' },
                        },
                    };
                // bundlesRoute
                case 'json!Module3/bundlesRoute':
                    return {
                        'Module3/Name': 'Module3/Name.package.js',
                    };
                case 'json!Module4/bundlesRoute':
                    return {
                        'Module4/Name': 'Module4/Name.package.js',
                    };
                case 'json!resources/bundlesRoute':
                    return {
                        'Module1/Name': 'Module1/Name.package.js',
                        'Module2/Name': 'Module2/Name.package.js',
                    };
                // optionalBundles
                case 'json!Module5/optionalBundles':
                    return {
                        'Module5/optional-superbundle.package.min': ['SomeModule5/Name'],
                    };
                case 'json!Module6/optionalBundles':
                    return {
                        'Module6/optional-superbundle.package.min': ['SomeModule6/Name'],
                    };
                default:
                    return {};
            }
        });
    });

    test('modules meta', () => {
        const { links, nodes, bundles, optionalBundles, optionalBundlesModuleNames, features } =
            new ModulesDependencies('resources', contentsModules).modulesMeta;

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
        expect(features).toEqual({
            'Module7/Name': 'Module77/Name',
            'Module8/Name': 'Module88/Name',
        });
    });

    test('convertLinks', () => {
        const md = new ModulesDependencies('resources', contentsModules);
        const deps = {
            nodes: {},
            links: {
                'Module/One': [1, 2],
                'Module/Two': [2, 3],
                'Module/Three': [0, 1, 2],
            },
            nodesList: ['Module/One', 'Module/Two', 'Module/Three', 'Module/Four'],
        };
        const result = md.convertLinks(deps);
        expect(result.links).toEqual({
            'Module/One': ['Module/Two', 'Module/Three'],
            'Module/Two': ['Module/Three', 'Module/Four'],
            'Module/Three': ['Module/One', 'Module/Two', 'Module/Three'],
        });
    });
});
