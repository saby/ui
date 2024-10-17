/**
 * @author Krylov M.A.
 */

import type { ISource, IMustacheMeta, IFlags } from './mustache/Interface';
import type { IEventMeta } from './mustache/Event';
import type { IExpressionOptions, IExpressionMeta } from './mustache/Expression';
import type { IBindingConfiguration } from './mustache/Decorators';

import BindGenerator from './mustache/Bind';
import EventGenerator from './mustache/Event';
import ExpressionGenerator from './mustache/Expression';

export type {
    IFlags,
    ISource,
    IMustacheMeta,
    IExpressionOptions,
    IBindingConfiguration
};
export declare type TBindMeta = IExpressionMeta<string>;
export declare type TEventMeta = IEventMeta<string>;
export declare type TExpressionMeta = IExpressionMeta<string>;

export {
    BindGenerator,
    EventGenerator,
    ExpressionGenerator
};
