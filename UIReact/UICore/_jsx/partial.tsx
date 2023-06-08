/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import type { IControlOptions } from 'UICommon/Base';
import { prepareAttrsForPartial } from 'UICommon/Base';
import { _FocusAttrs } from 'UICommon/Focus';
import type { Attr } from 'UICommon/Executor';
import type { Control } from 'UICore/Base';
import type { TTemplateEventObject } from 'UICore/Events';
import type { TInternalProps } from 'UICore/Executor';
import { resolveEventName } from 'UICore/Events';
import { GeneratorVdom } from 'UICore/Executor';
import { getWasabyContext, IWasabyContextValue } from 'UICore/Contexts';
import { ChildrenAsContent } from './ChildrenAsContent';

let REACT_GENERATOR: GeneratorVdom;
const DEFAULT_FOCUS_ATTRS = _FocusAttrs.returnSingletonFocusAttrs();

type TControlConstructor = {
    // eslint-disable-next-line @typescript-eslint/prefer-function-type
    new (props?: any, context?: any): Control<any, any>;
};

export type IComponent =
    | React.ComponentClass<any, any>
    | React.FunctionComponent<any>
    | TControlConstructor
    | any;

/**
 * <b>React hook!</b>
 * Создание { Jxs.Element } из props.
 * Не поддерживает ws3-совместимые контролы.
 * @param component wml template или React.Component
 * @param props
 * @param attrs атрибуты, которые нобходимо повесить на кмопонент. <b>Объект летит непосредственно в props</b>
 * @param events
 * @param context legacy wasaby контест, которым пользуются Controls
 * @param reactContext react context. Который содержит типичные свойства для wasaby приложений.
 * @example
 * Если для васаби контрола надо передать какие-то кастомные события, их следует передать в пропе customEvents
 * <pre>
 *    function ReactControl(props: TJsxProps<any>): JSX.Element {
 *         const myHandler = React.useCallback(function() {
 *             // some code
 *         }, []);
 *         return <div>
 *              <WasabyControl customEvents={{onMyEvent: myHandler}} />
 *         </div>;
 *    }
 * </pre>
 */
export function useElement<R = JSX.Element>(
    component: IComponent,
    props: IControlOptions & TInternalProps = {},
    attrs: Attr.IAttributes = DEFAULT_FOCUS_ATTRS,
    events: TTemplateEventObject = {},
    context?: Record<string, unknown>,
    reactContext?: IWasabyContextValue
): R {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const wasabyContext = reactContext ?? React.useContext(getWasabyContext());

    let refForContainer: React.Ref<any>;
    // старый способ прокидывания Wasaby-рефов
    if (props.$wasabyRef) {
        refForContainer = props.$wasabyRef;
        // приводим в новый формат перенаправления рефа
        // и удаляем $wasabyRef, чтобы дальше работать только "по-новому"
        props.forwardedRef = props.$wasabyRef;
        delete props.$wasabyRef;
    } else if (props.forwardedRef) {
        refForContainer = props.forwardedRef;
    }

    // props.readOnly может быть false.
    props.readOnly = props.readOnly ?? wasabyContext.readOnly;

    if (!props.theme) {
        props.theme = wasabyContext.theme;
    }

    if (!props.Router) {
        props.Router = wasabyContext.Router;
    }

    props.isAdaptive = props.isAdaptive ?? wasabyContext.isAdaptive;

    if (!props.adaptiveMode) {
        props.adaptiveMode = wasabyContext.adaptiveMode;
    }

    /* {
    attr: attr,
    data: data,
    ctx: this,
    isVdom: isVdom,
    defCollection: defCollection,
    depsLocal: typeof depsLocal !== 'undefined' ? depsLocal : {},
    includedTemplates: includedTemplates,
    viewController: viewController,
    context: isVdom ? context + "part_" + (templateCount++) : context,
    key: key + "0_0_1_0_1_0_",
    internal: isVdom ? {} : {},
    mergeType: "none",
    } */
    const templateConfig = {
        depsLocal: {},
        viewController: wasabyContext._logicParent,
        includedTemplates: {},
        data: {},
        isVdom: true,
        isNativeReact: true,
        attr: {
            attributes: DEFAULT_FOCUS_ATTRS,
            events: {},
            key: null,
            context,
            _isRootElement: true,
            refForContainer,
            _physicParent: wasabyContext._physicParent,
        },
        key: undefined,
    };

    resolveEventName(events);

    if (!props._$key) {
        templateConfig.key =
            wasabyContext._parentKey +
            (typeof props.key !== 'undefined' ? props.key : '_el_');
    }

    if (
        React.isValidElement(props.children) &&
        (!props.content || props.content.isChildrenAsContent)
    ) {
        props.content = ChildrenAsContent;
    }

    if (!REACT_GENERATOR) {
        REACT_GENERATOR = new GeneratorVdom({
            isReactWrapper: true,
            prepareAttrsForPartial,
        });
    }
    return REACT_GENERATOR.createControlNew<R>(
        'template',
        component,
        attrs,
        events,
        props,
        templateConfig
    );
}
