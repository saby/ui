import {
    collectDependencies,
    getAllPackagesNames,
} from 'UICommon/_deps/RecursiveWalker';
import { ICollectedDepsRaw } from 'UICommon/_deps/Interface';
import {
    moduleLinks,
    moduleNodes,
    bundlesRoute,
} from './resources/ModulesBundles';

describe('RecursiveWalker', () => {
    test('collectDependencies', () => {
        const allDeps: ICollectedDepsRaw = {};
        const deps = [
            'Recursive/Name',
            'optional!Recursive/optional',
            'optional!xxx/aaa',
        ];
        collectDependencies(allDeps, deps, moduleLinks, moduleNodes);

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

    test('getAllPackagesNames', () => {
        const allDeps: ICollectedDepsRaw = {};
        const deps = ['Recursive/Name'];
        collectDependencies(allDeps, deps, moduleLinks, moduleNodes);

        const packages = getAllPackagesNames(
            allDeps,
            ['External/Recursive'],
            bundlesRoute
        );

        expect(Object.keys(packages).sort()).toEqual(
            [
                'browser',
                'css',
                'default',
                'i18n',
                'is',
                'js',
                'tmpl',
                'wml',
            ].sort()
        );
        // бандл не вычислился для распакованного модуля External/Module
        expect(packages).toHaveProperty(['js', 'Recursive/Name.package']);
        expect(packages).toHaveProperty([
            'css',
            'simpleCss',
            'bdl/Recursive.package',
        ]);
    });
});
