import { assert } from 'chai';
import { _Options as Options } from 'UI/Vdom';
import { TClosure } from 'UI/Executor';

const EMPTY_TEMPLATE_FUNC = function () {};

describe('UI/Vdom::Options', () => {
    describe('getChangedOptions', () => {
        it('not changed options', () => {
            const someObject = {
                a: 'b',
            };
            const someArray = ['a[0] = 1;'];
            const someFunction = function () {
                return 'return';
            };
            const newOptions = {
                opt1: 'value',
                opt2: 31415,
                opt3: NaN,
                opt4: false,
                opt5: someObject,
                opt6: someArray,
                opt7: null,
                opt8: undefined,
                opt9: someFunction,
            };
            const oldOptions = {
                opt1: 'value',
                opt2: 31415,
                opt3: NaN,
                opt4: false,
                opt5: someObject,
                opt6: someArray,
                opt7: null,
                opt8: undefined,
                opt9: someFunction,
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions
            );

            assert.strictEqual(checkChangedOptions, false);
        });

        it('changed primitive options', () => {
            const someObject = {
                a: 'b',
            };
            const someArray = ['a[0] = 1;'];
            const newOptions = {
                opt1: 'new value',
                opt2: 9265,
                opt3: 'not a NaN',
                opt4: true,
                opt5: someObject,
                opt6: someArray,
                opt7: 'null',
                opt8: 'undefined',
            };
            const oldOptions = {
                opt1: 'old value',
                opt2: 31415,
                opt3: NaN,
                opt4: false,
                opt5: someObject,
                opt6: someArray,
                opt7: null,
                opt8: undefined,
            };
            const goodChangedOptions = {
                opt1: 'new value',
                opt2: 9265,
                opt3: 'not a NaN',
                opt4: true,
                opt7: 'null',
                opt8: 'undefined',
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });

        it('changed object by link', () => {
            const newOptions = {
                opt5: {
                    a: 'b',
                },
            };
            const oldOptions = {
                opt5: {
                    a: 'b',
                },
            };
            const goodChangedOptions = {
                opt5: {
                    a: 'b',
                },
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });

        it('changed array by link', () => {
            const newOptions = {
                opt6: ['a[0] = 1;'],
            };
            const oldOptions = {
                opt6: ['a[0] = 1;'],
            };
            const goodChangedOptions = {
                opt6: ['a[0] = 1;'],
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });

        it('changed function', () => {
            const anotherFunction = function () {
                return 'return';
            };
            const someFunction = function () {
                return 'return';
            };
            const newOptions = {
                opt9: anotherFunction,
            };
            const oldOptions = {
                opt9: someFunction,
            };
            const goodChangedOptions = {
                opt9: anotherFunction,
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });

        it('changed object inside', () => {
            const someObject = {
                a: 'b',
            };
            const newOptions = {
                opt5: someObject,
            };
            const oldOptions = {
                opt5: someObject,
            };
            newOptions.opt5.a = 'c';
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions
            );

            assert.strictEqual(checkChangedOptions, false);
        });

        it('changed array inside', () => {
            const someArray = ['a[0] = 1;'];
            const newOptions = {
                opt6: someArray,
            };
            const oldOptions = {
                opt6: someArray,
            };
            newOptions.opt6.push('a[1] = 2;');
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions
            );

            assert.strictEqual(checkChangedOptions, false);
        });

        it('changed options on prototype', () => {
            const newPrototype = {
                value: 1,
            };
            const oldPrototype = {
                value: 2,
            };
            const newOptions = Object.create(newPrototype);
            const oldOptions = Object.create(oldPrototype);
            const goodChangedOptions = {
                value: 1,
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions,
                undefined,
                undefined,
                true
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });

        it('not increased version number of object', () => {
            const someObject = {
                a: 'b',
                v: 1,
                getVersion() {
                    return this.v;
                },
            };
            const oldOptionsVersions = {
                opt5: 1,
            };
            const newOptions = {
                opt5: someObject,
            };
            const oldOptions = {
                opt5: someObject,
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions,
                false,
                oldOptionsVersions
            );

            assert.strictEqual(checkChangedOptions, false);
        });

        it('data array', () => {
            const versionObject = {
                getVersion() {
                    return this._v;
                },
                _v: 1,
                data: ['a', 'b', 'c'],
            };
            const someArray = TClosure.createDataArray(
                [
                    {
                        func: EMPTY_TEMPLATE_FUNC,
                        internal: {
                            a: 'b',
                        },
                    },
                    {
                        func: EMPTY_TEMPLATE_FUNC,
                        internal: {
                            a: versionObject,
                        },
                    },
                ],
                'UIModule/template.wml',
                true,
                true
            );
            const anotherArray = TClosure.createDataArray(
                [
                    {
                        func: EMPTY_TEMPLATE_FUNC,
                        internal: {
                            a: 'b',
                        },
                    },
                    {
                        func: EMPTY_TEMPLATE_FUNC,
                        internal: {
                            a: versionObject,
                        },
                    },
                ],
                'UIModule/template.wml',
                true,
                true
            );
            const newOptions = {
                opt6: someArray,
                opt60: anotherArray,
            };
            const oldOptions = {
                opt6: someArray,
                opt60: someArray,
            };
            const goodChangedOptions = {
                opt60: anotherArray,
            };
            const oldOptionsVersions = {
                'opt6;1;a': 1,
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions,
                false,
                oldOptionsVersions
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });

        it('_preferVersionAPI object', () => {
            const someObject = {
                a: 'b',
                v: 1,
                getVersion() {
                    return this.v;
                },
                _preferVersionAPI: true,
            };
            const oldOptionsVersions = {
                opt5: 0,
                opt50: 1,
            };
            const newOptions = {
                opt5: someObject,
                opt50: someObject,
                zzz: '456',
            };
            const oldOptions = {
                opt5: null,
                opt50: null,
                zzz: '123',
            };
            const goodChangedOptions = {
                opt5: someObject,
                opt50: someObject,
                zzz: '456',
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions,
                false,
                oldOptionsVersions
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });
        it('_preferVersionAPI object 2', () => {
            const someObject = {
                a: 'b',
                v: 1,
                getVersion() {
                    return this.v;
                },
                _preferVersionAPI: true,
            };
            const oldOptionsVersions = {
                opt5: 0,
                opt50: 1,
            };
            const newOptions = {
                opt5: someObject,
                opt50: someObject,
                zzz: '456',
            };
            const oldOptions = {
                opt5: someObject,
                opt50: someObject,
                zzz: '123',
            };
            const goodChangedOptions = {
                opt5: someObject,
                zzz: '456',
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions,
                false,
                oldOptionsVersions
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });

        it('_isDeepChecking object', () => {
            const newOptions = {
                opt5: {
                    a: 'b',
                    _isDeepChecking: true,
                },
                opt50: {
                    a: 'c',
                    _isDeepChecking: true,
                },
                zzz: '456',
            };
            const oldOptions = {
                opt5: {
                    a: 'c',
                    _isDeepChecking: true,
                },
                opt50: {
                    a: 'c',
                    _isDeepChecking: true,
                },
                zzz: '123',
            };
            const goodChangedOptions = {
                opt5: {
                    a: 'b',
                    _isDeepChecking: true,
                },
                zzz: '456',
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });

        it('_ignoreChanging object', () => {
            const newOptions = {
                opt5: {
                    a: 'b',
                    _ignoreChanging: true,
                },
            };
            const oldOptions = {
                opt5: {
                    a: 'c',
                },
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions
            );

            assert.strictEqual(checkChangedOptions, false);
        });

        it('__dirtyCheckingVars_ options', () => {
            const newOptions = {
                __dirtyCheckingVars_0: {
                    a: 'b',
                },
                __dirtyCheckingVars_1: {
                    a: 'b',
                },
                zzz: '456',
            };
            const oldOptions = {
                __dirtyCheckingVars_0: {
                    a: 'b',
                },
                __dirtyCheckingVars_1: {
                    a: 'c',
                },
                zzz: '123',
            };
            const goodChangedOptions = {
                __dirtyCheckingVars_1: {
                    a: 'b',
                },
                zzz: '456',
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });

        it('DirtyCheckingVars options undefined', () => {
            const newOptions = undefined;
            const oldOptions = undefined;
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions
            );

            assert.isFalse(checkChangedOptions);
        });
        it('DirtyCheckingVars new options added', () => {
            const newOptions = {
                __dirtyCheckingVars_0: {
                    a: 'b',
                },
            };
            const oldOptions = {
                __dirtyCheckingVars_0: {
                    d: 'c',
                },
            };
            const goodChangedOptions = {
                __dirtyCheckingVars_0: {
                    a: 'b',
                },
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });
        it('new options added', () => {
            const newOptions = {
                a: 'b',
            };
            const oldOptions = {
                d: 'c',
            };
            const goodChangedOptions = {
                a: 'b',
                d: undefined,
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });
        it('new options updated', () => {
            const newOptions = {
                a: 'b',
            };
            const oldOptions = {
                a: undefined,
            };
            const goodChangedOptions = {
                a: 'b',
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });
        it('new options updated 2', () => {
            const newOptions = {
                a: undefined,
            };
            const oldOptions = {
                a: 'b',
            };
            const goodChangedOptions = {
                a: undefined,
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });
        it('new option removed', () => {
            const newOptions = {
                a: 'a',
                b: 'b',
            };
            const oldOptions = {
                a: 'a',
                b: 'b',
                c: 'c',
            };
            const goodChangedOptions = {
                c: undefined,
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions,
                false,
                {},
                true
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });
        it('new option removed 2', () => {
            const newOptions = {
                a: 'b',
                b: 'b',
            };
            const oldOptions = {
                a: 'a',
                b: 'b',
                c: 'c',
            };
            const goodChangedOptions = {
                a: 'b',
                c: undefined,
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions,
                false,
                {},
                true
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });
        it('old option removed', () => {
            const newOptions = {
                a: 'b',
            };
            const oldOptions = {
                d: 'c',
            };
            const goodChangedOptions = {
                d: undefined,
                a: 'b',
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions,
                false,
                {},
                true
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });
        it('new attr removed', () => {
            const newOptions = {
                a: 'a',
                b: 'b',
                c: '',
            };
            const oldOptions = {
                a: 'a',
                b: 'b',
                c: 'c',
            };
            const goodChangedOptions = {
                c: '',
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions,
                false,
                {},
                true
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });
        it('new attr removed 2', () => {
            const newOptions = {
                a: 'b',
                b: 'b',
                c: '',
            };
            const oldOptions = {
                a: 'b',
                c: 'c',
            };
            const goodChangedOptions = {
                b: 'b',
                c: '',
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions,
                false,
                {},
                true
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });
        it('new attr setter', () => {
            const newOptions = {
                a: 'b',
            };
            const oldOptions = {
                a: '',
            };
            const goodChangedOptions = {
                a: 'b',
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions,
                false,
                {},
                true
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
        });
        it('recursion', () => {
            const navigationObject = {
                getVersion() {
                    this.gotVersion = true;
                    return this._v;
                },
                gotVersion: false,
                _v: 1,
                data: [1, 2, 3],
            };
            const newContentArray = TClosure.createDataArray(
                [
                    {
                        func: EMPTY_TEMPLATE_FUNC,
                        internal: {
                            __dirtyCheckingVars_0: {
                                navigation: navigationObject,
                            },
                        },
                    },
                ],
                'UIModule/template.wml',
                true,
                true
            );
            const oldContentArray = TClosure.createDataArray(
                [
                    {
                        func: EMPTY_TEMPLATE_FUNC,
                        internal: {
                            __dirtyCheckingVars_0: {
                                navigation: navigationObject,
                            },
                        },
                    },
                ],
                'UIModule/template.wml',
                true,
                true
            );
            const oldOptionsVersions = {};
            const newOptions = {
                content: newContentArray,
            };
            const oldOptions = {
                content: oldContentArray,
            };
            const goodChangedOptions = {
                content: newContentArray,
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions,
                false,
                oldOptionsVersions
            );

            assert.deepEqual(checkChangedOptions, goodChangedOptions);
            assert.isTrue(navigationObject.gotVersion);
        });

        it('ignoreDirtyChecking is true', () => {
            const newOptions = {
                __dirtyCheckingVars_0: 'new value',
            };
            const oldOptions = {
                __dirtyCheckingVars_0: 'old value',
            };
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions,
                true
            );

            assert.strictEqual(checkChangedOptions, false);
        });

        it('should return next obj which has flag UNREACHABLE_GETTER_PATH_FLAG', () => {
            const someObject = {
                a: 'b',
            };
            const someArray = ['a[0] = 1;'];
            const someFunction = function () {
                return 'return';
            };
            const newOptions = {
                opt1: 'value',
                opt2: 31415,
                opt3: NaN,
                opt4: false,
                opt5: someObject,
                opt6: someArray,
                opt7: null,
                opt8: undefined,
                opt9: someFunction,
            };
            const oldOptions = {
                opt1: 'value',
                opt2: 31415,
                opt3: NaN,
                opt4: false,
                opt5: someObject,
                opt6: someArray,
                opt7: null,
                opt8: undefined,
                opt9: someFunction,
            };

            TClosure.setUnreachablePathFlag(newOptions);
            const checkChangedOptions = Options.getChangedOptions(
                newOptions,
                oldOptions
            );
            assert.deepEqual(checkChangedOptions, newOptions);
        });
    });
});
