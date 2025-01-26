/* eslint-disable @typescript-eslint/no-magic-numbers */
import type {
    TInternalsCollection,
    IOptions,
    TExtended,
    TWS3ContentOption,
    TWS4ContentOption,
    IVersionableArray
} from 'UICommon/_vdom/Types';

import { assert } from 'chai';
import { getChangedOptions, getChangedInternals } from 'UICommon/_vdom/OptionsNew';
import { collectObjectVersions, collectInternalsVersions } from 'UICommon/_vdom/Versions';
import { TClosure } from 'UI/Executor';

function createInternalsCollection(list: [number, TExtended | IOptions][]): TInternalsCollection {
    const internal: Map<number, TExtended | IOptions> = new Map();

    list.forEach(([key, value]) => {
        internal.set(key, value);
    });

    return internal;
}

function createContentOptionTmpl(fn: Function, int?: Map<number, unknown>): TWS3ContentOption {
    const contentOption = fn.bind(undefined);
    const internal = int ?? new Map<number, unknown>();

    internal.set(-1, fn);

    contentOption.isWasabyTemplate = false;
    contentOption.internal = internal;

    return contentOption;
}

function createContentOptionWml(fn: Function, isVdom: boolean, int?: Map<number, unknown>): TWS4ContentOption {
    const contentOption = fn.bind(undefined);
    const internal = int ?? new Map<number, unknown>();

    internal.set(-1, fn);

    return TClosure.createDataArray([{
        func: contentOption,
        internal,
        isWasabyTemplate: true
    }], 'stub-template-name', true, isVdom);
}

function createVersionableArray(array: unknown[] = [], version: number = 0): IVersionableArray<unknown> {
    const value = Array.from(array) as IVersionableArray<unknown>;

    value._arrayVersion = version;
    value.getArrayVersion = function() {
        return this._arrayVersion;
    };

    return value;
}

function createVersionableObject(preferVersionableApi: boolean = false, version: number = 0) {
    if (preferVersionableApi) {
        return {
            _preferVersionAPI: true,
            _version: version,
            _versionHasBeenChecked: false,
            getVersion() {
                this._versionHasBeenChecked = true;

                return this._version;
            },
            increaseVersion() {
                this._version++;
            },
            clean() {
                this._versionHasBeenChecked = false;
            }
        };
    }

    return {
        _version: version,
        _versionHasBeenChecked: false,
        getVersion() {
            this._versionHasBeenChecked = true;

            return this._version;
        },
        increaseVersion() {
            this._version++;
        },
        clean() {
            this._versionHasBeenChecked = false;
        }
    };
}

function createPossibleScopeObject(object: object = { }) {
    return {
        ...object,
        _$internal: true
    };
}

describe('UICommon/_vdom/OptionsNew', () => {
    const date = new Date();
    const map = new Map([[1, 'one'], [2, 'two']]);
    const set = new Set([1, 2]);
    const array = [1, 2];
    const object = { prop: 'value' };
    const fn = function() { return undefined; };
    const arrowFn = () => undefined;
    const tmplContent = createContentOptionTmpl(fn);
    const wmlContentVdom = createContentOptionWml(fn, true);
    const wmlContent = createContentOptionWml(fn, false);

    describe('collectObjectVersions new', () => {
        const emptyMap = new Map();

        it('should handle undefined as input object', () => {
            const versions = collectObjectVersions(undefined);

            expect(versions).toEqual(emptyMap);
        });
        it('should handle null as input object', () => {
            const versions = collectObjectVersions(null);

            expect(versions).toEqual(emptyMap);
        });
        it('should handle object with primitive values', () => {
            const versions = collectObjectVersions({
                opt1: true,
                opt2: null,
                opt3: undefined,
                opt4: 12.3,
                opt5: 'string',
                opt6: NaN
            });

            expect(versions).toEqual(emptyMap);
        });
        it('should handle unversionable object type values', () => {
            const versions = collectObjectVersions({
                opt7: date,
                opt8: map,
                opt9: set,
                opt10: array,
                opt11: object,
                opt12: fn,
                opt13: arrowFn
            });

            expect(versions).toEqual(emptyMap);
        });
        it('should collect versionable object type versions', () => {
            const arrayVersion = 123;
            const objectVersion = 234;
            const objectVersion2 = 345;

            const versions = collectObjectVersions({
                opt1: createVersionableArray(array, arrayVersion),
                opt2: createVersionableObject(false, objectVersion),
                opt3: createVersionableObject(true, objectVersion2)
            });

            expect(versions).toEqual(new Map([
                ['opt1', 123],
                ['opt2', 234],
                ['opt3', 345]
            ]));
        });
        it('should not collect possible scope object versions of option', () => {
            const versions = collectObjectVersions({
                scope: createPossibleScopeObject({
                    opt1: createVersionableArray(array),
                    opt2: createVersionableObject(),
                    opt3: createVersionableObject(true)
                })
            });

            expect(versions).toEqual(emptyMap);
        });
        it('should collect possible scope object versions of internal option', () => {
            const arrayVersion = 123;
            const objectVersion = 234;
            const objectVersion2 = 345;

            const versions = collectInternalsVersions(createInternalsCollection([
                [0, createPossibleScopeObject({
                    opt1: createVersionableArray(array, arrayVersion),
                    opt2: createVersionableObject(false, objectVersion),
                    opt3: createVersionableObject(true, objectVersion2)
                })]
            ]));

            expect(versions).toEqual(new Map([
                ['opt1', 123],
                ['opt2', 234],
                ['opt3', 345]
            ]));
        });
        it('should collect versionable object type versions from internals', () => {
            const arrayVersion = 123;
            const objectVersion = 234;
            const objectVersion2 = 345;

            const internal = createInternalsCollection([
                [0, createVersionableArray(array, arrayVersion)],
                [1, createVersionableObject(false, objectVersion)],
                [2, createVersionableObject(true, objectVersion2)]
            ]);

            const versions = collectInternalsVersions(internal);

            expect(versions).toEqual(new Map([
                ['0', 123],
                ['1', 234],
                ['2', 345]
            ]));
        });
        it('should collect versionable object type versions from content option internals', () => {
            const arrayVersion = 123;
            const objectVersion = 234;
            const objectVersion2 = 345;

            const internal = createInternalsCollection([
                [0, createVersionableArray(array, arrayVersion)],
                [1, createVersionableObject(false, objectVersion)],
                [2, createVersionableObject(true, objectVersion2)]
            ]);

            const versions = collectObjectVersions({
                opt1: createContentOptionTmpl(fn, internal),
                opt2: createContentOptionWml(fn, true, internal),
                opt3: createContentOptionWml(fn, false, internal)
            });

            // Важно! Internal не обрабатывались у контентных опций tmpl, поэтому их здесь нет.
            expect(versions).toEqual(new Map([
                ['opt2;0', 123],
                ['opt2;1', 234],
                ['opt2;2', 345],

                ['opt3;0', 123],
                ['opt3;1', 234],
                ['opt3;2', 345],
            ]));
        });
    });

    describe('getChangedOptions', () => {
        it('should not have changed options', () => {
            const changedOptions = getChangedOptions(undefined, undefined);

            assert.strictEqual(changedOptions, false);
        });
        it('should not have changed options 2', () => {
            const changedOptions = getChangedOptions({}, undefined);

            assert.strictEqual(changedOptions, false);
        });
        it('should not have changed options 3', () => {
            const changedOptions = getChangedOptions(undefined, {});

            assert.strictEqual(changedOptions, false);
        });
        it('should not have changed internals', () => {
            const changedOptions = getChangedInternals(undefined, undefined);

            assert.strictEqual(changedOptions, false);
        });
        it('should not have changed internals 2', () => {
            const changedOptions = getChangedInternals({}, undefined);

            assert.strictEqual(changedOptions, false);
        });
        it('should not have changed internals 3', () => {
            const changedOptions = getChangedInternals(undefined, {});

            assert.strictEqual(changedOptions, false);
        });
        it('should not have changes', () => {
            const next = {
                opt1: true,
                opt2: null,
                opt3: undefined,
                opt4: 12.3,
                opt5: 'string',
                opt6: NaN,
                opt7: date,
                opt8: map,
                opt9: set,
                opt10: array,
                opt11: object,
                opt12: fn,
                opt13: arrowFn,
                opt14: tmplContent,
                opt15: wmlContentVdom,
                opt16: wmlContent
            };
            const prev = {
                ...next
            };

            const changes = getChangedOptions(next, prev);

            assert.strictEqual(changes, false);
        });
        it('should detect inconsistent content option change', () => {
            const next = {
                opt15: wmlContentVdom,
                opt16: wmlContent
            };
            const prev = {
                opt15: true,
                opt16: true
            };

            const changes = getChangedOptions(next, prev);

            assert.deepEqual(changes, next);
        });
        it('should detect primitive type changes', () => {
            const next = {
                opt1: true,
                opt2: null,
                opt3: undefined,
                opt4: 12.3,
                opt5: 'string',
                opt6: NaN
            };
            const prev = {
                opt1: false,
                opt2: undefined,
                opt3: null,
                opt4: NaN,
                opt5: 'value',
                opt6: 23.4
            };

            const changes = getChangedOptions(next, prev);

            assert.deepEqual(changes, next);
        });
        it('should detect object type changes', () => {
            const next = {
                opt7: new Date(),
                opt8: new Map(),
                opt9: new Set(),
                opt10: Array.from(array),
                opt11: { ...object },
                opt12: fn.bind(undefined),
                opt13: arrowFn.bind(undefined)
            };
            const prev = {
                opt7: date,
                opt8: map,
                opt9: set,
                opt10: array,
                opt11: object,
                opt12: fn,
                opt13: arrowFn
            };

            const changes = getChangedOptions(next, prev);

            assert.deepEqual(changes, next);
        });
        it('should detect object type changes on prototype', () => {
            const nextProto = {
                opt7: new Date(),
                opt8: new Map(),
                opt9: new Set(),
                opt10: Array.from(array),
                opt11: { ...object },
                opt12: fn.bind(undefined),
                opt13: arrowFn.bind(undefined)
            };
            const prevProto = {
                opt7: date,
                opt8: map,
                opt9: set,
                opt10: array,
                opt11: object,
                opt12: fn,
                opt13: arrowFn
            };

            const next = Object.create(nextProto);
            const prev = Object.create(prevProto);

            const changes = getChangedOptions(next, prev);

            assert.deepEqual(changes, nextProto);
        });
        it('should detect option insertion', () => {
            const next = {
                opt1: true
            };
            const prev = { };

            const changes = getChangedOptions(next, prev);

            assert.deepEqual(changes, next);
        });
        it('should not detect option insertion for compound check', () => {
            const next = {
                opt1: true
            };
            const prev = { };

            const changes = getChangedOptions(next, prev, new Map(), [], false, true, false);

            assert.strictEqual(changes, false);
        });
        it('should detect option removal', () => {
            const next = { };
            const prev = {
                opt1: true
            };

            const changes = getChangedOptions(next, prev);

            assert.deepEqual(changes, {
                opt1: undefined
            });
        });

        it('should not detect validators option change', () => {
            const next = {
                validators: fn
            };
            const prev = {
                validators: fn
            };

            const changes = getChangedOptions(next, prev);

            assert.strictEqual(changes, false);
        });
        it('should detect validators option change', () => {
            const next = {
                validators: fn.bind(undefined)
            };
            const prev = {
                validators: fn
            };

            const changes = getChangedOptions(next, prev);

            assert.deepEqual(changes, next);
        });

        it('should not detect changes for equal content option with equal internals', () => {
            const internal = createInternalsCollection([
                [1, true],
                [2, null],
                [3, undefined],
                [4, 12.3],
                [5, 'string'],
                [6, NaN]
            ]);

            const next = {
                opt1: createContentOptionTmpl(fn, internal),
                opt2: createContentOptionWml(fn, true, internal),
                opt3: createContentOptionWml(fn, false, internal)
            };
            const prev = {
                opt1: createContentOptionTmpl(fn, internal),
                opt2: createContentOptionWml(fn, true, internal),
                opt3: createContentOptionWml(fn, false, internal)
            };

            const changes = getChangedOptions(next, prev);

            // Важно! Internal не обрабатывались у контентных опций tmpl,
            // поэтому здесь контентная опция tmpl определена как измененная
            assert.deepEqual(changes, {
                opt1: next.opt1
            });
        });
        it('should detect changes for equal content option with changed internals', () => {
            const nextInternal = createInternalsCollection([
                [1, true],
                [2, null],
                [3, undefined],
                [4, 12.3],
                [5, 'string'],
                [6, NaN]
            ]);
            const prevInternal = createInternalsCollection([
                [1, false],
                [2, undefined],
                [3, null],
                [4, NaN],
                [5, 'value'],
                [6, 23.4]
            ]);

            const next = {
                opt1: createContentOptionTmpl(fn, nextInternal),
                opt2: createContentOptionWml(fn, true, nextInternal),
                opt3: createContentOptionWml(fn, false, nextInternal)
            };
            const prev = {
                opt1: createContentOptionTmpl(fn, prevInternal),
                opt2: createContentOptionWml(fn, true, prevInternal),
                opt3: createContentOptionWml(fn, false, prevInternal)
            };

            const changes = getChangedOptions(next, prev);

            assert.deepEqual(changes, next);
        });

        it('should not detect internal changes', () => {
            const next = createInternalsCollection([
                [1, true],
                [2, null],
                [3, undefined],
                [4, 12.3],
                [5, 'string'],
                [6, NaN]
            ]);
            const prev = createInternalsCollection([
                [1, true],
                [2, null],
                [3, undefined],
                [4, 12.3],
                [5, 'string'],
                [6, NaN]
            ]);

            const changes = getChangedInternals(next, prev);

            assert.strictEqual(changes, false);
        });
        it('should not detect internal changes 2', () => {
            const next = createInternalsCollection([
                [1, true],
                [2, null],
                [3, undefined],
                [4, 12.3],
                [5, 'string'],
                [6, NaN]
            ]);
            const prev = createInternalsCollection([
                [1, false],
                [2, undefined],
                [3, null],
                [4, NaN],
                [5, 'value'],
                [6, 23.4]
            ]);

            const changes = getChangedInternals(next, prev, new Map(), true, false, false);

            assert.strictEqual(changes, false);
        });
        it('should detect internals changes', () => {
            const next = createInternalsCollection([
                [1, true],
                [2, null],
                [3, undefined],
                [4, 12.3],
                [5, 'string'],
                [6, NaN]
            ]);
            const prev = createInternalsCollection([
                [1, false],
                [2, undefined],
                [3, null],
                [4, NaN],
                [5, 'value'],
                [6, 23.4]
            ]);

            const changes = getChangedInternals(next, prev);

            assert.deepEqual(changes, next);
        });

        describe('versionable values', () => {
            it('should not detect changes of versionable array with equal reference and version', () => {
                const versionableArray = createVersionableArray();

                const next = {
                    opt1: versionableArray
                };
                const prev = {
                    ...next
                };
                const versionsStorage = collectObjectVersions(next);

                const changes = getChangedOptions(next, prev, versionsStorage);

                assert.strictEqual(changes, false);
            });
            it('should detect changes of versionable array with equal reference and new version', () => {
                const versionableArray = createVersionableArray();

                const next = {
                    opt1: versionableArray
                };
                const prev = {
                    ...next
                };
                const versionsStorage = collectObjectVersions(next);

                versionableArray._arrayVersion++;

                const changes = getChangedOptions(next, prev, versionsStorage);

                assert.deepEqual(changes, next);
            });
            it('should detect changes of versionable array with new reference and equal version', () => {
                const next = {
                    opt1: createVersionableArray()
                };
                const prev = {
                    opt1: createVersionableArray()
                };

                const versionsStorage = collectObjectVersions(prev);

                const changes = getChangedOptions(next, prev, versionsStorage);

                assert.deepEqual(changes, next);
            });
            it('should detect changes of versionable array with new reference and new version', () => {
                const next = {
                    opt1: createVersionableArray()
                };
                const prev = {
                    opt1: createVersionableArray()
                };

                next.opt1._arrayVersion++;

                const versionsStorage = collectObjectVersions(prev);

                const changes = getChangedOptions(next, prev, versionsStorage);

                assert.deepEqual(changes, next);
            });

            it('should not detect changes of versionable object with equal reference and version', () => {
                const versionableObject = createVersionableObject();

                const next = {
                    opt1: versionableObject
                };
                const prev = {
                    ...next
                };
                const versionsStorage = collectObjectVersions(next);

                versionableObject.clean();

                const changes = getChangedOptions(next, prev, versionsStorage);

                assert.strictEqual(changes, false);
                assert.isTrue(versionableObject._versionHasBeenChecked);
            });
            it('should detect changes of versionable object with equal reference and new version', () => {
                const versionableObject = createVersionableObject();

                const next = {
                    opt1: versionableObject
                };
                const prev = {
                    ...next
                };
                const versionsStorage = collectObjectVersions(next);

                versionableObject.increaseVersion();
                versionableObject.clean();

                const changes = getChangedOptions(next, prev, versionsStorage);

                assert.deepEqual(changes, next);
                assert.isTrue(versionableObject._versionHasBeenChecked);
            });
            it('should detect changes of versionable object with new reference and equal version', () => {
                const next = {
                    opt1: createVersionableObject()
                };
                const prev = {
                    opt1: createVersionableObject()
                };

                const versionsStorage = collectObjectVersions(prev);

                const changes = getChangedOptions(next, prev, versionsStorage);

                assert.deepEqual(changes, next);
            });
            it('should detect changes of versionable object with new reference and new version', () => {
                const next = {
                    opt1: createVersionableObject()
                };
                const prev = {
                    opt1: createVersionableObject()
                };

                next.opt1.increaseVersion();

                const versionsStorage = collectObjectVersions(prev);

                const changes = getChangedOptions(next, prev, versionsStorage);

                assert.deepEqual(changes, next);
            });
        });

        describe('template data types', () => {
            it('should not detect ws:Array changes', () => {
                const next = {
                    opt1: {
                        array
                    }
                };
                const prev = {
                    opt1: {
                        array
                    }
                };

                const changes = getChangedOptions(next, prev, new Map(), ['opt1'], false, false, false);

                assert.deepEqual(changes, false);
            });
            it('should detect ws:Array changes', () => {
                const next = {
                    opt1: {
                        array: Array.from(array)
                    }
                };
                const prev = {
                    opt1: {
                        array
                    }
                };

                const changes = getChangedOptions(next, prev, new Map(), ['opt1'], false, false, false);

                assert.deepEqual(changes, next);
            });

            it('should not detect ws:Boolean changes', () => {
                const next = {
                    opt1: true
                };
                const prev = {
                    opt1: true
                };

                const changes = getChangedOptions(next, prev, new Map(), ['opt1'], false, false, false);

                assert.strictEqual(changes, false);
            });
            it('should detect ws:Boolean changes', () => {
                const next = {
                    opt1: true
                };
                const prev = {
                    opt1: false
                };

                const changes = getChangedOptions(next, prev, new Map(), ['opt1'], false, false, false);

                assert.deepEqual(changes, next);
            });

            it('should not detect ws:Function changes', () => {
                const next = {
                    opt1: fn,
                    opt2: arrowFn
                };
                const prev = {
                    opt1: fn,
                    opt2: arrowFn
                };

                const changes = getChangedOptions(next, prev, new Map(), ['opt1', 'opt2'], false, false, false);

                assert.strictEqual(changes, false);
            });
            it('should detect ws:Function changes', () => {
                const next = {
                    opt1: fn.bind(undefined),
                    opt2: arrowFn.bind(undefined)
                };
                const prev = {
                    opt1: fn,
                    opt2: arrowFn
                };

                const changes = getChangedOptions(next, prev, new Map(), ['opt1', 'opt2'], false, false, false);

                assert.deepEqual(changes, next);
            });

            it('should not detect ws:Number changes', () => {
                const next = {
                    opt1: 12.3
                };
                const prev = {
                    opt1: 12.3
                };

                const changes = getChangedOptions(next, prev, new Map(), ['opt1'], false, false, false);

                assert.strictEqual(changes, false);
            });
            it('should detect ws:Number changes', () => {
                const next = {
                    opt1: 12.3
                };
                const prev = {
                    opt1: 23.4
                };

                const changes = getChangedOptions(next, prev, new Map(), ['opt1'], false, false, false);

                assert.deepEqual(changes, next);
            });

            it('should not detect ws:Object changes', () => {
                const next = {
                    opt1: {
                        object
                    }
                };
                const prev = {
                    opt1: {
                        object
                    }
                };

                const changes = getChangedOptions(next, prev, new Map(), ['opt1'], false, false, false);

                assert.deepEqual(changes, false);
            });
            it('should detect ws:Object changes', () => {
                const next = {
                    opt1: {
                        object: { ...object }
                    }
                };
                const prev = {
                    opt1: {
                        object
                    }
                };

                const changes = getChangedOptions(next, prev, new Map(), ['opt1'], false, false, false);

                assert.deepEqual(changes, next);
            });

            it('should not detect ws:String changes', () => {
                const next = {
                    opt1: 'value'
                };
                const prev = {
                    opt1: 'value'
                };

                const changes = getChangedOptions(next, prev, new Map(), ['opt1'], false, false, false);

                assert.strictEqual(changes, false);
            });
            it('should detect ws:String changes', () => {
                const next = {
                    opt1: 'value'
                };
                const prev = {
                    opt1: 'new value'
                };

                const changes = getChangedOptions(next, prev, new Map(), ['opt1'], false, false, false);

                assert.deepEqual(changes, next);
            });

            it('should not detect ws:Value changes', () => {
                // FIXME: бага. На null нельзя навесить свойство.
                const next = {
                    opt1: undefined
                };
                const prev = {
                    opt1: undefined
                };

                const changes = getChangedOptions(next, prev, new Map(), ['opt1'], false, false, false);

                assert.strictEqual(changes, false);
            });
            it('should detect ws:Value changes', () => {
                const next = {
                    opt1: { }
                };
                const prev = {
                    opt1: undefined
                };

                const changes = getChangedOptions(next, prev, new Map(), ['opt1'], false, false, false);

                assert.deepEqual(changes, next);
            });
        });

        describe('special object flags', () => {
            it('should not detect changes with _ignoreChanging of objects with equal reference', () => {
                const objectWithFlag = {
                    _ignoreChanging: true
                };
                const next = {
                    opt1: objectWithFlag
                };
                const prev = {
                    opt1: objectWithFlag
                };

                const changes = getChangedOptions(next, prev);

                assert.strictEqual(changes, false);
            });
            it('should not detect changes with _ignoreChanging of objects with new reference', () => {
                const next = {
                    opt1: {
                        _ignoreChanging: true
                    }
                };
                const prev = {
                    opt1: {
                        _ignoreChanging: true
                    }
                };

                const changes = getChangedOptions(next, prev);

                assert.strictEqual(changes, false);
            });
            it('should detect changes with _ignoreChanging on option removal', () => {
                const next = { };
                const prev = {
                    opt1: {
                        _ignoreChanging: true
                    }
                };

                const changes = getChangedOptions(next, prev);

                assert.deepEqual(changes, {
                    opt1: undefined
                });
            });

            it('should not detect deep changes with equal reference', () => {
                const objectWithFlag = {
                    _isDeepChecking: true,
                    prop: true
                };
                const next = {
                    opt1: objectWithFlag
                };
                const prev = {
                    opt1: objectWithFlag
                };

                const changes = getChangedOptions(next, prev);

                assert.strictEqual(changes, false);
            });
            it('should not detect deep changes with new reference', () => {
                const next = {
                    opt1: {
                        _isDeepChecking: true,
                        prop: true
                    }
                };
                const prev = {
                    opt1: {
                        _isDeepChecking: true,
                        prop: true
                    }
                };

                const changes = getChangedOptions(next, prev);

                assert.strictEqual(changes, false);
            });
            it('should detect deep changes', () => {
                const next = {
                    opt1: {
                        _isDeepChecking: true,
                        prop: true
                    }
                };
                const prev = {
                    opt1: {
                        _isDeepChecking: true,
                        prop: false
                    }
                };

                const changes = getChangedOptions(next, prev);

                assert.deepEqual(changes, next);
            });

            it('should not detect changes of new versionable object with equal version', () => {
                const next = {
                    opt1: createVersionableObject(true)
                };
                const prev = {
                    opt1: createVersionableObject()
                };

                const versionsStorage = collectObjectVersions(prev);

                const changes = getChangedOptions(next, prev, versionsStorage);

                assert.strictEqual(changes, false);
            });
            it('should detect changes of new versionable object with new version', () => {
                const next = {
                    opt1: createVersionableObject(true)
                };
                const prev = {
                    opt1: createVersionableObject()
                };

                next.opt1.increaseVersion();

                const versionsStorage = collectObjectVersions(prev);

                const changes = getChangedOptions(next, prev, versionsStorage);

                assert.deepEqual(changes, next);
            });

            it('should detect internal wrong context', () => {
                const next = {
                    __UNREACHABLE_GETTER_PATH__: true
                };
                const prev = { };

                const changes = getChangedOptions(next, prev);

                assert.deepEqual(changes, next);
            });
        });
    });
});
