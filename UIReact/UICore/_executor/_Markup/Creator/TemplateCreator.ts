import * as React from 'react';
import { logger } from 'Application/Env';
import type { Control } from 'UICore/Base';
import type { IControlOptions } from 'UICommon/Base';
import type { IGeneratorConfig } from 'UICommon/Executor';
import type {
    IControlConfig,
    TemplateResult,
    TTemplateWrapperMemo,
    TTemplateWrapper,
} from '../interfaces';
import { Options } from 'UICommon/Vdom';
import { TemplateFunction } from 'UICommon/Base';
import { Logger, isDebug } from 'UICommon/Utils';
import { flattenObject } from '../Utils';
import { ITemplateAttrs, TInternalProps } from './ReactComponent';

const debugPropsMap = new Map();
const prevProps = new Map();
const prevResolvedScope = new Map();

const canUseFunctionName = typeof Function.prototype.name === 'string';

// очищаем хранилище с версиями если шаблон удаляется из дома
function clearMaps(name: string): void {
    if (isDebug()) {
        debugPropsMap.delete(name);
    }
    prevProps.delete(name);
    prevResolvedScope.delete(name);
}

function updateMaps(name: string, props: unknown): void {
    const resolvedScope = props._$stateToCompareProps.resolvedScope;

    if (isDebug()) {
        debugPropsMap.set(name, props);
    }
    prevProps.set(name, props);

    // храним старое значение скопировав его, чтобы биндинг в контентной опции не перезаписал старое значение.
    // если в коде есть биндинг bind:value="content.value", то событие прилетающее снизу может перезаписать в скоупе
    // content старое значение, которое закэшено в memo шаблона. И в перерисовке может уже сравниваться новое
    // значение с обновленным новым, принятие решения о перерисовке решит что нечего перерисовывать.
    prevResolvedScope.set(name, flattenObject(resolvedScope));
}

/**
 * Хук компонента TemplateWrapper, отвечающий за обновление сохранённых пропсов.
 */
function useUpdateMaps(props: unknown): void {
    // Для хранения актуального имени используем useRef.
    // В нашем случае, когда один компонент на все partial, нельзя затачиваться на пропсы в анмаунт useEffect.
    const nameRef = React.useRef(null);
    const nextName = getName(props);
    if (nameRef.current !== nextName) {
        if (nameRef.current) {
            // Сменилось имя шаблона, почистим мапы по старому имени.
            clearMaps(nameRef.current);
        }
        nameRef.current = nextName;
    }

    React.useEffect(() => {
        // Маунт или обновление шаблона, обновим мапы.
        updateMaps(nameRef.current, props);
    });

    React.useEffect(() => {
        return () => {
            // Анмаунт шаблона, почистим мапы.
            clearMaps(nameRef.current);
        };
    }, []);
}

let id: number = 0;
/**
 * Хук компонента TemplateWrapper, отвечающий за уникальный айди для каждого "экземпляра".
 */
function useFunctionalComponentId(): number {
    // useRef может использоваться как аналог this у классового компонента.
    const functionalComponentId = React.useRef<number>(null);
    if (functionalComponentId.current === null) {
        // functionalComponentId.current === null только во время первого рендера.
        functionalComponentId.current = id++;
    }
    return functionalComponentId.current;
}

// строим уникальный ключ для каждого шаблона (шаблонной функции, контентной функции, inline-функции
// - любые шаблоны, каоторые вставляются через ws:partial)
function getName(props): string {
    const logicParent = props._$stateToCompareProps.logicParent;
    const physicParent = props._$stateToCompareProps.physicParent;
    const templateAttributes = props._$stateToCompareProps.templateAttributes;
    const template = props._$stateToCompareProps.template;
    const resolvedScope = props._$stateToCompareProps.resolvedScope;
    const config = props._$stateToCompareProps.config;
    const key =
        resolvedScope.rskey + props._$stateToCompareProps._$templateKeyPostfix;
    return (
        '' +
        logicParent?._instId + // айди логического родителя
        ' ' +
        physicParent?._instId + // айди физического родителя
        ' ' +
        (templateAttributes?._$parentTemplateId || '_') + // айди родительского шаблона
        // название контентной опции, в которой вставляется шаблон (мб полезно если в релизе
        ' ' +
        (config?.pName || '_') +
        // 2 шаблона переименовались в одно сокращенное название и template.name становится бесполезен)
        ' ' +
        template.name + // название шаблона
        ' ' +
        key + // ключ переданный в сам шаблон
        ' ' +
        (template.prototype?._moduleName || '_')
    ); // имя модуля, из которых шаблон был взят (если есть)
}

function getChangedOptions(_prevProps, _nextProps, name) {
    const pProps = prevResolvedScope.get(name);
    const nextProps = _nextProps._$stateToCompareProps.resolvedScope;
    const oldOptionsVersions =
        _prevProps?._$stateToCompareProps.optionsVersions;

    return Options.getChangedOptions(
        pProps,
        nextProps,
        false,
        oldOptionsVersions,
        true,
        undefined,
        undefined,
        nextProps._$blockOptionNames,
        true
    );
}
function getChangedAttributes(_prevProps, _nextProps) {
    const oldAttrs =
        _prevProps?._$stateToCompareProps.templateAttributes.attributes || {};
    const newAttrs =
        _nextProps._$stateToCompareProps.templateAttributes.attributes || {};
    return Options.getChangedOptions(
        newAttrs,
        oldAttrs,
        false,
        {},
        true,
        undefined,
        undefined,
        undefined,
        true
    );
}
function getChangedInternal(_prevProps, _nextProps) {
    const oldInternal =
        _prevProps?._$stateToCompareProps.template.internal || {};
    const newInternal =
        _nextProps._$stateToCompareProps.template.internal || {};
    const oldInternalVersions =
        _prevProps?._$stateToCompareProps.internalVersions;
    return Options.getChangedOptions(
        newInternal,
        oldInternal,
        false,
        oldInternalVersions,
        true,
        undefined,
        undefined,
        undefined,
        true
    );
}

function isActualMemo(_prevProps, _nextProps, _prevName, _nextName): boolean {
    // При попытке вставить шаблон на место другого шаблона будем говорить реакту,
    // что это обновление, а не удаление старого и маунт нового.
    if (_prevName !== _nextName) {
        // если что-то есть - возвращаем false. это значит, что перерисовка должна быть.
        return false;
    }

    const changedOptions = getChangedOptions(_prevProps, _nextProps, _nextName);
    if (changedOptions) {
        // если что-то есть - возвращаем false. это значит, что перерисовка должна быть.
        return false;
    }

    const changedAttributes = getChangedAttributes(_prevProps, _nextProps);
    if (changedAttributes) {
        // если что-то есть - возвращаем false. это значит, что перерисовка должна быть.
        return false;
    }

    const changedInternal = getChangedInternal(_prevProps, _nextProps);
    if (changedInternal) {
        // если что-то есть - возвращаем false. это значит, что перерисовка должна быть.
        return false;
    }

    // перерисовки не должно быть
    return true;
}

/**
 * Функцианальный компонент, отрисовывающий шаблон, заданный в wml.
 * @param props TODO описать интерфейс для props такого компонента
 * @param ref
 * @returns
 */
const TemplateWrapperVar: TTemplateWrapper = function TemplateWrapper(
    props,
    ref
): TemplateResult {
    const physicParent = props._$stateToCompareProps.physicParent;
    const logicParent = props._$stateToCompareProps.logicParent;
    const template = props._$stateToCompareProps.template;
    const resolvedScope = props._$stateToCompareProps.resolvedScope;
    const templateAttributes = props._$stateToCompareProps.templateAttributes;
    const context = props._$stateToCompareProps.context;
    const config = props._$stateToCompareProps.config;

    useUpdateMaps(props);
    const generatorConfig = props._$ignoreCompareProps.generatorConfig;

    templateAttributes._physicParent = physicParent;
    templateAttributes._$templateId = useFunctionalComponentId();
    if (templateAttributes._isRootElement) {
        templateAttributes.refForContainer = config.attr?.refForContainer;
    }
    resolvedScope.ref = ref || resolvedScope.ref;
    resolvedScope._$templateKeyPostfix =
        props._$stateToCompareProps._$templateKeyPostfix;
    const result = template.call(
        logicParent,
        resolvedScope,
        templateAttributes,
        context,
        config.isVdom,
        undefined,
        undefined,
        generatorConfig
    );
    if (
        Array.isArray(result) &&
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
    return result;
};

/**
 * Фунция сравнения props для memo.
 */
export function areEqualTemplateWrapperProps(
    _prevReactProps,
    _nextProps
): boolean {
    const _nextName = getName(_nextProps);
    const _prevProps = prevProps.get(_nextName);

    const _prevName = getName(_prevReactProps);

    const res = isActualMemo(_prevProps, _nextProps, _prevName, _nextName);

    return res;
}

/**
 * Мемо для компонента TemplateWrapper, чтобы перерисовка была при изменении шаблона или его данных.
 */
const TemplateWrapperMemo: TTemplateWrapperMemo = React.memo(
    React.forwardRef(TemplateWrapperVar),
    areEqualTemplateWrapperProps
);

function convertToObj(prefix: string, obj: {}): {} {
    const res = {};
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
        (resolvedScope._$templateKeyPostfix || '') +
        '_tpl' +
        (template.templateIndex ?? '') +
        '_';

    const _$stateToCompareProps = {
        logicParent,
        physicParent,
        template,
        resolvedScope,
        templateAttributes,
        context,
        config,
        optionsVersions: Options.collectObjectVersions(resolvedScope),
        internalVersions: Options.collectObjectVersions(
            template.internal || {}
        ),
        _$templateKeyPostfix,
    };
    const _$ignoreCompareProps = {
        generatorConfig: { ...generatorConfig, isReactWrapper: false },
    };
    let props = {
        _$stateToCompareProps,
        _$ignoreCompareProps,
        // реакту нужны ключи для элементов, чтобы определить, какие элементы не нужно обновлять
        // если ключа не будет, react.memo не поможет, будет заново перестраиваться forwardRef элемент и все что внутри
        key: resolvedScope.rskey + _$templateKeyPostfix,
        // Поскольку пропадёт имя шаблона в Components, путь его будет видно на верхнем уровне props.
        templateName: template.name,
        ref: resolvedScope.ref,
    };

    // ДЛЯ ОТЛАДКИ
    // вычислим причины (опции, атрибуты,...) перерисовки шаблона и положим их в props чтобы они отобразились в devtools
    // эти значения в props не должны помешать,
    // потому что для принятия решения о перерисовке используется только _$stateToCompareProps
    if (isDebug()) {
        const name = getName(props);
        const _prevProps = debugPropsMap.get(name);
        const changedOptions = getChangedOptions(_prevProps, props, name);
        const changedAttributes = getChangedAttributes(_prevProps, props);
        const changedInternal = getChangedInternal(_prevProps, props);
        props = {
            ...convertToObj('option', changedOptions),
            ...convertToObj('attribute', changedAttributes),
            ...(changedInternal ? { dirtyCheckingVars: Math.random() } : {}),
            ...props,
        };
    }

    return React.createElement(TemplateWrapperMemo, props);
}
