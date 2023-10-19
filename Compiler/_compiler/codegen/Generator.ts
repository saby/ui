/**
 * @description Represents code generation methods for markup generator.
 */

import { Generator } from './ECMAScript';

/**
 * Markup generator variable name in output source code.
 */
const VAR_MODULE_NAME = 'markupGenerator';

/**
 * Generate escape call.
 * @param data {string} Data.
 */
export function genEscape(data: string): string {
    return `${VAR_MODULE_NAME}.escape(${data})`;
}

/**
 * Generate create text node.
 * @param data {string} Data.
 * @param keyExpression {string} Node key.
 */
export function genCreateText(data: string = "''", keyExpression?: string): string {
    if (keyExpression === undefined) {
        return `${VAR_MODULE_NAME}.createText(${data})`;
    }
    return `${VAR_MODULE_NAME}.createText(${data}, ${keyExpression})`;
}

/**
 * Generate create directive.
 * @param data {string} Data.
 */
export function genCreateDirective(data: string): string {
    return `${VAR_MODULE_NAME}.createDirective(${data})`;
}

/**
 * Generate create comment.
 * @param data {string} Data.
 */
export function genCreateComment(data: string = ''): string {
    return `${VAR_MODULE_NAME}.createComment(${data})`;
}

/**
 * Generate create tag.
 * @param name {string} Tag name.
 * @param data {string} Complex attributes object.
 * @param children {string} Children collection.
 * @param attributes {string} Complex attributes object.
 * @param isContainerNode {boolean} Container node flag.
 * @param generator Генератор JavaScript кода.
 */
export function genCreateTag(
    name: string,
    data: string,
    children: string,
    attributes: string,
    isContainerNode: boolean,
    generator: Generator
): string {
    return `${VAR_MODULE_NAME}.createTag(${name}, ${data}, [${children}], ${attributes}, defCollection, viewController, ${
        isContainerNode ? generator.genOptionalChaining('attr?.isControlTemplate') : 'false'
    })`;
}

/**
 * Generate get scope object.
 * @param expression {string} Scope expression.
 */
export function genGetScope(expression: string): string {
    return `${VAR_MODULE_NAME}.getScope(${expression})`;
}

/**
 * Generate prepare data for create.
 * @param tpl {string} Template.
 * @param scope {string} Scope object.
 * @param attributes {string} Current attributes.
 * @param deps {string} Dependencies collection.
 */
export function genPrepareDataForCreate(
    tpl: string,
    scope: string,
    attributes: string,
    deps: string
): string {
    return `${VAR_MODULE_NAME}.prepareDataForCreate(${tpl}, ${scope}, ${attributes}, ${deps})`;
}

/**
 * Generate create control
 * @param type {string} Component type
 * @param nameDescription {string} Component description
 * @param method {string} Component constructor or template
 * @param attributes {string} Attributes collection
 * @param events {string} Events collection
 * @param options {string} Options collection
 * @param config {string} Config
 *
 */
export function genCreateControlNew(
    type: string,
    nameDescription: string,
    method: string,
    attributes: string,
    events: string,
    options: string,
    config: string
): string {
    // createControlNew(type, method, attributes, events, options, config)
    return (
        `${VAR_MODULE_NAME}.createControlNew(` +
        `"${type}",` +
        `/*${nameDescription}*/ ${method},` +
        `/*attributes*/ ${attributes},` +
        `/*events*/ ${events},` +
        `/*options*/ ${options},` +
        `/*config*/ ${config}` +
        ')'
    );
}
