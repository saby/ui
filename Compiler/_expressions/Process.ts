/**
 * @deprecated
 * @description Represents mustache expression processing.
 */

import { createErrorHandler } from '../_utils/ErrorHandler';
import { LocalizationNode, TextNode, VariableNode } from './Statement';
import { ProgramNode } from './Nodes';
import { genEscape } from '../_codegen/Generator';
import { genSanitize } from '../_codegen/TClosure';
import { ExpressionVisitor } from '../_codegen/Expression';
import * as FSC from '../_modules/data/utils/functionStringCreator';

const EMPTY_STRING = '';
const errorHandler = createErrorHandler(true);

const tagsToReplace = {
    "'": "\\'",
    '"': '\\"',
    '\\': '\\\\',
};

const regExpToReplace = /['"\\]/g;

export function escapeQuotesInString(entity: string): string {
    return entity.replace(regExpToReplace, (tag: string) => {
        return tagsToReplace[tag] || tag;
    });
}

const regExpToReplaceInAttribute = /["\\]/g;

export function escapeQuotesInAttribute(entity: string): string {
    return entity.replace(regExpToReplaceInAttribute, (tag: string) => {
        return tagsToReplace[tag] || tag;
    });
}

const localizationRegExp = /^(\s*)(?:([\S\s]*?)\s*@@\s*)?([\S\s]*?)(\s*)$/;

interface ISplitLocalizationTextResult {
    text: string;
    context: string;
    spacesBefore: string;
    spacesAfter: string;
}
function splitLocalizationText(
    text: string,
    fileName: string
): ISplitLocalizationTextResult {
    const [match, spacesBefore, context, splitedText, spacesAfter]: string[] =
        localizationRegExp.exec(text);
    if (splitedText.indexOf('@@') !== -1) {
        errorHandler.error(
            `Ожидался только 1 @@-разделитель в конструкции локализации, в тексте "${match}" найдено больше`,
            {
                fileName,
            }
        );
    }
    return {
        text: splitedText || EMPTY_STRING,
        context: context || EMPTY_STRING,
        spacesBefore,
        spacesAfter,
    };
}

function wrapWithLocalization(data: string, fileName: string): string {
    // FIXME: строковые литералы идут сразу в кавычках.
    //  Так не должно быть! Убираем их перед разбором.
    const text = data.replace(/^"/gi, '').replace(/"$/gi, '');
    const prepared = splitLocalizationText(text, fileName);
    const context = prepared.context ? `, "${prepared.context}"` : EMPTY_STRING;
    const spacesBefore = prepared.spacesBefore
        ? `"${prepared.spacesBefore}" + `
        : EMPTY_STRING;
    const spacesAfter = prepared.spacesAfter
        ? `+ "${prepared.spacesAfter}"`
        : EMPTY_STRING;
    return `${spacesBefore}rk("${prepared.text}"${context})${spacesAfter}`;
}

function calculateResultOfExpression(
    data: any,
    escape: boolean,
    sanitize: boolean
): any {
    if (typeof data === 'string') {
        if (escape) {
            return genEscape(data);
        }
        if (sanitize) {
            return genSanitize(data);
        }
        return data;
    }
    return data;
}

function resolveExpressionValue(
    body: any,
    res: any,
    composite: boolean
): string {
    if (typeof res !== 'string') {
        return FSC.wrapAroundEntity(JSON.stringify(res));
    }
    if (
        body.expression.type === 'ObjectExpression' ||
        body.expression.type === 'ArrayExpression'
    ) {
        return FSC.wrapAroundObject(res);
    }
    if (composite) {
        return res;
    }
    return FSC.wrapAroundExec(res, true);
}

/**
 *
 * @param expressionRaw
 * @param data ???
 * @param fileName
 * @param isControl
 * @param configObject Атрибуты текущего контрола
 * @param attributeName
 * @param isAttribute
 */
export function processExpressions(
    expressionRaw: TextNode | VariableNode | LocalizationNode,
    data: any,
    fileName: string,
    isControl?: boolean,
    configObject?: any,
    attributeName?: string,
    isAttribute?: boolean
): any {
    let res;
    const esc = !(configObject && configObject.esc !== undefined);

    // FIXME: Делаем клонирование в другом месте и теряем прототип! instanceof работать не будет
    const exprAsLocalization = expressionRaw as LocalizationNode;
    const exprAsVariable = expressionRaw as VariableNode;

    const visitor = new ExpressionVisitor();

    if (exprAsLocalization.type === 'var' && exprAsLocalization.localized) {
        // экранируем двойную кавычку, чтобы она не сломала синтаксис функции
        // (строка будет обернута в двойные кавычки, а внутри этой строки будут экранированные двойные кавычки)
        res = exprAsLocalization.name
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"');
        res = FSC.wrapAroundQuotes(res);
        res = wrapWithLocalization(res, fileName);
        exprAsLocalization.value = FSC.wrapAroundExec(res, true);
        return res;
    }

    if (exprAsVariable.type === 'var') {
        if (exprAsVariable.name instanceof ProgramNode) {
            if (configObject && !isAttribute) {
                exprAsVariable.noEscape = true;
            }
            const context = {
                fileName,
                attributeName,
                isControl,
                isExprConcat: false,
                configObject: configObject || {},
                escape: esc,
                sanitize: true,
                getterContext: 'data',
                forbidComputedMembers: false,

                // TODO: есть ли необходимость в этих знаниях следующему кодогенератору???
                childrenStorage: [],
                checkChildren: false,
            };
            res = exprAsVariable.name.accept(visitor, context);
            if (!exprAsVariable.noEscape) {
                res = calculateResultOfExpression(
                    res,
                    context.escape,
                    context.sanitize
                );
            }
            exprAsVariable.value = resolveExpressionValue(
                exprAsVariable.name.body[0],
                res,
                context.configObject.composite
            );
            return res;
        } else {
            errorHandler.error('Something wrong with the expression given', {
                fileName,
            });
            return undefined;
        }
    }

    if (expressionRaw.value && isAttribute) {
        return escapeQuotesInAttribute(expressionRaw.value);
    }

    return expressionRaw.value;
}
