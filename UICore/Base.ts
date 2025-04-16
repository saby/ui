/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
/**
 * Библиотека базового контрола
 * @library UICore/Base
 * @public
 * @includes Control UICore/_base/Control
 */

import { injectHook } from './_base/DevtoolsHook';

injectHook();

/**
 * Возвращаем ноду, от которой начинаем строить.
 * UIReact строит в переданном контейнере
 * @param node Element
 */
export function selectRenderDomNode(node: HTMLElement): HTMLElement {
    return node;
}

export { default as Control, IControlChildren, IControlConstructor } from './_base/Control';
export { UpdatePreventer } from './_base/UpdatePreventer';
export { default as isWasabyControl } from './_base/Control/IWasabyControl';
export { ErrorViewer } from './_base/ErrorViewer';
export { IErrorViewer, TWasabyOverReactProps } from './_base/interfaces';
export { RenderErrorDecorator } from './_base/Control/RenderErrorDecorator';
export { default as RouteCompatible } from './_base/RouteCompatible';
export { default as purifyInstance } from './_base/Control/Purifier/purifyInstance';
export { ASYNC_LOADING_TEST_INDICATOR as AsyncIndicatorName } from './_base/Control/LoaderIndicator';
export { getGeneratorConfig } from 'UICommon/Base';
export { setScrollOnBody } from './_base/IntersectionObserver';
