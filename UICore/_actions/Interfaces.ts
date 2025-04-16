/**
 * Интерфейс для настройки действия
 * @public
 */
export interface IActionStartOptions {
    /**
     * Идентификатор действия
     */
    actionName: string;
    /**
     * Параметры, которые будут переданы для обработчика действия
     */
    actionProps: Record<string, unknown>;
}

export interface IParam {
    editor: string;
    editorOptions: Record<string, unknown>;
    isBindable: boolean;
    isRequired: boolean;
}
export type IParams = Record<string, IParam>;
export type IParamsValues = Record<string, unknown>;
// метаданные действия, описаны в объекте или виджете
export interface IActionConfig {
    actionPath: string[];
    actionName: string;
    title: string;
    icon: string;
    blMethod: string;
    jsMethod: string;
    isStatic: boolean;
    params: IParams;
}
