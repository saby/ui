import { InternalNode, InternalNodeType } from '../core/internal/Container';
import { IProgramMeta } from '../core/internal/Storage';
import { ExpressionVisitor } from './Expression';
import { genSetUnreachablePathFlag } from './TClosure';

//# region Constants

const USE_UNREACHABLE_FLAG_FEATURE = true;
const USE_CONDITIONAL_SEQUENCE = false;

const FUNCTION_PREFIX = '__$calculateDirtyCheckingVars_';
const INTERNAL_PROPERTY_FUNCTION = '__dirtyCheckingVars_';
const COLLECTION_NAME = 'collection';
const CONDITIONAL_VARIABLE_NAME = 'condition';
const SAFE_CHECK_VARIABLE_NAME = 'safeCheck';
const CONTEXT_VARIABLE_NAME = 'data';
// FIXME: переменная funcContext неправильно вставлена в генератор кода mustache-выражения
const FUNCTION_HEAD = `var funcContext=${CONTEXT_VARIABLE_NAME};var ${COLLECTION_NAME}={};`;
const FUNCTION_TAIL = `return ${COLLECTION_NAME};`;

const SET_FLAG_CODE = `${genSetUnreachablePathFlag(COLLECTION_NAME)}`;
const RETURN_SET_FLAG_CODE = `return ${SET_FLAG_CODE};`;

//# endregion

interface IOptions {
    // Индекс родительского контейнера. Необходим для контроля межконтейнерных вычислений, чтобы проверять
    // выражение гарантированно вычислимо или нет.
    rootIndex: number;

    // Имя переменной для self-check проверок при генерации internal
    safeCheckVariable: string | null;
}

export function generate(node: InternalNode, internalFunctions: string[]): string {
    if (isEmpty(node)) {
        return '{}';
    }
    if (node.index === -1) {
        throw new Error('Произведена попытка генерации Internal-функции от скрытого узла');
    }
    const options: IOptions = {
        rootIndex: node.index,
        safeCheckVariable: null,
    };
    const functionName = FUNCTION_PREFIX + node.index;
    const body = generateFunctionBody([node], options);
    if (body === null) {
        return genSetUnreachablePathFlag('{}');
    }

    const index = node.ref.getCommittedIndex(body);
    if (index !== null) {
        return FUNCTION_PREFIX + index + `(${CONTEXT_VARIABLE_NAME})`;
    }
    try {
        const func = new Function(CONTEXT_VARIABLE_NAME, body);
        const funcString = func
            .toString()
            .replace('function anonymous', 'function ' + functionName);
        appendFunction(funcString, internalFunctions);
        node.ref.commitCode(node.index, body);
        return functionName + `(${CONTEXT_VARIABLE_NAME})`;
    } catch (error) {
        throw new Error(`Тело функции "${functionName}" невалидно: ${error.message}`);
    }
}

function generateFunctionBody(nodes: InternalNode[], options: IOptions): string {
    let content = buildAll(nodes, options);

    if (USE_UNREACHABLE_FLAG_FEATURE) {
        if (content === RETURN_SET_FLAG_CODE) {
            return null;
        }
        content = `try{${content}}catch(error){${SET_FLAG_CODE};}`;
    }

    return FUNCTION_HEAD + content + FUNCTION_TAIL;
}

function isEmpty(node: InternalNode): boolean {
    // TODO: Optimize!!!
    return node.flatten().length === 0;
}

function appendFunction(func: string, internalFunctions: string[]): void {
    const index = internalFunctions.findIndex((item: string) => {
        return func === item;
    });
    if (index > -1) {
        return;
    }
    internalFunctions.unshift(func);
}

function getCurrentConditionalIndex(node: InternalNode): number {
    if (node.type === InternalNodeType.IF) {
        return node.index;
    }
    if (node.type === InternalNodeType.BLOCK) {
        throw new Error(
            `Произведена попытка получения индекса условного узла от блока с номером ${node.index}`
        );
    }
    if (node.prev === null) {
        throw new Error(`Узел типа IF недостижим. Текущий internal узел - ${node.index}`);
    }
    return getCurrentConditionalIndex(node.prev);
}

function generateConditionalVariableName(node: InternalNode): string {
    return `${CONDITIONAL_VARIABLE_NAME}_${getCurrentConditionalIndex(node)}`;
}

function generateSafeCheckVariableName(node: InternalNode): string {
    return `${SAFE_CHECK_VARIABLE_NAME}_${getCurrentConditionalIndex(node)}`;
}

function buildWithConditions(node: InternalNode, options: IOptions): string {
    const body = buildPrograms(node.storage.getMeta(), options) + buildAll(node.children, options);
    if (node.type === InternalNodeType.BLOCK) {
        return body;
    }
    const conditionalVariable = generateConditionalVariableName(node);
    const safeCheckVariable = generateSafeCheckVariableName(node);
    if (node.type === InternalNodeType.ELSE) {
        if (body.length === 0) {
            return body;
        }
        return `if((!${safeCheckVariable})||(!${conditionalVariable})){${body}}`;
    }
    const test = buildMeta(node.test, options, true);
    const prefix = wrapProgram(node.test, conditionalVariable);
    const declareVariables = `var ${conditionalVariable};var ${safeCheckVariable} = true;`;
    const safeCheck = `(!${safeCheckVariable})`;
    const undefinedConditionalCheck = `(${safeCheckVariable}=(${safeCheckVariable}||typeof(${conditionalVariable}) === 'undefined'))`;
    const conditional = `(${conditionalVariable}=(${test}))`;
    if (node.type === InternalNodeType.IF) {
        const testExpression = `${conditional}||${safeCheck}||${undefinedConditionalCheck}`;
        return `${declareVariables}if(${testExpression}){${prefix + body}}`;
    }
    if (node.type === InternalNodeType.ELSE_IF) {
        const elseConditional = `(!${conditionalVariable})&&${conditional}`;
        const testExpression = `${safeCheck}||${elseConditional}||${safeCheck}||${undefinedConditionalCheck}`;
        return `if(${testExpression}){${prefix + body}}`;
    }
    throw new Error(`Получен неизвестный internal-узел с номером ${node.index}`);
}

function needToSetUnreachablePathFlag(node: InternalNode): boolean {
    if (!node.hasUnreachableExpressions) {
        return false;
    }
    if (node.type !== InternalNodeType.BLOCK || node.prev === null) {
        return true;
    }
    return !needToSetUnreachablePathFlag(node.prev);
}

function buildWithSequencedConditions(node: InternalNode, options: IOptions): string {
    const body = buildPrograms(node.storage.getMeta(), options) + buildAll(node.children, options);

    if (node.type === InternalNodeType.BLOCK) {
        return body;
    }
    if (node.type === InternalNodeType.ELSE) {
        if (body.length === 0) {
            return body;
        }
        return `else{${body}}`;
    }

    const conditionalVariable = generateConditionalVariableName(node);
    const conditionalVariableDeclaration = `var ${conditionalVariable};`;

    const test = buildMeta(node.test, options, true);
    const testExpression = wrapProgram(node.test, conditionalVariable);
    if (node.type === InternalNodeType.IF) {
        return (
            conditionalVariableDeclaration +
            `if(${conditionalVariable}=(${test})){${testExpression}${body}}`
        );
    }
    if (node.type === InternalNodeType.ELSE_IF) {
        return `else if(${conditionalVariable}=(${test})){${testExpression}${body}}`;
    }
    throw new Error(`Получен неизвестный internal-узел с номером ${node.index}`);
}

function buildAll(nodes: InternalNode[], options: IOptions): string {
    let body = '';
    for (let index = 0; index < nodes.length; ++index) {
        if (USE_CONDITIONAL_SEQUENCE) {
            if (needToSetUnreachablePathFlag(nodes[index])) {
                return body + RETURN_SET_FLAG_CODE;
            }
            body += buildWithSequencedConditions(nodes[index], options);
            continue;
        }
        body += buildWithConditions(nodes[index], options);
    }
    return body;
}

function buildPrograms(programs: IProgramMeta[], options: IOptions): string {
    let body = '';
    let code;
    for (let index = 0; index < programs.length; ++index) {
        code = buildMeta(programs[index], options, true);
        body += wrapProgram(programs[index], code);
    }
    return body;
}

function wrapProgram(meta: IProgramMeta, code: string): string {
    return `${COLLECTION_NAME}[${INTERNAL_PROPERTY_FUNCTION}(${meta.index})]=${code};`;
}

function buildMeta(meta: IProgramMeta, options: IOptions, useStrictGetter: boolean): string {
    const context = {
        fileName: '[[internal]]',
        attributeName: meta.name,
        isControl: false,
        isExprConcat: false,
        configObject: {},
        escape: false,
        sanitize: true,
        getterContext: CONTEXT_VARIABLE_NAME,
        forbidComputedMembers: false,
        childrenStorage: [],
        checkChildren: false,
        isDirtyChecking: true,
        useStrictGetter,
    };
    return meta.node.accept(new ExpressionVisitor(), context) as string;
}
