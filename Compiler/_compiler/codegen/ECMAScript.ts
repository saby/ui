/* eslint-disable max-classes-per-file */

export const ECMAScript2021 = 2021;
export const ECMAScript5 = 5;

function isValidIdentifierName(identifier: string): boolean {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/gi.test(identifier);
}

function isDynamicProperty(property: string): boolean {
    return /^\[[_$a-zA-Z][_$a-zA-Z0-9]*\]$/gi.test(property);
}

function isSubstitutionString(identifier: string): boolean {
    return /^\/\*#[^#]+#\*\/$/gi.test(identifier);
}

export function createObject(object: object, isES2021: boolean): string {
    const contents = [];

    for (const property in object) {
        if (object.hasOwnProperty(property)) {
            if (isSubstitutionString(property)) {
                contents.push(property);
                continue;
            }

            const value = object[property];
            if (value === undefined) {
                continue;
            }

            if (isDynamicProperty(property)) {
                if (!isES2021) {
                    throw new Error('Dynamic object properties are not supported in ES5');
                }

                contents.push(`${property}: ${value},`);
                continue;
            }

            contents.push(`"${property}": ${value},`);
        }
    }

    return `{ ${contents.join(' ')} }`;
}

export function compileTemplateLiteral(templateLiteral: string): string {
    const expression = [];
    const regex = /\${([^}]+)}/gi;

    let cursor = 0;
    let interpolation = regex.exec(templateLiteral);
    while (interpolation) {
        const string = templateLiteral.slice(cursor, interpolation.index);
        if (string.length > 0) {
            expression.push(`"${string}"`);
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
        expression.push(`"${tail}"`);
    }

    return expression.join(' + ');
}

export function compileOptionalChaining(memberExpression: string): string {
    const parts = memberExpression.split('?.');
    const subExpressions = parts.map((_, index) => parts.slice(0, index + 1).join('.'));

    return `(${subExpressions.join(' && ')})`;
}

export abstract class Generator {
    readonly version: number;

    abstract genObject(object: object): string;
    abstract genArrowExpression(expression: string, params?: string[]): string;
    abstract genArrowFunction(body: string, params?: string[]): string;
    abstract genStringInterpolation(templateLiteral: string): string;
    abstract genOptionalChaining(memberExpression: string): string;
    abstract genNullishCoalescingOperator(expression: string, value: string): string;
    abstract genDynamicObjectProperty(property: string): string;
    abstract genDynamicObjectPropertyAccessor(object: string, property: string): string;
    abstract genDynamicObjectPropertyName(property: string): string;

    toTemplateStringExpression(expression: string): string {
        return `\${${expression}}`;
    }
}

class ES5 extends Generator {
    readonly version: number = ECMAScript5;

    genObject(object: object): string {
        return createObject(object, false);
    }

    genArrowExpression(expression: string, params: string[] = []): string {
        return `function(${params.join(',')}){ return ${expression}; }`;
    }

    genArrowFunction(body: string, params: string[] = []): string {
        return `function(${params.join(',')}){ ${body} }`;
    }

    genStringInterpolation(templateLiteral: string): string {
        return compileTemplateLiteral(templateLiteral);
    }

    genOptionalChaining(memberExpression: string): string {
        return compileOptionalChaining(memberExpression);
    }

    genNullishCoalescingOperator(expression: string, value: string): string {
        return `typeof (${expression}) === "undefined" ? (${value}) : (${expression})`;
    }

    genDynamicObjectProperty(property: string): string {
        return property;
    }

    genDynamicObjectPropertyAccessor(object: string, property: string): string {
        if (isValidIdentifierName(property)) {
            return `${object}.${property}`;
        }

        return `${object}["${property}"]`;
    }

    genDynamicObjectPropertyName(property: string): string {
        throw new Error('Dynamic object properties are not supported in ES5');
    }
}

class ES2021 extends Generator {
    readonly version: number = ECMAScript2021;

    genObject(object: object): string {
        return createObject(object, true);
    }

    genArrowExpression(expression: string, params: string[] = []): string {
        return `(${params.join(',')}) => (${expression})`;
    }

    genArrowFunction(body: string, params: string[] = []): string {
        return `(${params.join(',')}) => { ${body} }`;
    }

    genStringInterpolation(templateLiteral: string): string {
        return `\`${templateLiteral}\``;
    }

    genOptionalChaining(memberExpression: string): string {
        // return `(${memberExpression})`;
        // FIXME: В 5100 будет не es2021, а es2019. Там это не реализовано.
        //  В 6100 будет новая кодогенерация, которая не использует этот оператор.
        //  https://online.sbis.ru/opendoc.html?guid=275e9e3b-1973-44a9-af21-f922019564fd&client=3
        return compileOptionalChaining(memberExpression);
    }

    genNullishCoalescingOperator(expression: string, value: string): string {
        // return `(${expression}) ?? (${value})`;
        // FIXME: В 5100 будет не es2021, а es2019. Там это не реализовано.
        //  В 6100 будет новая кодогенерация, которая не использует этот оператор.
        //  https://online.sbis.ru/opendoc.html?guid=275e9e3b-1973-44a9-af21-f922019564fd&client=3
        return `typeof (${expression}) === "undefined" ? (${value}) : (${expression})`;
    }

    genDynamicObjectProperty(property: string): string {
        return `[${this.genDynamicObjectPropertyName(property)}]`;
    }

    genDynamicObjectPropertyAccessor(object: string, property: string): string {
        return `${object}[${this.genDynamicObjectPropertyName(property)}]`;
    }

    genDynamicObjectPropertyName(property: string): string {
        return `${property}Dynamic`;
    }
}

export function createGenerator(esVersion: number): Generator {
    if (esVersion === ECMAScript5) {
        return new ES5();
    }

    return new ES2021();
}
