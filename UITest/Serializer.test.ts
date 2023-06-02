import { Serializer } from 'UI/State';
import { Model } from 'Types/entity';
import { List } from 'Types/collection';
import { NEW_TYPE } from 'UICommon/_state/Types';

describe('UI/State:Serializer', () => {
    function getUnserializableMock() {
        const Mock = function (state: unknown) {
            this.state = state;
        };
        Mock.prototype.fromJSON = function (state: unknown) {
            return new Mock(state);
        };
        return Mock;
    }

    function getSerializedObj() {
        return {
            a: undefined,
            b: null,
            c: false,
            d: 0,
            e: 1,
            f: [],
            g: [undefined, 1, 2],
            h: {
                ha: undefined,
                hb: Infinity,
                hc: -Infinity,
            },
            j: NaN,
        };
    }

    function getSerializedSample() {
        return '{"a":"$u","b":null,"c":false,"d":0,"e":1,"f":[],"g":["$u",1,2],"h":{"ha":"$u","hb":"$+i","hc":"$-i"},"j":"$n"}';
    }

    let serializer: Serializer;

    beforeEach(function () {
        serializer = new Serializer();
    });

    afterEach(function () {
        serializer = undefined;
    });

    describe('.serialize()', function () {
        it('should serialize a function', function () {
            const result = serializer.serialize('f', function () {
                return Math.random();
            });
            expect(result.$serialized$).toStrictEqual('func');
            expect(result.id >= 0).toBe(true);
        });

        it('should serialize Infinity', function () {
            const result = serializer.serialize('i', Infinity);
            expect(result).toStrictEqual(NEW_TYPE.P_INF);
        });

        it('should serialize -Infinity', function () {
            const result = serializer.serialize('i', -Infinity);
            expect(result).toStrictEqual(NEW_TYPE.M_INF);
        });

        it('should serialize undefined', function () {
            const result = serializer.serialize('u', undefined);
            expect(result).toStrictEqual(NEW_TYPE.UNDEF);
        });

        it('should serialize NaN', function () {
            const result = serializer.serialize('n', NaN);
            expect(result).toStrictEqual(NEW_TYPE.NAN);
        });

        it("should serialize undefined if it's an array element", function () {
            const result = serializer.serialize(1, undefined);
            expect(result).toStrictEqual(NEW_TYPE.UNDEF);
        });

        it('should return unchanged', function () {
            expect(serializer.serialize('a', null)).toStrictEqual(null);
            expect(serializer.serialize('a', 1)).toStrictEqual(1);
            expect(serializer.serialize('a', 'b')).toStrictEqual('b');
            const arr = [];
            expect(serializer.serialize('a', arr)).toStrictEqual(arr);
            const obj = {};
            expect(serializer.serialize('a', obj)).toStrictEqual(obj);
        });

        it('should serialize function with module name', function () {
            const testfunc = function () {};
            testfunc._moduleName = 'WS.Core/core';
            const serialize = serializer.serialize('test', testfunc);
            expect(serialize.module).toStrictEqual(testfunc._moduleName);
        });

        it('should serialize function with module name from library', function () {
            const testfunc = function () {};
            testfunc._moduleName = 'WS.Core/core:core';
            const serialize = serializer.serialize('test', testfunc);
            expect(serialize.module).toStrictEqual('WS.Core/core');
            expect(serialize.path).toStrictEqual('core');
        });

        describe('when used with JSON.stringify() as replacer', function () {
            it('should work properly with deep structures', function () {
                const string = JSON.stringify(getSerializedObj(), serializer.serialize);
                expect(string).toStrictEqual(getSerializedSample());
            });

            it('should work with serializable instance', function () {
                const model = new Model();
                const plainObj = JSON.parse(JSON.stringify(model, serializer.serialize));
                expect(plainObj.$serialized$).toStrictEqual('inst');
                expect(plainObj.module).toStrictEqual('Types/entity:Model');
            });

            it('should work with serializable instance in deep structures', function () {
                const model = new Model();
                const plainObj = JSON.parse(
                    JSON.stringify(
                        {
                            a: {
                                b: [model],
                            },
                        },
                        serializer.serialize
                    )
                );
                expect(plainObj.a.b[0].$serialized$).toStrictEqual('inst');
                expect(plainObj.a.b[0].module).toStrictEqual('Types/entity:Model');
            });

            it('should serialize string if it contents function ', function () {
                const plainObj = JSON.parse(
                    JSON.stringify(
                        {
                            a: 'functionsdf',
                        },
                        serializer.serialize
                    ),
                    serializer.serialize
                );
                expect(plainObj.a).toStrictEqual('functionsdf');
            });

            it('should create links for duplicates', function () {
                const modelA = new Model();
                const modelB = new Model();
                const json = JSON.stringify(
                    {
                        a: modelA,
                        b: modelB,
                        c: modelA,
                        d: {
                            e: [modelB],
                        },
                    },
                    serializer.serialize
                );
                const plainObj = JSON.parse(json);

                expect(plainObj.c.$serialized$).toStrictEqual('link');
                expect(plainObj.c.id).toStrictEqual(plainObj.a.id);

                expect(plainObj.d.e[0].$serialized$).toStrictEqual('link');
                expect(plainObj.d.e[0].id).toStrictEqual(plainObj.b.id);
            });
        });
    });

    describe('.deserialize()', function () {
        it('should deserialize a function', function () {
            const func = function () {
                return Math.random();
            };
            const result = serializer.deserialize('f', serializer.serialize('f', func));
            expect(result).toBeInstanceOf(Function);
            expect(result).toStrictEqual(func);
        });

        it('should deserialize a function by module and path', function () {
            Serializer.setToJsonForFunction(
                serializer.deserialize,
                'UI/State',
                'Serializer.prototype.deserialize'
            );
            expect(
                serializer.deserialize('', serializer.deserialize.toJSON()).wsHandlerPath
            ).toStrictEqual('UI/State:Serializer.prototype.deserialize');
        });

        it('should deserialize a date', function () {
            const date = new Date('1995-12-17T01:02:03');
            const dateStr = date.toJSON();
            const result = serializer.deserialize('', dateStr);
            expect(result).toBeInstanceOf(Date);
            expect(result.getTime()).toStrictEqual(date.getTime());
        });

        it('should deserialize Infinity', function () {
            const result = serializer.deserialize('i', serializer.serialize('i', Infinity));
            expect(result).toStrictEqual(Infinity);
        });

        it('should deserialize -Infinity', function () {
            const result = serializer.deserialize('i', serializer.serialize('i', -Infinity));
            expect(result).toStrictEqual(-Infinity);
        });

        it('should deserialize NaN', function () {
            const result = serializer.deserialize('n', serializer.serialize('n', NaN));
            expect(result).toBeNaN();
        });

        it('should deserialize NaN using JSON.parse', function () {
            const serialized = JSON.stringify(NaN, serializer.serialize);
            const deserialized = JSON.parse(serialized, serializer.deserialize);
            expect(deserialized).toBeNaN();
        });

        it("should deserialize undefined if it's an array element", function () {
            const result = serializer.deserialize(1, serializer.serialize(1, undefined));
            expect(result).toStrictEqual(undefined);
        });

        it('should return unchanged', function () {
            expect(serializer.deserialize('a', undefined)).toStrictEqual(undefined);
            expect(serializer.deserialize('a', null)).toStrictEqual(null);
            expect(serializer.deserialize('a', 1)).toStrictEqual(1);
            expect(serializer.deserialize('a', 'b')).toStrictEqual('b');

            const arr = [];
            expect(serializer.deserialize('a', arr)).toStrictEqual(arr);

            const obj = {};
            expect(serializer.deserialize('a', obj)).toStrictEqual(obj);
        });

        it('should try to create module with given name', function () {
            const Foo = getUnserializableMock();

            const sample = {
                $serialized$: 'inst',
                id: 1,
                module: 'Foo/Bar',
            };

            let lastLoaded;
            serializer.loader = function (name) {
                lastLoaded = name;
                return Foo;
            };

            const result = serializer.deserialize.call({ root: true }, '', sample);
            expect(lastLoaded).toStrictEqual('Foo/Bar');
            expect(result).toBeInstanceOf(Foo);
            expect(result.state).toStrictEqual(sample);
        });

        it('should try to create module with given name from library', function () {
            const Shmaz = getUnserializableMock();

            const sample = {
                $serialized$: 'inst',
                id: 1,
                module: 'Foo/Bar:Baz.Shmaz',
            };

            let lastLoaded: string;
            serializer.loader = function (name: string) {
                lastLoaded = name;
                return {
                    Baz: {
                        Shmaz,
                    },
                };
            };

            const result = serializer.deserialize.call({ root: true }, '', sample);
            expect(lastLoaded).toStrictEqual('Foo/Bar');
            expect(result).toBeInstanceOf(Shmaz);
            expect(result.state).toStrictEqual(sample);
        });

        it('should try to create module with given name using di', function () {
            const Foo = getUnserializableMock();

            const sample = {
                $serialized$: 'inst',
                id: 1,
                module: 'Foo/Bar',
            };

            let lastResolved: string;
            serializer.di = {
                isInstantiable: (name: string) => {
                    return name !== 'Foo/Bar';
                },
                resolve: (name: string) => {
                    lastResolved = name;
                    return Foo;
                },
            };

            const result = serializer.deserialize.call({ root: true }, '', sample);
            expect(lastResolved).toStrictEqual('Foo/Bar');
            expect(result).toBeInstanceOf(Foo);
            expect(result.state).toStrictEqual(sample);
        });

        describe('when used with JSON.parse() as reviver', function () {
            it('should work properly with deep structures', function () {
                const obj = JSON.parse(getSerializedSample(), serializer.deserialize);
                const expectObj = getSerializedObj();

                // undefined is not serializable
                delete expectObj.a;
                delete expectObj.h.ha;

                // Chrome не создает undefined элемент, хотя индекс под него зарезервирован
                obj.g[0] = undefined;

                expect(expectObj).toStrictEqual(obj);
            });

            it('should create same instances for equal serialized instances of SerializableMixin', function () {
                const modelA = new Model();
                const modelB = new Model();
                const listA = new List({
                    items: [modelA, modelB],
                });
                const listB = new List();
                const json = JSON.stringify(
                    {
                        a: modelA,
                        b: modelB,
                        c: modelA,
                        d: listA,
                        e: {
                            a: [modelB],
                            b: listA,
                            c: listB,
                            d: [listB, listA],
                        },
                    },
                    serializer.serialize
                );
                const obj = JSON.parse(json, serializer.deserialize);

                expect(obj.a).toStrictEqual(obj.c);
                expect(obj.b).toStrictEqual(obj.e.a[0]);

                expect(obj.d).toStrictEqual(obj.e.b);
                expect(obj.d).toStrictEqual(obj.e.d[1]);
                expect(obj.e.b).toStrictEqual(obj.e.d[1]);
                expect(obj.e.c).toStrictEqual(obj.e.d[0]);

                expect(obj.a).toStrictEqual(obj.d.at(0));
                expect(obj.b).toStrictEqual(obj.d.at(1));
            });

            it('should work well if state contains an object with single empty key', function () {
                const modelA = new Model();
                const modelB = new Model();
                const json = JSON.stringify(
                    {
                        a: modelA,
                        b: modelB,
                        c: {
                            '': {
                                a: modelA,
                                b: modelB,
                            },
                        },
                        d: modelA,
                    },
                    serializer.serialize
                );
                const obj = JSON.parse(json, serializer.deserialize);

                expect(obj.a).toStrictEqual(obj.c[''].a);
                expect(obj.b).toStrictEqual(obj.c[''].b);

                expect(obj.a).toBeInstanceOf(Model);
                expect(obj.b).toBeInstanceOf(Model);
                expect(obj.d).toBeInstanceOf(Model);
            });

            it('should resolve links even if objects with empty keys are presented', function () {
                const modelA = new Model();
                const modelB = new Model();
                const json = JSON.stringify(
                    {
                        a: modelA,
                        b: { '': true },
                        c: modelB,
                        d: modelA,
                    },
                    serializer.serialize
                );
                const clone = JSON.parse(json, serializer.deserialize);

                expect(clone.a).toBeInstanceOf(Model);
                // assert.deepEqual(clone.b, { '': true });
                expect(clone.b).toStrictEqual({ '': true });
                expect(clone.c).toBeInstanceOf(Model);
                expect(clone.d).toBeInstanceOf(Model);
            });
        });

        it('Server serialization', function () {
            serializer._isServerSide = true;
            const f = function () {};
            f.toJSON = function () {
                return 'isJSON';
            };

            const string = JSON.stringify(
                {
                    a: () => {},
                    b: f,
                },
                serializer.serialize
            );
            expect(string).toStrictEqual('{"b":"isJSON"}');
            serializer._isServerSide = undefined;
        });

        test('десериализация смешанных данных', () => {
            const expectObj = {
                // a: undefined, // undefined is not serializable
                // aa: undefined, // undefined is not serializable
                g: [undefined, undefined, 1, 2],
                h: {
                    // ha: undefined, // undefined is not serializable
                    // haa: undefined, // undefined is not serializable
                    hb: Infinity,
                    hbb: Infinity,
                    hc: -Infinity,
                    hcc: -Infinity,
                },
                j: NaN,
                jj: NaN,
            };
            const serialized =
                '{"a":"$u","aa":{"$serialized$":"undef"},"g":["$u",{"$serialized$":"undef"},1,2]' +
                ',"h":{"ha":"$u","haa":{"$serialized$":"undef"},"hb":"$+i","hbb":{"$serialized$":"+inf"},"hc":"$-i","hcc":{"$serialized$":"-inf"}}' +
                ',"j":"$n","jj":{"$serialized$":"NaN"}}';
            const deserialized = JSON.parse(serialized, serializer.deserialize);

            // Chrome не создает undefined элемент, хотя индекс под него зарезервирован
            deserialized.g[0] = deserialized.g[1] = undefined;

            expect(deserialized).toStrictEqual(expectObj);
        });
    });
});
