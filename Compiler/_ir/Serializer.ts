/**
 * Модуль, предоставляющий функции сериализации функций контентных опций в tmpl.
 *
 * @author Krylov M.A.
 */

import type { IDescription } from './builder/Interface';
import type { IRTemplateBody } from './core/IRTemplateBody';
import type { MustacheExpression } from './core/Interface';

import { IRTemplateBodyType } from './core/IRTemplateBody';

function replacer(key: string, value: unknown): unknown {
    switch (key) {
        case 'd':
            return undefined;

        case 't':
            return (value as IRTemplateBody[]).map((template): string => {
                switch (template.type) {
                    case IRTemplateBodyType.TEMPLATE:
                        return `_Compiler_IR.wrapTemplateBody("${template.name}", ${template.fn.toString()})`;

                    case IRTemplateBodyType.CONTENT:
                        if (template.name === 'content') {
                            return `_Compiler_IR.wrapContentBody(${template.fn.toString()})`;
                        }

                        return `_Compiler_IR.wrapContentBody(${template.fn.toString()}, "${template.name}")`;

                    default:
                        // IRTemplateBodyType.ROOT
                        return `_Compiler_IR.wrapRootBody(${template.fn.toString()})`;
                }
            }).filter(element => typeof element !== 'undefined');

        case 'e':
            return (value as MustacheExpression[]).map((expression): string => expression.toString());

        case 'v':
        case 'p':
        case 'i':
            return JSON.stringify(value);

        default:
            return value;
    }
}

export function serialize(description: IDescription): string {
    return JSON.stringify(description, replacer);
}
