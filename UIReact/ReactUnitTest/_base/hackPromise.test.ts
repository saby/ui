import { _hackPromise } from 'UICore/_base/Control/hackPromise';

describe('UICore/_base/Control/hackPromise', () => {
    let GlobalPromise;
    before(() => {
        GlobalPromise = globalThis.Promise;
        _hackPromise();
    });

    after(() => {
        globalThis.Promise = GlobalPromise;
    });

    test('async function returns new Promise', async () => {
        const data = 'data';
        const asyncFn = async () => {
            return new Promise((resolve) => {
                resolve(data);
            });
        };
        const checkRes = asyncFn();

        expect(checkRes).toHaveProperty('resolvedObj');
        expect(checkRes.resolvedObj).toEqual({ state: 'pending' }); // Promise д.б. в статусе выполнения

        await checkRes.then((res) => {
            expect(res).toBe(data);
        });
    });

    test('async function returns data', async () => {
        const data = 'data';
        const asyncFn = async () => {
            return data;
        };
        const checkRes = asyncFn();

        expect(checkRes).toHaveProperty('resolvedObj');
        expect(checkRes.resolvedObj).toEqual({ state: 'fulfilled' }); // Promise д.б. выполненный

        await checkRes.then((res) => {
            expect(res).toBe(data);
        });
    });

    test('function returns Promise.resolve', () => {
        const data = 'data';
        const fn = () => {
            return Promise.resolve(data);
        };
        const checkRes = fn();

        expect(checkRes).toHaveProperty('resolvedObj');
        expect(checkRes.resolvedObj).toEqual({ state: 'fulfilled' }); // Promise д.б. выполненный
    });

    test('async function returns new Promise, call reject', async () => {
        const data = 'data';
        const asyncFn = async () => {
            return new Promise((resolve, reject) => {
                reject(data);
            });
        };
        const checkRes = asyncFn();

        expect(checkRes).toHaveProperty('resolvedObj');
        expect(checkRes.resolvedObj).toEqual({ state: 'pending' }); // Promise д.б. в статусе выполнения

        await checkRes.catch((res) => {
            expect(res).toBe(data);
        });
    });

    test('async function fails', async () => {
        const data = 'data';
        const asyncFn = async () => {
            throw Error(data);
        };
        const checkRes = asyncFn();

        expect(checkRes).toHaveProperty('resolvedObj');
        expect(checkRes.resolvedObj).toEqual({ state: 'rejected' }); // Promise д.б. отмененным

        await checkRes.catch((err) => {
            expect(err.message).toBe(data);
        });
    });

    test('function returns Promise.reject', async () => {
        const data = 'data';
        const fn = () => {
            return Promise.reject(data);
        };
        const checkRes = fn();

        expect(checkRes).toHaveProperty('resolvedObj');
        expect(checkRes.resolvedObj).toEqual({ state: 'rejected' });
    });
});
