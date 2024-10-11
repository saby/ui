import { collectDependencies, getAllPackagesNames } from 'UICommon/_deps/RecursiveWalker';
import { ICollectedDepsRaw } from 'UICommon/_deps/Interface';
import { moduleLinks, moduleNodes, bundlesRoute, features } from './resources/ModulesBundles';

describe('RecursiveWalker', () => {
    describe('collectDependencies', () => {
        test('base', () => {
            const allDeps: ICollectedDepsRaw = {};
            const deps = ['Recursive/Name', 'optional!Recursive/optional', 'optional!xxx/aaa'];
            collectDependencies(allDeps, deps, moduleLinks, moduleNodes, features);

            expect(allDeps).toHaveProperty('js');
            expect(allDeps).toHaveProperty('wml');
            expect(allDeps).toHaveProperty('css');
            expect(Object.keys(allDeps.js)).toEqual([
                'Recursive/Name',
                'External/Recursive',
                'xxx/aaa',
            ]);
            expect(allDeps.css).toHaveProperty('css!Recursive/ddd');
        });

        test('features', () => {
            const allDeps: ICollectedDepsRaw = {};
            const deps = ['Feature/Name'];
            collectDependencies(allDeps, deps, moduleLinks, moduleNodes, features);

            expect(Object.keys(allDeps.js)).toEqual([
                'Feature/Name',
                'FeatureModule/Feature',
                'FeatureDep/Feature',
                'FeatureParentModule/Feature',
                'FeatureParentDep/Feature',
                'FeatureEmpty/Dependency',
                'FeatureParentEmpty/Dependency',
            ]);
        });
    });

    test('getAllPackagesNames', () => {
        const allDeps: ICollectedDepsRaw = {};
        const deps = ['Recursive/Name'];
        collectDependencies(allDeps, deps, moduleLinks, moduleNodes, features);

        const packages = getAllPackagesNames(allDeps, ['External/Recursive'], bundlesRoute, []);

        expect(Object.keys(packages).sort()).toEqual(
            ['browser', 'css', 'default', 'i18n', 'is', 'js', 'tmpl', 'wml'].sort()
        );
        // бандл не вычислился для распакованного модуля External/Module
        expect(packages).toHaveProperty(['js', 'Recursive/Name.package']);
        expect(packages).toHaveProperty(['css', 'simpleCss', 'bdl/Recursive.package']);
    });

    test('getAllPackagesNames, extractBundles', () => {
        const allDeps: ICollectedDepsRaw = {};
        const deps = ['aaa/aaa', 'css!aaa/bbb', 'css!aaat/bbbt', 'vvv/aaa'];
        collectDependencies(allDeps, deps, moduleLinks, moduleNodes, features);

        const extractBundles: string[] = ['bdl/aaa.package'];
        const packages = getAllPackagesNames(
            allDeps,
            ['External/Recursive'],
            bundlesRoute,
            extractBundles
        );

        expect(packages).toHaveProperty(['js', 'bdl/ccc.package']);
        expect(packages).toHaveProperty(['js', 'aaa/aaa']);
        expect(packages).toHaveProperty(['css', 'simpleCss', 'bdl/aaat.package']);
        expect(packages).toHaveProperty(['css', 'simpleCss', 'aaa/bbb']);
    });
});
