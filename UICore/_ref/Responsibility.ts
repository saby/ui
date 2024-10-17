/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @kaizen_zone ce2d78ce-ad75-44f2-a211-06e89b0e061a
 */
import { ICommonDOMEnvironment as IDOMEnvironment } from 'UICommon/interfaces';
import { TWasabyEvent } from 'UICommon/Events';
import type { Control } from 'UICore/Base';

export type IResponsibilityHandler = (node: HTMLElement) => void;

export interface IResponsibility<T = any> {
    type: string;
    clearHandler?: (forClear?: unknown) => T;
    find(node: HTMLElement): T;
    getHandler(): IResponsibilityHandler;
}

export interface IControlNode {
    control: Control<any, any>;
    element: HTMLElement;
    parent: HTMLElement;
    environment: IDOMEnvironment;
    id: string;
    events: TWasabyEvent;
}

export interface IControlObj {
    control: Control<any, any>;
    id: string;
}

export abstract class Responsibility implements IResponsibility {
    abstract type: string;

    find(node: HTMLElement): HTMLElement {
        return node;
    }

    abstract getHandler(): IResponsibilityHandler;
}

export const CONTROL_NODE_HANDLER_TYPE = 'control-node';
export const CONTROL_HANDLER_TYPE = 'control';
export const ATTRIBUTES_HANDLER_TYPE = 'attributes';
export const CHILDREN_HANDLER_TYPE = 'children';
export const CLEAR_HANDLER_TYPE = 'clear';
export const EVENT_HANDLER_TYPE = 'event';
export const NOTIFY_EVENT_TYPE = 'notify';
export const FOCUS_HANDLER_TYPE = 'focus';
export const INVISIBLE_NODE_HANDLER_TYPE = 'invisible-node';
export const WHEEL_EVENT_HANDLER_TYPE = 'wheel-event';
export const ORIGIN_HANDLER_TYPE = 'origin';
