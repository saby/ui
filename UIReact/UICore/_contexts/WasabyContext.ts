import { Context, createContext } from 'react';
import type { Control } from 'UICore/Base';

export interface IWasabyContextValue {
    readOnly: boolean;
    theme: string;
    _physicParent?: Control<unknown, unknown>;
    _logicParent?: Control<unknown, unknown>;
    _parentKey?: string | undefined;
    pageData?: any;
    Router?: any;
    isAdaptive?: boolean;
    moduleName?: string;
    isScrollOnBody?: boolean;
    workByKeyboard?: boolean;
}

export type TWasabyContext = Context<IWasabyContextValue>;

const defaultValue: IWasabyContextValue = {
    readOnly: false,
    theme: 'default',
    _physicParent: undefined,
    _logicParent: undefined,
    _parentKey: undefined,
    pageData: undefined,
    Router: undefined,
    isAdaptive: undefined,
    isScrollOnBody: undefined,
    adaptiveMode: undefined,
    workByKeyboard: undefined
};
/*
TODO: создание контекста должно происходить не при загрузке модуля, а в точке старта приложения,
но пока у нас нет для реакта нормальной точки старта.
 */
const wasabyContext: TWasabyContext = createContext(defaultValue);

/**
 * Возвращает инстанс контекста совместимости. Должно использоваться только в контроле совместимости,
 * все остальные места должны работать через соответствующие HOC'и или хуки.
 */
export function getWasabyContext(): TWasabyContext {
    return wasabyContext;
}
