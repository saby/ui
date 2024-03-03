/**
 * @kaizen_zone ab3bb41a-875b-4344-9c09-6bc14c5a22f0
 */
export * as TClosure from './_executor/TClosure';
export { createGenerator } from './_executor/TClosure';
export { htmlNode, textNode, controlNode } from './_executor/_Utils/Vdom';

/**
 * для совместимого генератора
 */
export {
    Generator as GeneratorBase,
    resolveTpl,
    resolveTemplateFunction,
    resolveTemplateArray,
    logResolverError,
} from './_executor/_Markup/Generator';
export * as MarkupUtils from './_executor/_Markup/Utils';
export { wasabyAttrsToReactDom, IWasabyAttributes } from './_executor/_Markup/Attributes';
export { CreateTagVdom, CreateTag } from './_executor/_Markup/Component';
export { GeneratorText } from './_executor/_Markup/Text/Generator';
export { GeneratorVdom } from './_executor/_Markup/Vdom/Generator';
export {
    IGeneratorAttrs,
    IControlConfig,
    TemplateResult,
    AttrToDecorate,
} from './_executor/_Markup/interfaces';

export {
    default as ReactComponentCreator,
    TJsxProps as TInternalProps,
} from './_executor/_Markup/Creator/ReactComponent';
export {
    isComponentClass,
    isForwardRef,
    isFunctionComponent,
    isReactComponentType,
    isReactElement,
} from './_executor/_Markup/Creator/ReactTypesChecker';

export { CreateChildrenRef } from './_executor/_Markup/Refs/CreateChildrenRef';
export { TimeoutHandlersQueue } from './_executor/_Markup/Refs/TimeoutHandlersQueue';
export {
    wasabyToReactAttrNames,
    reactAttrNames,
    additionalReactAttrNames,
    ATTR_STYLE,
    ATTR_DATA_REG_EXP,
} from './_executor/_Markup/wasabyToReactAttrNames';
export { mergeAttrs } from './_executor/_Utils/Attr';
