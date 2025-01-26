/* eslint-disable max-classes-per-file */
/**
 * @author Krylov M.A.
 *
 * Модуль генерации конструкций JavaScript в зависимости от требуемого стандарта.
 */

import type { IECMAScriptGenerator } from '../Interface';

import { wrapSequence } from '../types/String';

export const ECMAScript5 = 5;
export const ECMAScript2021 = 2021;

export function isValidIdentifierName(identifier: string): boolean {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/gi.test(identifier);
}

class ES5 implements IECMAScriptGenerator {
    readonly version: number = ECMAScript5;

    toFunction(body: string, name: string, params: string[] = []): string {
        return `function ${name}(${wrapSequence(params)}) { ${body} }`;
    }

    toAnonymousFunction(body: string, params: string[] = []): string {
        return `function(${wrapSequence(params)}) { ${body} }`;
    }

    toArrowExpression(expression: string, params: string[] = []): string {
        return `function(${wrapSequence(params)}) { return ${expression}; }`;
    }
}

class ES2021 extends ES5 {
    readonly version: number = ECMAScript2021;

    toArrowExpression(expression: string, params: string[] = []): string {
        return `(${wrapSequence(params)}) => (${expression})`;
    }
}

export default function createECMAScriptGenerator(esVersion: number): IECMAScriptGenerator {
    if (esVersion === ECMAScript5) {
        return new ES5();
    }

    return new ES2021();
}
