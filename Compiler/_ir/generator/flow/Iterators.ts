/**
 * @author Krylov M.A.
 *
 * Код перенесен из модуля
 *   UICommon/_executor/TClosure.tsx
 *   Удалить повторяющийся код, после завершения разработки!
 */

import { ObjectUtils } from 'UICommon/Utils';

export declare type Callback = (entity: unknown, key: number|string) => void;
export declare type Iterator = (collection: unknown, callback: Callback) => unknown;

interface RecordSet {
    each: Function;
}

/**
 * Коллекция поддерживаемых итераторов.
 */
const Iterators = [
    {
        type: 'recordset',
        is: function isRecordset(entity: unknown): boolean {
            return (
                entity &&
                Object.prototype.toString.call((entity as RecordSet).each) === '[object Function]'
            );
        },
        iterator: function recordsetIterator(recordset: RecordSet, callback: Callback): void {
            recordset.each(callback);
        },
    },
    {
        type: 'array',
        is: function isArray(entity: unknown): boolean {
            return entity instanceof Array;
        },
        iterator: function arrayIterator(array: unknown[], callback: Callback): void {
            for (let i = 0; i !== array.length; i++) {
                callback(array[i], i);
            }
        },
    },
    {
        type: 'object',
        is: function isObject(entity: unknown): boolean {
            return ObjectUtils.isPlainObject(entity);
        },
        iterator: function objectIterator(object: object, callback: Callback): void {
            for (const key in object) {
                if (object.hasOwnProperty(key)) {
                    callback(object[key], key);
                }
            }
        },
    },
    {
        type: 'int',
        is: function isInt(entity: unknown): boolean {
            return parseInt(entity as string, 10) === entity;
        },
        iterator: function intIterator(value: number, callback: Callback): void {
            for (let i = 0; i < value; i++) {
                callback(i, i);
            }
        },
    }
];

/**
 * Получить итератор, соответствующий данному типу сущности.
 * @param {*} entity Итерируемая сущность.
 */
export default function getIterator(entity: unknown): Iterator {
    for (const it of Iterators) {
        if (it.is(entity)) {
            return it.iterator;
        }
    }

    return undefined;
}
