/**
 * @description Represents code generation methods for TClosure module.
 */

const USE_ALIASES = false;

/**
 * TClosure variable name in output source code.
 */
export const T_HELPERS_NAME = 'thelpers';

/**
 * Generate sanitize wrapper.
 * @param data {string} Data.
 */
export function genSanitize(data: string): string {
    if (USE_ALIASES) {
        // alias - S
        return `${T_HELPERS_NAME}.S/* Sanitize */.apply(undefined, [${data}])`;
    }

    // alias - S
    return `${T_HELPERS_NAME}.Sanitize.apply(undefined, [${data}])`;
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
    if (USE_ALIASES) {
        // alias - c
        return `${T_HELPERS_NAME}.c/* createDataArray */(${array}, filename, ${!!isWasabyTemplate}, isVdom)`;
    }

    // alias - c
    return `${T_HELPERS_NAME}.createDataArray(${array}, filename, ${!!isWasabyTemplate}, isVdom)`;
}

/**
 * Generate undef wrapper.
 * @param expression {string} Expression data.
 */
export function genWrapUndef(expression: string): string {
    if (USE_ALIASES) {
        // alias - w
        return `${T_HELPERS_NAME}.w/* wrapUndef */(${expression})`;
    }

    // alias - w
    return `${T_HELPERS_NAME}.wrapUndef(${expression})`;
}

/**
 * Generate ws:function wrapper.
 * @param expression {string} Expression.
 * @param data {string} Data.
 */
export function genGetTypeFunc(expression: string, data: string): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.t/* getTypeFunc */(${expression}, ${data})`;
    }

    // alias - t
    return `${T_HELPERS_NAME}.getTypeFunc(${expression}, ${data})`;
}

/**
 * Generate unite scopes.
 * @param inner {string} Inner scope.
 * @param outer {string} Outer scope.
 */
export function genUniteScope(inner: string, outer: string): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.u/*uniteScope*/(${inner}, ${outer})`;
    }

    // alias - u
    return `${T_HELPERS_NAME}.uniteScope(${inner}, ${outer})`;
}

/**
 * Get plain merge function.
 */
export function getPlainMergeFunction(): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.p/* plainMerge */`;
    }

    // alias - p
    return `${T_HELPERS_NAME}.plainMerge`;
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
    if (USE_ALIASES) {
        if (isStrict) {
            return `${T_HELPERS_NAME}.g/* getter */(${data}, [${path.join()}], collection)`;
        }
        return `${T_HELPERS_NAME}.g/* getter */(${data}, [${path.join()}])`;
    }

    // alias - g
    if (isStrict) {
        return `${T_HELPERS_NAME}.getter(${data}, [${path.join()}], collection)`;
    }
    return `${T_HELPERS_NAME}.getter(${data}, [${path.join()}])`;
}

/**
 * Generate setter.
 * @param data {string} Data object.
 * @param path {string[]} Expression path.
 */
export function genSetter(data: string, path: string[]): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.s/* setter */(${data}, [${path.join()}], value)`;
    }

    // alias - s
    return `${T_HELPERS_NAME}.setter(${data}, [${path.join()}], value)`;
}

/**
 * Generate decorator.
 * @param name {string} Decorator name.
 * @param args {string[]} Decorator arguments.
 */
export function genDecorate(name: string, args: string[]): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.d/* getDecorators */()[${name}].apply(undefined, [${args.join()}])`;
    }

    // alias - d
    return `${T_HELPERS_NAME}.getDecorators()[${name}].apply(undefined, [${args.join()}])`;
}

/**
 * Generate filter options.
 * @param options {string} Options.
 */
export function genFilterOptions(options: string): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.f/* filterOptions */(${options})`;
    }

    // alias - f
    return `${T_HELPERS_NAME}.filterOptions(${options})`;
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
    return `${T_HELPERS_NAME}.processMergeAttributes(${inner}, ${outer})`;
}

/**
 * Generate merge attributes.
 * @param inner {string} Inner attributes.
 * @param outer {string} Outer attributes.
 */
export function genPlainMergeAttr(inner: string, outer: string): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.a/* plainMergeAttr */(${inner}, ${outer})`;
    }

    // alias - a
    return `${T_HELPERS_NAME}.plainMergeAttr(${inner}, ${outer})`;
}

/**
 * Generate merge context.
 * @param inner {string} Inner context.
 * @param outer {string} Outer context.
 */
export function genPlainMergeContext(inner: string, outer: string): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.C/* plainMergeContext */(${inner}, ${outer})`;
    }

    // alias - C
    return `${T_HELPERS_NAME}.plainMergeContext(${inner}, ${outer})`;
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
    if (USE_ALIASES) {
        if (isStrict) {
            return `${T_HELPERS_NAME}.i/* callIFun */(${fn}, ${ctx}, [${args.join(
                ','
            )}], collection)`;
        }
        return `${T_HELPERS_NAME}.i/* callIFun */(${fn}, ${ctx}, [${args.join(',')}])`;
    }

    // alias - i
    if (isStrict) {
        return `${T_HELPERS_NAME}.callIFun(${fn}, ${ctx}, [${args.join(
            ','
        )}], collection)`;
    }
    return `${T_HELPERS_NAME}.callIFun(${fn}, ${ctx}, [${args.join(',')}])`;
}

/**
 * Generate setting unreachable getter path flag on.
 * @param data {string} Internal object identifier.
 */
export function genSetUnreachablePathFlag(data: string): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.F/* setUnreachablePathFlag */(${data})`;
    }

    // alias - F
    return `${T_HELPERS_NAME}.setUnreachablePathFlag(${data})`;
}

/**
 * Generate substitution for getResourceUrl function.
 * @returns {string} Function substitution.
 */
export function resolveGetResourceUrlName(): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.r/* getResourceUrl */`;
    }

    // alias - r
    return `${T_HELPERS_NAME}.getResourceUrl`;
}

/**
 * Generate substitution for _isTClosure flag.
 * @returns {string} Code fragment.
 */
export function genIsTClosure(): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.T/* _isTClosure */`;
    }

    // alias - T
    return `${T_HELPERS_NAME}._isTClosure`;
}

/**
 * Generate substitution for validateNodeKey function.
 * @returns {string} Code fragment.
 */
export function genValidateNodeKey(key: string): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.v/* validateNodeKey */(${key})`;
    }

    // alias - v
    return `${T_HELPERS_NAME}.validateNodeKey(${key})`;
}

/**
 * Generate substitution for calcParent function.
 * @returns {string} Code fragment.
 */
export function genCalcParent(obj: string, pName: string, data: string): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.G/* calcParent */(${obj}, ${pName}, ${data})`;
    }

    // alias - G
    return `${T_HELPERS_NAME}.calcParent(${obj}, ${pName}, ${data})`;
}

/**
 * Generate substitution for createScope function.
 * @returns {string} Code fragment.
 */
export function genCreateScope(scope: string): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.E/* createScope */(${scope})`;
    }

    // alias - E
    return `${T_HELPERS_NAME}.createScope(${scope})`;
}

/**
 * Generate substitution for presetScope function.
 * @returns {string} Code fragment.
 */
export function genPresetScope(): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.e/* presetScope */`;
    }

    // alias - e
    return `${T_HELPERS_NAME}.presetScope`;
}

/**
 * Generate substitution for iterators function.
 * @returns {string} Code fragment.
 */
export function genIterators(): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.R/* iterators */`;
    }

    // alias - R
    return `${T_HELPERS_NAME}.iterators`;
}

/**
 * Generate substitution for getRk function.
 * @returns {string} Code fragment.
 */
export function genGetRk(fileName: string): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.k/* getRk */(${fileName})`;
    }

    // alias - k
    return `${T_HELPERS_NAME}.getRk(${fileName})`;
}

/**
 * Generate substitution for createGenerator function.
 * @returns {string} Code fragment.
 */
export function genCreateGenerator(isVdom: string, forceCompatible: string, config: string): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.n/* createGenerator */(${isVdom}, ${forceCompatible}, ${config})`;
    }

    // alias - n
    return `${T_HELPERS_NAME}.createGenerator(${isVdom}, ${forceCompatible}, ${config})`;
}

/**
 * Generate substitution for getContext function.
 * @returns {string} Code fragment.
 */
export function genGetContext(obj: string): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.x/* getContext */(${obj})`;
    }

    // alias - x
    return `${T_HELPERS_NAME}.getContext(${obj})`;
}

/**
 * Generate substitution for templateError function.
 * @returns {string} Code fragment.
 */
export function getTemplateErrorFunctionName(): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.L/* templateError */`;
    }

    // alias - L
    return `${T_HELPERS_NAME}.templateError`;
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
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.W/* isolateScope */(${scope}, ${data}, ${propertyName})`;
    }

    // alias - W
    return `${T_HELPERS_NAME}.isolateScope(${scope}, ${data}, ${propertyName})`;
}

/**
 * Generate substitution for makeFunctionSerializable function.
 * @returns {string} Code fragment.
 */
export function genMakeFunctionSerializable(func: string, scope: string): string {
    if (USE_ALIASES) {
        return `${T_HELPERS_NAME}.z/* makeFunctionSerializable */(${func}, ${scope})`;
    }

    // alias - z
    return `${T_HELPERS_NAME}.makeFunctionSerializable(${func}, ${scope})`;
}
