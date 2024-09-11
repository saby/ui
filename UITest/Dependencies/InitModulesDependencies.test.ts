import { ModulesDependencies } from 'UICommon/_deps/InitModulesDependencies';
import * as Module3_moduleDependencies from 'json!UITest/Dependencies/resources/Module3-module-dependencies';
import * as Module4_moduleDependencies from 'json!UITest/Dependencies/resources/Module4-module-dependencies';
import * as resources_moduleDependencies from 'json!UITest/Dependencies/resources/resources-module-dependencies';

describe('InitModulesDependencies', () => {
    // тесты для старого описания module-dependencies
    // вообще нет nodesList - значит старый способ описания links и nodes, когда названия модулей пишутся целиком
    describe('old module-dependencies', () => {
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
            Module8: { features: { 'Module8/Other/Path': 'Module88' } },
            Module9: { features: { 'Module9/May/The/Force/Be/With/You': 'Module99' } },
        };

        beforeEach(() => {
            jest.spyOn(ModulesDependencies.prototype, 'require').mockImplementation(
                (path: string) => {
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
                }
            );
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
                'Module8/Other/Path': 'Module88/Other/Path',
                'Module9/May/The/Force/Be/With/You': 'Module99/May/The/Force/Be/With/You',
            });
        });
    });

    // тесты для второго способа описания links
    // - когда список с названиями зависимостей в links в виде индексов из массива nodesList
    describe('temp module-dependencies', () => {
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
            Module8: { features: { 'Module8/Other/Path': 'Module88' } },
            Module9: { features: { 'Module9/May/The/Force/Be/With/You': 'Module99' } },
        };

        beforeEach(() => {
            jest.spyOn(ModulesDependencies.prototype, 'require').mockImplementation(
                (path: string) => {
                    switch (path) {
                        case 'json!Module3/module-dependencies':
                            return {
                                links: { 'Module3/Name': [0] },
                                nodes: { 'Module3/Name': { path: 'Module3/Name.js' } },
                                nodesList: ['SomeModule2/Name'],
                            };
                        case 'json!Module4/module-dependencies':
                            return {
                                links: { 'Module4/Name': [0] },
                                nodes: { 'Module4/Name': { path: 'Module4/Name.js' } },
                                nodesList: ['SomeModule4/Name'],
                            };
                        case 'json!resources/module-dependencies':
                            return {
                                links: {
                                    'Module1/Name': [0],
                                    'Module2/Name': [1],
                                },
                                nodes: {
                                    'Module1/Name': { path: 'Module1/Name.js' },
                                    'Module2/Name': { path: 'Module2/Name.js' },
                                },
                                nodesList: ['SomeModule1/Name', 'SomeModule2/Name'],
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
                }
            );
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
                'Module8/Other/Path': 'Module88/Other/Path',
                'Module9/May/The/Force/Be/With/You': 'Module99/May/The/Force/Be/With/You',
            });
        });
    });

    // тесты для нового способа описания файла module-dependencies (links и nodes)
    // - ключи и список с названиями зависимостей в виде индексов из массива nodesList
    describe('new module-de', () => {
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
            Module9: { features: { 'Module9/May/The/Force/Be/With/You': 'Module99' } },
        };

        beforeEach(() => {
            jest.spyOn(ModulesDependencies.prototype, 'require').mockImplementation(
                (path: string) => {
                    switch (path) {
                        case 'json!Module3/module-dependencies':
                            return Module3_moduleDependencies;
                        case 'json!Module4/module-dependencies':
                            return Module4_moduleDependencies;
                        case 'json!resources/module-dependencies':
                            return resources_moduleDependencies;
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
                }
            );
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
                'Module9/May/The/Force/Be/With/You': 'Module99/May/The/Force/Be/With/You',
            });
        });
    });
});
