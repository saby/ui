import * as React from 'react';
import { logger } from 'Application/Env';
import type { Control } from 'UICore/Base';
import type { IControlOptions } from 'UICommon/Base';
import type { IGeneratorConfig } from 'UICommon/Executor';
import type { IControlConfig } from '../interfaces';
import { TemplateFunction } from 'UICommon/Base';
import { Logger, isDebug } from 'UICommon/Utils';
import { flattenObject } from '../Utils';
import { ITemplateAttrs } from './ReactComponent';
import type { TJsxProps as TInternalProps } from 'UICore/Jsx';

import type { TControlOptionsExtended } from 'UICommon/Vdom';
import {
    collectObjectVersions,
    collectInternalsVersions,
    getChangedOptions,
    getChangedInternals
} from 'UICommon/Vdom';

interface ITempleWrapperProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _$stateToCompareProps: any;
    generatorConfig: IGeneratorConfig;
    templateName: string;
    forwardedRef: React.ForwardedRef<HTMLElement>;
}

const canUseFunctionName = typeof Function.prototype.name === 'string';

// Профилирование работает только в развёрнутом реакте.
const isDebugReact = canUseFunctionName && React.Component.name.length > 2;

type TFields = [string, string, string, string, string, string, string];

const FIELDS_DESCRIPTION_FOR_DEBUG: TFields = [
    'logicParentInstId',
    'physicParentInstId',
    'templateParentId',
    'contentOptionName',
    'templateName',
    'key',
    'templateScopeName',
];

function getNameFields(props: ITempleWrapperProps): TFields {
    const logicParent = props._$stateToCompareProps.logicParent;
    const physicParent = props._$stateToCompareProps.physicParent;
    const templateAttributes = props._$stateToCompareProps.templateAttributes;
    const template = props._$stateToCompareProps.template;
    const resolvedScope = props._$stateToCompareProps.resolvedScope;
    const config = props._$stateToCompareProps.config;
    const key = resolvedScope.rskey + props._$stateToCompareProps._$templateKeyPostfix;
    return [
        // айди логического родителя
        logicParent?._instId || '',
        // айди физического родителя
        physicParent?._instId || '',
        // айди родительского шаблона
        templateAttributes?._$parentTemplateId || '',
        // название контентной опции, в которой вставляется шаблон (мб полезно если в релизе
        // 2 шаблона переименовались в одно сокращенное название и template.name становится бесполезен)
        config?.pName || '',
        // название шаблона
        props.templateName || '',
        // ключ переданный в сам шаблон
        key || '',
        // имя модуля, из которых шаблон был взят (если есть)
        // с переходом на ES6 могут задавать arrow function, у которой
        // prototype является undefined, для таких кейсов мы задаём _moduleName
        // на самой функции
        template.prototype?._moduleName || template._moduleName || '',
    ];
}

function TemplateWrapperChangedOptions(
    props: React.PropsWithChildren<unknown>
): React.ReactElement {
    return props.children as React.ReactElement;
}

function getChangedOptionsPrivate(_prevProps: ITempleWrapperProps, _nextProps: ITempleWrapperProps) {
    const pProps = _prevProps._$stateToCompareProps.flattenResolvedScope;
    const nextProps = _nextProps._$stateToCompareProps.resolvedScope;
    const oldOptionsVersions = _prevProps?._$stateToCompareProps.optionsVersions;

    return getChangedOptions(
        nextProps,
        pProps,
        oldOptionsVersions,
        nextProps._$blockOptionNames,
        false,
        false,
        true
    );
}

function getChangedAttributesPrivate(_prevProps: ITempleWrapperProps, _nextProps: ITempleWrapperProps) {
    const oldAttrs = _prevProps?._$stateToCompareProps.templateAttributes.attributes || {};
    const newAttrs = _nextProps._$stateToCompareProps.templateAttributes.attributes || {};

    return getChangedOptions(
        newAttrs,
        oldAttrs,
        undefined,
        undefined,
        false,
        false,
        true
    );
}

function getChangedInternalPrivate(_prevProps: ITempleWrapperProps, _nextProps: ITempleWrapperProps) {
    const oldInternal = _prevProps?._$stateToCompareProps.template.internal;
    const newInternal = _nextProps._$stateToCompareProps.template.internal;
    const oldInternalVersions = _prevProps?._$stateToCompareProps.internalVersions;

    return getChangedInternals(
        newInternal,
        oldInternal,
        oldInternalVersions,
        false,
        false,
        true
    );
}

let templateWrapperId: number = 1;

/**
 * Классовый компонент, отрисовывающий шаблон, заданный в wml.
 * Решает, когда шаблон должен перерисоваться.
 * В дебаге показывает, что именно перерисовалось.
 */
export class TemplateWrapperClass extends React.Component<ITempleWrapperProps> {
    private templateId: number = templateWrapperId++;
    private redrawReasonsForDebug?: object;

    private shouldComponentUpdateRelease(nextProps: Readonly<ITempleWrapperProps>): boolean {
        const currentNameFields = getNameFields(this.props);
        const nextNameFields = getNameFields(nextProps);
        for (let i = 0; i < currentNameFields.length; i++) {
            if (currentNameFields[i] !== nextNameFields[i]) {
                return true;
            }
        }
        const changedOptions = getChangedOptionsPrivate(this.props, nextProps);
        if (changedOptions) {
            return true;
        }
        const changedAttributes = getChangedAttributesPrivate(this.props, nextProps);
        if (changedAttributes) {
            return true;
        }
        const changedInternal = getChangedInternalPrivate(this.props, nextProps);
        if (changedInternal) {
            return true;
        }
        return false;
    }

    // ДЛЯ ОТЛАДКИ
    // вычислим причины (опции, атрибуты,...) перерисовки шаблона и положим их в props специальной обёртки,
    // чтобы они отобразились в devtools. эти значения в props не должны помешать
    private shouldComponentUpdateDebug(nextProps: Readonly<ITempleWrapperProps>): boolean {
        const redrawReasons = {};
        const currentNameFields = getNameFields(this.props);
        const nextNameFields = getNameFields(nextProps);
        let changedName: boolean = false;
        for (let i = 0; i < currentNameFields.length; i++) {
            if (currentNameFields[i] !== nextNameFields[i]) {
                redrawReasons[FIELDS_DESCRIPTION_FOR_DEBUG[i]] = Math.random();
                changedName = true;
            }
        }
        const changedOptions = getChangedOptionsPrivate(this.props, nextProps);
        if (changedOptions) {
            convertToObj('option', changedOptions, redrawReasons);
        }
        const changedAttributes = getChangedAttributesPrivate(this.props, nextProps);
        if (changedAttributes) {
            convertToObj('attribute', changedAttributes, redrawReasons);
        }
        const changedInternal = getChangedInternalPrivate(this.props, nextProps);
        if (changedInternal) {
            convertToObj('', { dirtyCheckingVars: true }, redrawReasons);
        }
        if (changedName || changedOptions || changedAttributes || changedInternal) {
            this.redrawReasonsForDebug = redrawReasons;
            return true;
        }
        return false;
    }

    shouldComponentUpdate(nextProps: Readonly<ITempleWrapperProps>): boolean {
        if (isDebug() && isDebugReact) {
            return this.shouldComponentUpdateDebug(nextProps);
        }
        return this.shouldComponentUpdateRelease(nextProps);
    }
    render(): React.ReactNode {
        const physicParent = this.props._$stateToCompareProps.physicParent;
        const logicParent = this.props._$stateToCompareProps.logicParent;
        const template = this.props._$stateToCompareProps.template;
        const resolvedScope = this.props._$stateToCompareProps.resolvedScope;
        const templateAttributes = this.props._$stateToCompareProps.templateAttributes;
        const context = this.props._$stateToCompareProps.context;
        const config = this.props._$stateToCompareProps.config;

        const generatorConfig = this.props.generatorConfig;

        templateAttributes._physicParent = physicParent;
        templateAttributes._$templateId = this.templateId;
        if (templateAttributes._isRootElement) {
            templateAttributes.refForContainer = config.attr?.refForContainer;
        }
        resolvedScope.ref = this.props.forwardedRef || resolvedScope.ref;
        resolvedScope._$templateKeyPostfix = this.props._$stateToCompareProps._$templateKeyPostfix;
        let result = template.call(
            logicParent,
            resolvedScope,
            templateAttributes,
            context,
            config.isVdom,
            undefined,
            undefined,
            generatorConfig
        );
        const isArrayResult = Array.isArray(result);
        if (
            isArrayResult &&
            !result.length &&
            templateAttributes._isRootElement &&
            !config.isNativeReact
        ) {
            const message = `
    Шаблон не построил верстку, шаблон должен построить хотя бы что-нибудь, хотя бы <invisible-node/>.
    Необходимо открыть данный шаблон и проверить, почему верстка в нем не построилась.
    Название шаблона: ${template.name}
    
    Лучше отлаживать эту проблему под дебагом, чтобы вывелись не минимизированыне имена шаблона и модуля.
    Также предоставлен список родителей начиная с родителя, где этот шаблон был физически вставлен.
    
    В крайнем случае всегда можно поставить точку останова в место, где падает ошибка, и посмотреть,
    - что это за шаблон (переменная template),
    - проверить, какие ему отдаются опции (переменная resolvedScope),
    - отладить построение верстки (template.call).
    `;
            Logger.error(message, physicParent);
            logger.error(template);
        }
        if (isArrayResult && result.length === 1) {
            result = result[0];
        }
        if (isDebug() && isDebugReact) {
            const redrawReasons = this.redrawReasonsForDebug;
            this.redrawReasonsForDebug = undefined;
            return React.createElement(TemplateWrapperChangedOptions, redrawReasons, result);
        }
        return result;
    }
}

function convertToObj(prefix: string, obj: {}, res: {} = {}): {} {
    if (!obj) {
        return res;
    }
    const keys = Object.keys(obj);
    for (const key of keys) {
        res[prefix + ' ' + key] = Math.random();
    }
    return res;
}

/**
 * Построение шаблона через React.createElement
 * @param logicParent
 * @param physicParent
 * @param template
 * @param templateWrapper
 * @param resolvedScope
 * @param templateAttributes
 * @param context
 * @param config
 * @returns
 */
export function createElementForTemplate<P = {}>(
    logicParent: Control<IControlOptions>,
    physicParent: Control<IControlOptions>,
    template: TemplateFunction | Function,
    generatorConfig: IGeneratorConfig,
    resolvedScope: P & IControlOptions & TInternalProps,
    templateAttributes: ITemplateAttrs,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: any,
    config: IControlConfig
): React.ReactElement {
    if (!canUseFunctionName) {
        // Имя функции - важная часть проверки перерисовки. Если его поддержки нет (IE) - вызовем шаблон сразу.
        templateAttributes._physicParent = physicParent;
        return template.call(
            logicParent,
            resolvedScope,
            templateAttributes,
            context,
            config.isVdom,
            undefined,
            undefined,
            generatorConfig
        );
    }

    const _$templateKeyPostfix =
        (resolvedScope._$templateKeyPostfix || '') + '_tpl' + (template.templateIndex ?? '') + '_';

    const _$stateToCompareProps = {
        logicParent,
        physicParent,
        template,
        resolvedScope,
        // храним старое значение скопировав его, чтобы биндинг в контентной опции не перезаписал старое значение.
        // если в коде есть биндинг bind:value="content.value", то событие прилетающее снизу может перезаписать в скоупе
        // content старое значение, которое закэшено в memo шаблона. И в перерисовке может уже сравниваться новое
        // значение с обновленным новым, принятие решения о перерисовке решит что нечего перерисовывать.
        flattenResolvedScope: flattenObject(resolvedScope),
        templateAttributes,
        context,
        config,
        optionsVersions: collectObjectVersions(resolvedScope as unknown as TControlOptionsExtended),
        internalVersions: collectInternalsVersions(template.internal),
        _$templateKeyPostfix,
    };
    const props = {
        _$stateToCompareProps,
        generatorConfig: { ...generatorConfig, isReactWrapper: false },
        // реакту нужны ключи для элементов, чтобы определить, какие элементы не нужно обновлять
        // если ключа не будет, shouldComponentUpdate не поможет, будет заново перестраиваться forwardRef элемент и все что внутри
        key: resolvedScope.rskey + _$templateKeyPostfix,
        // Поскольку пропадёт имя шаблона в Components, путь его будет видно на верхнем уровне props.
        templateName: template.name,
        forwardedRef: resolvedScope.ref,
    };

    return React.createElement(TemplateWrapperClass, props);
}
