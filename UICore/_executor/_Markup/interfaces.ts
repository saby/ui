/**
 * @kaizen_zone a35eec2e-f16e-4783-9297-975d0fadc26b
 */
import { Control } from 'UICore/Base';
import { TemplateFunction } from 'UICommon/Base';
import * as React from 'react';
import { IWasabyContextValue } from 'UICore/Contexts';
import { CommonUtils as Common, Attr, IGeneratorNameObject, ITplFunction } from 'UICommon/Executor';
import { TWasabyEvent, TEventObject } from 'UICore/Events';

/*
    FIXME: как я понимаю, в этом объекте могут быть HTMl-атрибуты+какие-то наши поля.
 */
export interface IGeneratorAttrs {
    attributes: Attr.IAttributes;
    events: Record<string, TWasabyEvent[]>;
    _physicParent?: Control<unknown, unknown>;
    _$parentTemplateId?: number;
    _$templateId?: number;
    key: string;
    context?: Record<string, unknown>;
    reactEvent?: Record<string, Function>;
    isReactWrapper?: true;
}

export interface IControlConfig {
    depsLocal: Common.Deps<typeof Control, TemplateFunction>;
    viewController: Control<unknown, unknown>;
    includedTemplates: Common.IncludedTemplates<TemplateFunction>;
    compositeAttributes?: Attr.IAttributes;
    data: any;
    isVdom: boolean;
    mergeType?: 'attribute' | 'context' | 'none';
    attr: IGeneratorAttrs;
    blockOptionNames?: string[];
    isNativeReact: boolean;
    unitedScope?: boolean;
}

export type TemplateResult = React.FunctionComponentElement<
    Partial<IWasabyContextValue> & { children?: React.ReactNode }
>;

export type TTemplateWrapper = React.ForwardRefRenderFunction<unknown>;
export type TTemplateWrapperMemo = React.MemoExoticComponent<
    React.ForwardRefExoticComponent<unknown>
>;

export type AttrToDecorate = {
    attributes: Attr.IAttributes;
    events: TEventObject;
    reactEvent: Record<string, Function>;
};

/**
 * Либо сам шаблон/конструктор контрола, либо строка, по которой его можно получить.
 */
export type TemplateOrigin =
    | Common.IDefaultExport<typeof Control>
    | TemplateFunction
    | ITplFunction<TemplateFunction>
    | IGeneratorNameObject
    | typeof Control
    | string
    | Function
    | Common.ITemplateArray<TemplateFunction>;
