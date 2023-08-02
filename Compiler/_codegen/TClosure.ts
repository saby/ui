/**
 * @description Represents code generation methods for TClosure module.
 */

/**
 * TClosure variable name in output source code.
 */
export const T_HELPERS_NAME = 'thelpers';

/**
 * Generate sanitize wrapper.
 * @param data {string} Data.
 */
export function genSanitize(data: string): string {
    return `${T_HELPERS_NAME}.S/* Sanitize */.apply(undefined, [${data}])`;
}

/**
 * Generate content templates array wrapper.
 * @param array {string} Content templates array.
 * @param isWasabyTemplate {string} Wml template flag.
 */
export function genCreateDataArray(
    array: string,
    isWasabyTemplate: boolean
): string {
    return `${T_HELPERS_NAME}.c/* createDataArray */(${array}, filename, ${!!isWasabyTemplate}, isVdom)`;
}

/**
 * Generate undef wrapper.
 * @param expression {string} Expression data.
 */
export function genWrapUndef(expression: string): string {
    return `${T_HELPERS_NAME}.w/* wrapUndef */(${expression})`;
}

/**
 * Generate ws:function wrapper.
 * @param expression {string} Expression.
 * @param data {string} Data.
 */
export function genGetTypeFunc(expression: string, data: string): string {
    return `${T_HELPERS_NAME}.t/* getTypeFunc */(${expression}, ${data})`;
}

/**
 * Generate unite scopes.
 * @param inner {string} Inner scope.
 * @param outer {string} Outer scope.
 */
export function genUniteScope(inner: string, outer: string): string {
    return `${T_HELPERS_NAME}.u/* uniteScope */(${inner}, ${outer})`;
}

/**
 * Get plain merge function.
 */
export function getPlainMergeFunction(): string {
    return `${T_HELPERS_NAME}.p/* plainMerge */`;
}

/**
 * Generate getter.
 * @param data {string} Data object.
 * @param path {string[]} Expression path.
 * @param isStrict {boolean} Strict flag. This method throws an exception in case of unreachable path.
 */
export function genGetter(
    data: string,
    path: string[],
    isStrict: boolean
): string {
    if (isStrict) {
        return `${T_HELPERS_NAME}.g/* getter */(${data}, [${path.join()}], collection)`;
    }
    return `${T_HELPERS_NAME}.g/* getter */(${data}, [${path.join()}])`;
}

/**
 * Generate setter.
 * @param data {string} Data object.
 * @param path {string[]} Expression path.
 */
export function genSetter(data: string, path: string[]): string {
    return `${T_HELPERS_NAME}.s/* setter */(${data}, [${path.join()}], value)`;
}

/**
 * Generate decorator.
 * @param name {string} Decorator name.
 * @param args {string[]} Decorator arguments.
 */
export function genDecorate(name: string, args: string[]): string {
    return `${T_HELPERS_NAME}.d/* getDecorators */()[${name}].apply(undefined, [${args.join()}])`;
}

/**
 * Generate filter options.
 * @param options {string} Options.
 */
export function genFilterOptions(options: string): string {
    return `${T_HELPERS_NAME}.f/* filterOptions */(${options})`;
}

/**
 * Generate merge attributes.
 * @param inner {string} Inner attributes.
 * @param outer {string} Outer attributes.
 */
export function genProcessMergeAttributes(
    inner: string,
    outer: string
): string {
    // alias - A
    return `${T_HELPERS_NAME}.A /* processMergeAttributes */(${inner}, ${outer})`;
}

/**
 * Generate merge attributes.
 * @param inner {string} Inner attributes.
 * @param outer {string} Outer attributes.
 */
export function genPlainMergeAttr(inner: string, outer: string): string {
    return `${T_HELPERS_NAME}.a/* plainMergeAttr */(${inner}, ${outer})`;
}

/**
 * Generate merge context.
 * @param inner {string} Inner context.
 * @param outer {string} Outer context.
 */
export function genPlainMergeContext(inner: string, outer: string): string {
    return `${T_HELPERS_NAME}.C/* plainMergeContext */(${inner}, ${outer})`;
}

/**
 * Generate plain merge.
 * @param inner {string} Inner object.
 * @param outer {string} Outer object.
 * @param cloneFirst {string} Special merge flag.
 */
export function genPlainMerge(
    inner: string,
    outer: string,
    cloneFirst?: string
): string {
    return `${getPlainMergeFunction()}(${inner}, ${outer}, ${cloneFirst})`;
}

/**
 * Generate internal function call.
 * @param fn {string} Function expression.
 * @param ctx {string} Function context.
 * @param args {string[]} Function arguments.
 * @param isStrict {boolean} Strict flag. This method throws an exception in case of unreachable path.
 */
export function genCallInternalFunction(
    fn: string,
    ctx: string,
    args: string[],
    isStrict: boolean
): string {
    if (isStrict) {
        return `${T_HELPERS_NAME}.i/* callIFun */(${fn}, ${ctx}, [${args.join(
            ','
        )}], collection)`;
    }

    return `${T_HELPERS_NAME}.i/* callIFun */(${fn}, ${ctx}, [${args.join(',')}])`;
}

/**
 * Generate setting unreachable getter path flag on.
 * @param data {string} Internal object identifier.
 */
export function genSetUnreachablePathFlag(data: string): string {
    return `${T_HELPERS_NAME}.F/* setUnreachablePathFlag */(${data})`;
}

/**
 * Generate substitution for getResourceUrl function.
 * @returns {string} Function substitution.
 */
export function resolveGetResourceUrlName(): string {
    return `${T_HELPERS_NAME}.r/* getResourceUrl */`;
}

/**
 * Generate substitution for _isTClosure flag.
 * @returns {string} Code fragment.
 */
export function genIsTClosure(): string {
    return `${T_HELPERS_NAME}.T/* _isTClosure */`;
}

/**
 * Generate substitution for validateNodeKey function.
 * @returns {string} Code fragment.
 */
export function genValidateNodeKey(key: string): string {
    return `${T_HELPERS_NAME}.v/* validateNodeKey */(${key})`;
}

/**
 * Generate substitution for calcParent function.
 * @returns {string} Code fragment.
 */
export function genCalcParent(obj: string, pName: string, data: string): string {
    return `${T_HELPERS_NAME}.G/* calcParent */(${obj}, ${pName}, ${data})`;
}

/**
 * Generate substitution for createScope function.
 * @returns {string} Code fragment.
 */
export function genCreateScope(scope: string): string {
    return `${T_HELPERS_NAME}.E/* createScope */(${scope})`;
}

/**
 * Generate substitution for presetScope function.
 * @returns {string} Code fragment.
 */
export function genPresetScope(): string {
    return `${T_HELPERS_NAME}.e/* presetScope */`;
}

/**
 * Generate substitution for iterators function.
 * @returns {string} Code fragment.
 */
export function genIterators(): string {
    return `${T_HELPERS_NAME}.R/* iterators */`;
}

/**
 * Generate substitution for getRk function.
 * @returns {string} Code fragment.
 */
export function genGetRk(fileName: string): string {
    return `${T_HELPERS_NAME}.k/* getRk */(${fileName})`;
}

/**
 * Generate substitution for createGenerator function.
 * @returns {string} Code fragment.
 */
export function genCreateGenerator(isVdom: string, forceCompatible: string, config: string): string {
    return `${T_HELPERS_NAME}.n/* createGenerator */(${isVdom}, ${forceCompatible}, ${config})`;
}

/**
 * Generate substitution for getContext function.
 * @returns {string} Code fragment.
 */
export function genGetContext(obj: string): string {
    return `${T_HELPERS_NAME}.x/* getContext */(${obj})`;
}

/**
 * Generate substitution for templateError function.
 * @returns {string} Code fragment.
 */
export function getTemplateErrorFunctionName(): string {
    return `${T_HELPERS_NAME}.L/* templateError */`;
}

/**
 * Generate substitution for templateError function.
 * @returns {string} Code fragment.
 */
export function genTemplateError(filename: string, error: string, data: string): string {
    return `${getTemplateErrorFunctionName()}(${filename}, ${error}, ${data})`;
}

/**
 * Generate substitution for isolateScope function.
 * @returns {string} Code fragment.
 */
export function genIsolateScope(scope: string, data: string, propertyName: string): string {
    return `${T_HELPERS_NAME}.W/* isolateScope */(${scope}, ${data}, ${propertyName})`;
}

/**
 * Generate substitution for makeFunctionSerializable function.
 * @returns {string} Code fragment.
 */
export function genMakeFunctionSerializable(func: string, scope: string): string {
    return `${T_HELPERS_NAME}.z/* makeFunctionSerializable */(${func}, ${scope})`;
}
