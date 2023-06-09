export { IGeneratorVNode, IGeneratorControlNode, TGeneratorNode } from './_executor/_Markup/Vdom/IVdomType';
export * as TClosure from './_executor/TClosure';
export { createGenerator } from './_executor/TClosure';
export {
    htmlNode,
    textNode,
    portalTagName,
    controlNode
} from './_executor/_Utils/Vdom';

/**
 * для совместимого генератора
 */
export * as Decorate from './_executor/_Expressions/Decorate';
export * as MarkupUtils from './_executor/_Markup/Utils';
export { ResolveControlName } from './_executor/_Markup/ResolveControlName';
export { Generator as GeneratorBase } from './_executor/_Markup/Generator';

export { CreateTagVdom, CreateTag } from './_executor/_Markup/Component';

export function resolveTemplateFunction(
    parent: any,
    logicParent: any,
    template: any,
    resolvedScope: any,
    decorAttribs: any,
    context: any,
    config: any
): void {
    // not use
}
export function resolveTemplateArray(
    parent: any,
    logicParent: any,
    templateArray: any,
    resolvedScope: any,
    decorAttribs: any,
    context: any,
    config: any
): void {
    // not use
}
export function logResolverError(tpl: any, parent: any): void {
    // not use
}
export { TAttributes as AttrToDecorate } from 'UICommon/Executor';
