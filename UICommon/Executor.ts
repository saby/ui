export * as Attr from './_executor/_Expressions/Attr';
export { processMergeAttributes, IAttributes } from './_executor/_Expressions/Attr';
export * as AttrHelper from './_executor/_Expressions/AttrHelper';
export * as Scope from './_executor/_Expressions/Scope';

export * as OptionsResolver from './_executor/_Utils/OptionsResolver';

export { IGenerator } from './_executor/_Markup/IGenerator';
export * as _IGenerator from './_executor/_Markup/IGenerator';
export * as _IBuilder from './_executor/_Markup/IBuilder';
export * as Helper from './_executor/_Markup/Helper';

export {
    Common as CommonUtils,
    invisibleNodeTagName,
    VoidTags,
    ConfigResolver,
    Class,
} from './_executor/Utils';

export { IGeneratorComponent } from './_executor/_Markup/Component';

export { onElementMount, onElementUnmount } from './_executor/_Utils/ChildrenManager';

export * as _IGeneratorType from './_executor/_Markup/IGeneratorType';
export {
    IGeneratorConstructor,
    IGeneratorInternalProperties,
    IGeneratorDefCollection,
    IBaseAttrs,
    IGeneratorAttrsContext,
    IGeneratorNameObject,
    IGeneratorControlName,
    IGeneratorAttrs,
    IGeneratorInheritOptions,
    IGeneratorConfig,
    IConfigBase,
    IConfigCalculator,
    IConfigIterator,
    ICreateControlTemplateCfg,
    IControlData,
    IControlUserData,
    IPrepareDataForCreate,
    IControlProperties,
    IPrepareDataForCreateAttrs,
    IBuilderScope,
    ITplFunction,
    INodeAttribute,
    WsControlOrController,
    GeneratorFn,
    GeneratorVoid,
    GeneratorObject,
    GeneratorEmptyObject,
    GeneratorTemplateOrigin,
    TObject,
    TOptions,
    TScope,
    TDeps,
    TIncludedTemplate,
    TAttributes,
    TEvents,
    IControlConfig,
    TProps,
    ITemplateNode,
    IControl,
} from './_executor/_Markup/IGeneratorType';

export {
    setUnreachablePathFlag,
    callIFun,
    isolateScope,
    createScope,
    presetScope,
    uniteScope,
    createDataArray,
    filterOptions,
    calcParent,
    wrapUndef,
    getDecorators,
    Sanitize,
    iterators,
    getIterator,
    templateError,
    partialError,
    makeFunctionSerializable,
    getter,
    setter,
    plainMerge,
    plainMergeAttr,
    plainMergeContext,
    getTypeFunc,
    validateNodeKey,
    getRk,
    getContext,
    setDisableCompatForMarkupDecorator,
    getDisableCompatForMarkupDecorator,
    getIfNeedGeneratorCompatible,
    _isTClosure,
} from './_executor/TClosure';

export { fromReactProps, extendFromViewController } from './_executor/_Utils/WasabyOptions';
