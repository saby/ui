/* eslint-disable max-classes-per-file */
/**
 * @author Krylov M.A.
 *
 * Модуль генерации конструкций JavaScript в зависимости от требуемого стандарта.
 */

import type { IECMAScriptGenerator } from '../Interface';

import { wrapString, wrapSequence } from '../types/String';

export const ECMAScript5 = 5;
export const ECMAScript2021 = 2021;

export function isValidIdentifierName(identifier: string): boolean {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/gi.test(identifier);
}

function compileTemplateLiteral(templateLiteral: string): string {
    const expression = [];
    const regex = /\${([^}]+)}/gi;

    let cursor = 0;
    let interpolation = regex.exec(templateLiteral);
    while (interpolation) {
        const string = templateLiteral.slice(cursor, interpolation.index);
        if (string.length > 0) {
            expression.push(wrapString(string));
        }

        const statement = isValidIdentifierName(interpolation[1])
            ? interpolation[1]
            : `(${interpolation[1]})`;
        expression.push(statement);

        cursor = interpolation.index + interpolation[0].length;
        interpolation = regex.exec(templateLiteral);
    }

    const tail = templateLiteral.slice(cursor);
    if (expression.length === 0 || tail.length > 0) {
        expression.push(wrapString(tail));
    }

    return expression.join(' + ');
}

function compileOptionalChaining(memberExpression: string): string {
    const parts = memberExpression.split('?.');
    const subExpressions = parts.map((_, index) => parts.slice(0, index + 1).join('.'));

    return `(${subExpressions.join(' && ')})`;
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

    toArrowFunction(body: string, params: string[] = []): string {
        return `function(${wrapSequence(params)}) { ${body} }`;
    }

    toStringInterpolation(templateLiteral: string): string {
        return compileTemplateLiteral(templateLiteral);
    }

    toOptionalChaining(memberExpression: string): string {
        return compileOptionalChaining(memberExpression);
    }

    toNullishCoalescingOperator(expression: string, value: string): string {
        return `typeof (${expression}) === "undefined" ? (${value}) : (${expression})`;
    }
}

class ES2021 extends ES5 {
    readonly version: number = ECMAScript2021;

    toArrowExpression(expression: string, params?: string[]): string {
        return `(${wrapSequence(params)}) => (${expression})`;
    }

    toArrowFunction(body: string, params: string[] = []): string {
        return `(${wrapSequence(params)}) => { ${body} }`;
    }

    toStringInterpolation(templateLiteral: string): string {
        return `\`${templateLiteral}\``;
    }

    toOptionalChaining(memberExpression: string): string {
        return `${memberExpression}`;
    }

    toNullishCoalescingOperator(expression: string, value: string): string {
        return `${expression} ?? ${value}`;
    }
}

export default function createECMAScriptGenerator(esVersion: number): IECMAScriptGenerator {
    if (esVersion === ECMAScript2021) {
        return new ES2021();
    }

    return new ES5();
}
