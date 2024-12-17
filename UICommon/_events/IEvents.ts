import {
    ICommonDOMEnvironment as IDOMEnvironment,
    IFn,
    IControl,
    IEvent,
} from 'UICommon/interfaces';

type VoidFunction = () => void;

export interface ISyntheticEvent {
    nativeEvent: Event & { stopBubbling?: boolean };
    type: string;
    target: EventTarget;
    currentTarget: EventTarget;
    stopPropagation: Function;
    isStopped: Function;
    isBubbling: Function;
    preventDefault: Function;
    propagating: Function;
    stopImmediatePropagation: Function;
    result?: unknown;
}

export interface IEventConfig {
    _bubbling?: boolean;
    type?: string;
    target?: EventTarget;
    passive?: boolean;
    capture?: boolean;
}

export interface IFixedEvent extends Event {
    _dispatchedForIE?: boolean;
}

export interface IHandlerInfo {
    handler: (evt: Event) => void;
    bodyEvent: boolean;
    processingHandler: boolean;
    count: number;
}

export interface IClickEvent {
    type: string;
    bubbles: boolean;
    cancelable: boolean;
    view: Window;
    detail: number;
    screenX: number;
    screenY: number;
    clientX: number;
    clientY: number;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    metaKey: boolean;
    button: number;
    buttons: number;
    relatedTarget: EventTarget;
    target: EventTarget;
    currentTarget: EventTarget;
    eventPhase: number;
    stopPropagation: VoidFunction;
    preventDefault: VoidFunction;
}

// TODO: удалить
export interface IWasabyEvent extends IWasabyEventBase {
    args: unknown[];
    context: Function;
    fn: IFn;
    isControl: boolean;
    viewController: IControl;
    _$environment: IWasabyEventSystem;
    bindValue?: string;
    toPartial?: boolean;
    data?: unknown;
}

export type TEventHandler = (handlerName: string) => Function;
type TBindHandler = (data: IControl, value: string) => Function;
type TViewController = IControl & {
    _destroyed: boolean;
    _mounted: boolean;
    _moduleName: string;
};

interface IEventMeta {
    isControl: boolean;
    context: Function;
    handler: TEventHandler;
}

export interface ITemplateEventBase {
    value: string;
    viewController: TViewController;
    toPartial?: boolean;
}

export interface ITemplateBindEvent extends ITemplateEventBase {
    bindValue: string;
    data: IControl;
    handler: TBindHandler;
    isControl: boolean;
}

export interface IWasabyEventBase {
    value: string;
    handler: Function;
}

// тип события в шаблонной функции
export type TTemplateEventObject = {
    meta?: IEventMeta;
} & {
    [key: string]: ITemplateEventBase[] | ITemplateBindEvent[] | Function[];
};

export type TWasabyEvent = ITemplateEventBase & {
    args: unknown[];
    context: Function;
    fn: IFn;
    _$environment: IWasabyEventSystem;
    isControl?: boolean;
    handler?: Function;
    originalName?: string;
};

export type TWasabyBind = TWasabyEvent & ITemplateBindEvent;

export type TReactEvent = Function;

// тип события после мутации в prepareEvents
export type TEventObject = TTemplateEventObject & {
    meta?: IEventMeta;
} & {
    [key: string]: TWasabyEvent[] & TWasabyBind[] & TReactEvent[];
};

export interface IWasabyEventSystem {
    captureEventHandler: (event: Event) => void;
    addCaptureEventHandler: (
        eventName: string,
        element: HTMLElement,
        isReactBody?: boolean
    ) => void;
}

export interface IEventStartArray {
    index: number;
    eventHandler: IEvent;
}

export interface IMouseEventInitExtend extends MouseEventInit {
    type: string;
    target: EventTarget;
    currentTarget: EventTarget;
    eventPhase: number;
    stopPropagation?: Function;
    preventDefault?: Function;
}
