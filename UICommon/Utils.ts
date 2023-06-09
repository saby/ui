/// <amd-module name='UICommon/Utils' />

/**
 * Библиотека служебных утилит для работы с UI Wasaby
 * @library UICommon/Utils
 * @includes Logger UICommon/_utils/Logger
 * @includes Purifier UICommon/_utils/Purifier
 * @author Шипин А.А.
 */

import * as Logger from './_utils/Logger';
import * as Purifier from './_utils/Purifier';
import isNewEnvironment from './_utils/IsNewEnvironment';
import needToBeCompatible from './_utils/NeedToBeCompatible';
import getResourceUrl from './_utils/GetResourceUrl';
import isElementVisible from './_utils/IsElementVisible';
import getSvgParentNode from './_utils/GetSvgParentNode';

import merge from './_utils/Function/Merge';
import shallowClone from './_utils/Function/ShallowClone';
const FunctionUtils = {
   merge,
   shallowClone
};

import isPlainObject from './_utils/Object/IsPlainObject';
import isEmpty from './_utils/Object/IsEmpty';
const ObjectUtils = {
   isPlainObject,
   isEmpty
};

import randomId from './_utils/Number/RandomId';
const NumberUtils = {
   randomId
};

import flatten from './_utils/Array/Flatten';
import findIndex from './_utils/Array/FindIndex';
import uniq from './_utils/Array/Uniq';
const ArrayUtils = {
   flatten,
   findIndex,
   uniq
};

export {
   Logger,
   Purifier,
   isNewEnvironment,
   needToBeCompatible,
   getResourceUrl,
   isElementVisible,
   getSvgParentNode,
   FunctionUtils,
   ObjectUtils,
   NumberUtils,
   ArrayUtils
};
