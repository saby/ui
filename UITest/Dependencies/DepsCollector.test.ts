import { controller } from 'I18n/i18n';
import { DepsCollector } from 'UICommon/_deps/DepsCollector';
import {
    moduleLinks,
    moduleNodes,
    bundlesRoute,
    optionalBundles,
} from './resources/ModulesBundles';

describe('DepsCollector', () => {
    let dc;
    beforeAll(() => {
        dc = new DepsCollector(
            moduleLinks,
            moduleNodes,
            bundlesRoute,
            optionalBundles
        );
    });

    it('single in bundle', () => {
        const deps = dc.collectDependencies(['aaa/aaa']);
        expect(deps.js).toStrictEqual(['bdl/aaa.package']);
    });
    it('several in bundle', () => {
        const deps = dc.collectDependencies(['vvv/aaa', 'vvv/bbb']);
        expect(deps.js).toStrictEqual(['bdl/ccc.package']);
    });
    it('single css not hooks js simple', () => {
        const deps = dc.collectDependencies(['css!aaa/ddd']);
        expect(deps.css.simpleCss).toStrictEqual(['aaa/ddd']);
        expect(deps.js).toStrictEqual([]);
    });
    it('single css not hooks js themed', () => {
        const deps = dc.collectDependencies(['css!theme?aaa/ddd']);
        expect(deps.css.themedCss).toStrictEqual(['aaa/ddd']);
        expect(deps.js).toStrictEqual([]);
    });
    it('recursive', () => {
        const deps = dc.collectDependencies(['ccc/aaa']);
        expect(deps.js).toStrictEqual([
            'bdl/ddd.package',
            'bdl/eee.package',
            'bdl/hhh.package',
            'bdl/ggg.package',
        ]);
    });
    it('optional pre-load', () => {
        const deps = dc.collectDependencies(['optional!xxx/aaa']);
        expect(deps.js).toStrictEqual(['bdl/jjj.package']);
    });
    it('optional no pre-load', () => {
        const deps = dc.collectDependencies(['optional!ccc/bbb']);
        expect(deps.js).toStrictEqual([]);
    });
    it('ext tmpl', () => {
        const deps = dc.collectDependencies(['tmpl!xxx/aaa']);
        expect(deps.tmpl).toStrictEqual(['xxx/aaa']);
    });
    it('tmpl packed in parent js', () => {
        const deps = dc.collectDependencies(['js/tmplDep']);
        expect(deps.js).toStrictEqual(['jstmplbdl/tmpldep.package']);
        expect(deps.tmpl).toStrictEqual([]);
    });
    it('custom extension in bundlesRoute', () => {
        const deps = dc.collectDependencies(['tmpl!ppp/ppp']);
        expect(deps.js).toStrictEqual(['bdl/tmplpckd.package']);
        expect(deps.tmpl).toStrictEqual([]);
    });

    describe('localization', () => {
        let currentLocaleSpy;

        beforeEach(() => {
            currentLocaleSpy = jest.spyOn(controller, 'currentLocale', 'get');
            jest.spyOn(controller, 'loadingsHistory', 'get').mockImplementation(
                () => {
                    return {
                        contexts: {
                            ModuleWithLocalization: {
                                'en-US': {
                                    dictionary:
                                        'ModuleWithLocalization/lang/en/en.json',
                                    style: 'ModuleWithLocalization/lang/en/en',
                                },
                                'ru-RU': {
                                    dictionary:
                                        'ModuleWithLocalization/lang/ru/ru.json',
                                },
                            },
                            ExternalModuleWithLocalization: {
                                'ru-RU': {
                                    dictionary:
                                        'ExternalModuleWithLocalization/lang/ru/ru.json',
                                },
                            },
                        },
                        locales: {
                            'ru-RU': 'I18n/locales/ru-RU',
                            'en-US': 'I18n/locales/en-US',
                        },
                        contents: {
                            ExternalModuleWithLocalization:
                                'ExternalModuleWithLocalization/contents.json',
                        },
                    };
                }
            );
        });

        it('should add dictionary and css', () => {
            currentLocaleSpy.mockImplementation(() => {
                return 'en-US';
            });

            const deps = dc.collectDependencies([
                'ModuleWithLocalization/test',
            ]);

            expect(deps.js).toStrictEqual([
                'I18n/locales/en-US',
                'ModuleWithLocalization/lang/en/en.json',
                'ModuleWithLocalization/test',
            ]);
            expect(deps.css.simpleCss).toStrictEqual([
                'ModuleWithLocalization/lang/en/en',
            ]);
        });

        it('should add only dictionary', () => {
            currentLocaleSpy.mockImplementation(() => {
                return 'ru-RU';
            });

            const deps = dc.collectDependencies([
                'ModuleWithLocalization/test',
            ]);

            expect(deps.js).toStrictEqual([
                'I18n/locales/ru-RU',
                'ModuleWithLocalization/lang/ru/ru.json',
                'ModuleWithLocalization/test',
            ]);
            expect(deps.css.simpleCss.length).toStrictEqual(0);
        });

        it('should add contents for external module', () => {
            currentLocaleSpy.mockImplementation(() => {
                return 'ru-RU';
            });

            const deps = dc.collectDependencies([
                'ExternalModuleWithLocalization/test',
            ]);

            expect(
                deps.js.includes('ExternalModuleWithLocalization/contents.json')
            ).toBe(true);
        });
    });

    it('missing optional dep', () => {
        const deps = dc.collectDependencies([
            'optional!nosuchdep',
            'tmpl!ppp/ppp',
        ]);
        expect(deps.js).toStrictEqual(['bdl/tmplpckd.package']);
        expect(deps.tmpl).toStrictEqual([]);
    });

    describe('optionalBundles', () => {
        test('single in bundle', () => {
            jest.spyOn(dc, 'getBundlesRoute').mockImplementation(function (
                this: DepsCollector
            ) {
                // @ts-ignore
                return { ...this.bundlesRoute, ...this.optionalBundles };
            });
            const deps = dc.collectDependencies(['aaa/aaa']);
            expect(deps.js).toStrictEqual(['bdl/optional-bundle-aaa.package']);
        });

        test('several in bundle', () => {
            jest.spyOn(dc, 'getBundlesRoute').mockImplementation(function (
                this: DepsCollector
            ) {
                // @ts-ignore
                return { ...this.bundlesRoute, ...this.optionalBundles };
            });
            const deps = dc.collectDependencies(['vvv/aaa', 'vvv/bbb']);
            expect(deps.js).toStrictEqual(['bdl/optional-bundle-ccc.package']);
        });
    });
});
