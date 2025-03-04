/**
 * Библиотека служебных утилит для работы с UI Wasaby
 * @library UICommon/Utils
 * @public
 * @includes Logger UICommon/_utils/Logger
 */

export * as Logger from './_utils/Logger';
import isNewEnvironment from './_utils/IsNewEnvironment';
export { default as getResourceUrl } from './_utils/GetResourceUrl';
export { default as escapeHtml } from './_utils/escapeHtml';
import isElementVisible from './_utils/IsElementVisible';
import getSvgParentNode from './_utils/GetSvgParentNode';

import merge from './_utils/Function/Merge';
import shallowClone from './_utils/Function/ShallowClone';
const FunctionUtils = {
    merge,
    shallowClone,
};

import isPlainObject from './_utils/Object/IsPlainObject';
import isEmpty from './_utils/Object/IsEmpty';
import getKeysWithPrototypes from './_utils/Object/getKeysWithPrototypes';
const ObjectUtils = {
    isPlainObject,
    isEmpty,
    getKeysWithPrototypes,
};

import flatten from './_utils/Array/Flatten';
import findIndex from './_utils/Array/FindIndex';
import uniq from './_utils/Array/Uniq';
export { default as needToBeCompatible } from './_utils/NeedToBeCompatible';
export const ArrayUtils = {
    flatten,
    findIndex,
    uniq,
};

export { isUnitTestMode } from './_utils/isUnitTestMode';
export { isDebug, gets3debug } from './_utils/IsDebug';
export { jsEscape } from './_utils/jsEscape';
export { isNewEnvironment, isElementVisible, getSvgParentNode, FunctionUtils, ObjectUtils };
