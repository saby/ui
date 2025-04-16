/**
 * @kaizen_zone ce2d78ce-ad75-44f2-a211-06e89b0e061a
 */
/**
 * Модуль для обеспечения wasaby функциональности в чистых react компонентах
 * @library
 * @public
 */
export { useTheme, useReadonly } from 'UICore/Contexts';
export { wasabyAttrsToReactDom } from 'UICore/Executor';
export { useContent, calcUseMemoProps, convertContentToElement } from './_jsx/contentOption';
export { logExecutionTimeBegin, logExecutionTimeEnd } from './_jsx/logExecTime';
export { useElement as createElement, DEFAULT_REACT_RSKEY_ENDING } from './_jsx/partial';
export { delimitProps, clearEvent, TInternalProps as TJsxProps } from './_jsx/props';
import './_jsx/runtime';
