import { Text, Vdom } from './Markup';
import { Logger, isUnitTestMode } from 'UICommon/Utils';
import { Fragment, createElement } from 'react';

import {
    CommonUtils as Common,
    IGeneratorConfig,
    getDisableCompatForMarkupDecorator,
} from 'UICommon/Executor';
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';

function isCompat(forceCompatible: boolean): boolean {
    if (getDisableCompatForMarkupDecorator()) {
        return false;
    }
    return !Common.disableCompat() && (Common.isCompat() || forceCompatible);
}

let executorCompatible;
export function createGenerator(
    isVdom: boolean,
    forceCompatible: boolean = false,
    config: IGeneratorConfig
) {
    // Проблема такой проверки на совместимость кроется в Common.isCompat(), т.к. проверяется константа compat
    // которая выставялется при загруке Lib/Control/LayerCompatible/LayerCompatible
    // таким образом даже при наличии одного ws3-контрола на странице, условие всегда будет срабатывать
    const isReactWrapper = config && config.isReactWrapper === true;
    if (isCompat(forceCompatible) && !isReactWrapper) {
        if (!executorCompatible) {
            if (ModulesLoader.isLoaded('View/ExecutorCompatible')) {
                executorCompatible = ModulesLoader.loadSync(
                    'View/ExecutorCompatible'
                );
            } else {
                if (!isUnitTestMode()) {
                    Logger.warn(
                        'View/ExecutorCompatible не загружен. Проверьте загрузку слоя совместимости.'
                    );
                }
                // произошла ошибка, но чтобы страница не упала на сервере - вернем генератор без совместимости
                return isVdom ? Vdom(config) : Text(config);
            }
        }
        // todo почему должен подключаться Vdom если isVdom? там же нет совместимости. нужно подключать
        return isVdom
            ? executorCompatible.CompatibleReactVdom(config)
            : executorCompatible.CompatibleReactText(config);
    }
    return isVdom ? Vdom(config) : Text(config);
}

export function createDataArrayReact(array, templateName, isWasabyTemplate) {
    let result;
    if (array.length === 1) {
        result = array[0];
    } else {
        result = (props) => {
            return createElement(Fragment, {
                children: array.map((child) => {
                    return child(props);
                }),
            });
        };
    }
    Object.defineProperty(result, 'isDataArray', {
        value: true,
        configurable: true,
        enumerable: false,
        writable: true,
    });
    Object.defineProperty(result, 'isWasabyTemplate', {
        value: !!isWasabyTemplate,
        configurable: true,
        enumerable: false,
        writable: true,
    });
    Object.defineProperty(result, 'toString', {
        value(): string {
            Logger.templateError(
                'Использование контентной опции компонента или шаблона в качестве строки. ' +
                    'Необходимо использовать контентные опции с помощью конструкции ws:partial или ' +
                    'обратитесь в отдел Инфраструктура представления',
                templateName
            );
            return this.join('');
        },
        configurable: true,
        enumerable: false,
        writable: true,
    });

    return result;
}

export { plainMergeAttr } from './_Utils/PlainMerge';
export { processMergeAttributes } from './_Utils/Attr';
export { getResourceUrl } from 'UICommon/Utils';
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
    templateError,
    partialError,
    makeFunctionSerializable,
    getter,
    setter,
    plainMerge,
    plainMergeContext,
    getTypeFunc,
    validateNodeKey,
    getRk,
    getContext,
    _isTClosure,
} from 'UICommon/Executor';
