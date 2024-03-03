import { StateReceiver } from 'Application/State';
import { logger } from 'Application/Env';
import { PageDependencies } from 'UICommon/_deps/PageDependencies';
import { DepsCollector } from 'UICommon/_deps/DepsCollector';
import {
    moduleLinks,
    moduleNodes,
    bundlesRoute,
    optionalBundles,
    features,
} from './resources/ModulesBundles';

describe('UICommon/_deps/PageDependencies', () => {
    let pageDependencies: PageDependencies;

    beforeAll(() => {
        const depsCollector = new DepsCollector(
            moduleLinks,
            moduleNodes,
            bundlesRoute,
            optionalBundles,
            features
        );
        pageDependencies = new PageDependencies(depsCollector, 'UnitTestPageDependencies');
    });

    beforeEach(() => {
        pageDependencies.clear();
        jest.spyOn(logger, 'info').mockImplementation();
    });

    describe('UICommon/Deps:addPageDeps', () => {
        it('add module', () => {
            const moduleName: string = 'Module/Name';
            pageDependencies.addPageDeps([moduleName]);
            expect(pageDependencies.pageDeps).toEqual(expect.arrayContaining([moduleName]));
        });

        it('add library', () => {
            const moduleName: string = 'Library/Name:Module';
            const libName: string = 'Library/Name';
            pageDependencies.addPageDeps([moduleName]);
            expect(pageDependencies.pageDeps).toEqual(expect.arrayContaining([libName]));
        });
    });

    describe('UICommon/Deps:collectDependencies', () => {
        beforeEach(() => {
            jest.spyOn(StateReceiver.prototype, 'serialize').mockImplementation(() => {
                return {
                    serialized: 'receivedStates',
                    additionalDeps: { 'AddModule/Name': true },
                };
            });
        });

        it('default call', function () {
            pageDependencies.addPageDeps(['Module/Name']);
            const deps = pageDependencies.collectDependencies();

            expect(deps.requiredModules).toEqual(
                expect.arrayContaining(['Module/Name', 'AddModule/Name'])
            );
            expect(deps.rsSerialized).toEqual('receivedStates');
            expect(deps.js).toEqual(
                expect.arrayContaining(['AddModule/Name', 'Module/Name', 'External/Module'])
            );
        });

        test('static page call', function () {
            pageDependencies.addPageDeps(['Module/Name']);
            const deps = pageDependencies.collectDependencies({
                links: moduleLinks,
                nodes: moduleNodes,
                bundles: bundlesRoute,
            });

            expect(deps.requiredModules).toEqual(
                expect.arrayContaining(['Module/Name', 'AddModule/Name'])
            );
            expect(deps.rsSerialized).toEqual('receivedStates');
            expect(deps.js).toEqual(
                expect.arrayContaining(['AddModule/Name', 'Module/Name', 'External/Module'])
            );
        });

        // модули-фичи
        it('modules with features', function () {
            pageDependencies.addPageDeps(['Feature/Name']);
            const deps = pageDependencies.collectDependencies();

            expect(deps.js).toEqual(
                expect.arrayContaining([
                    'Feature/Name',
                    'FeatureModule/Feature',
                    'FeatureDep/Feature',
                    'FeatureParentModule/Feature',
                    'FeatureParentDep/Feature',
                ])
            );
        });
    });
});
