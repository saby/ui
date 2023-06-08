import { collectObjectVersions } from 'UICommon/Vdom';

describe('UICommon/_vdom/Synchronizer/resources/Options', () => {
    describe('collectObjectVersions', () => {
        test('версия для undefined', () => {
            const ver = collectObjectVersions(undefined);
            expect(ver).toEqual({});
        });

        test('версия для null', () => {
            const ver = collectObjectVersions(null);
            expect(ver).toEqual({});
        });

        test('версия пустого объекта', () => {
            const ver = collectObjectVersions({});
            expect(ver).toEqual({});
        });

        test('версия объекта с не версионируемыми полями', () => {
            const ver = collectObjectVersions({
                string: 'string',
                boolean: true,
                number: 0,
                array: [1],
                object: {},
            });
            expect(ver).toEqual({});
        });

        test('версия объекта с версионируемым полем', () => {
            const versionable = {
                getVersion: () => {
                    return 0;
                },
            };
            const ver = collectObjectVersions({ versionable });
            expect(ver).toEqual({ versionable: 0 });
        });

        test('версия объекта с версионируемым массивом', () => {
            const versionable: string[] & { getArrayVersion?: Function } = [];
            versionable.getArrayVersion = () => {
                return 0;
            };
            const ver = collectObjectVersions({
                versionableArray: versionable,
            });
            expect(ver).toEqual({ versionableArray: 0 });
        });

        test('версия объекта с массивом шаблонов', () => {
            const array: object[] & { isDataArray?: boolean } = [
                {
                    func: () => {
                        return;
                    },
                    internal: {
                        versionable: {
                            getVersion: () => {
                                return 0;
                            },
                        },
                    },
                },
            ];
            const templateArray = {
                array,
                isDataArray: true,
            };
            const ver = collectObjectVersions({ templateArray });
            expect(ver).toEqual({ 'templateArray;0;versionable': 0 });
        });

        test('версия объекта с шаблоном', () => {
            const template = {
                func: () => {
                    return;
                },
                internal: {
                    versionable: {
                        getVersion: () => {
                            return 0;
                        },
                    },
                },
                isDataArray: true,
            };
            const ver = collectObjectVersions({ template });
            expect(ver).toEqual({ 'template;;versionable': 0 });
        });

        test('версия объекта с объектом скоупа', () => {
            const scopeObject = {
                versionable: {
                    getVersion: () => {
                        return 0;
                    },
                },
                _$internal: true,
            };
            const ver = collectObjectVersions({
                __dirtyCheckingVars_scope: scopeObject,
            });
            expect(ver).toEqual({ versionable: 0 });
        });
    });
});
