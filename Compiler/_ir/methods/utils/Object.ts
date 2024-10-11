/**
 * @author Krylov M.A.
 */

import type { IObject } from 'Types/entity';

import { DEFAULT_BREAKPOINTS } from 'UI/Adaptive';

function isImplementsIObject(obj: unknown): boolean {
    const type = typeof obj;

    return (
        (type === 'object' || type === 'function') && '[Types/_entity/IObject]' in (obj as object)
    );
}

/**
 * Извлекает значение по пути, ведущим вглубь объекта
 * @param obj Объект
 * @param path Путь внутри объекта
 */
export function extractValue(obj: unknown, path: string[]): unknown {
    let result: unknown = obj;
    let i: number;

    for (i = 0; i < path.length; i++) {
        if (result === undefined || result === null) {
            return undefined;
        }

        const name = path[i];
        if (isImplementsIObject(result) && (result as IObject).has(name)) {
            result = (result as IObject).get(name);
        } else if (result[name]) {
            result = result[name];
        } else if (name === 'DEFAULT_BREAKPOINTS') {
            result = DEFAULT_BREAKPOINTS;
        } else {
            // if we want get "_options" field
            // we maybe want all fields from current scope
            // It is actual for stateless wml files
            if (name !== '_options' || result[name]) {
                result = result[name];
            }
        }
    }

    if (i !== path.length) {
        throw new Error(
            `Evaluation error. Path ${path.join('.')} is not reachable`
        );
    }

    return result;
}


/**
 * Вставляет значение по пути, ведущим вглубь объекта
 * @param obj Объект
 * @param path Путь внутри объекта
 * @param value Устанавливаемое значение
 */
export function implantValue(obj: unknown, path: string[], value: unknown): boolean {
    const lastPathPart = path.pop();
    const lastObj = extractValue(obj, path);

    if (lastObj) {
        if ((lastObj as IObject).set) {
            (lastObj as IObject).set(lastPathPart, value);
        } else {
            lastObj[lastPathPart] = value;
        }
        return true;
    }

    return false;
}
