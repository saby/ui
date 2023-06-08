export type ISerializedMetaStack = string;
export type ISerializedMetaState = string;

/**
 * Хранилище состояний meta-тегов
 * @interface UI/Base:IMetaStack
 * @public
 */
export interface IMetaStack {
    /**
     * Добавить состояние
     * @param {IMeta} meta
     * @returns {IMetaState}
     * @example
     * <pre class="brush: js">
     * import { getMetaStack } from 'UI/Base';
     * const meta: IMeta = { title: 'Page title' }
     * const state: IMetaState = getMetaStack().push(meta);
     * </pre>
     */
    push(meta: IMeta): IMetaState;
    /**
     * Удалить состояние
     * @param {IMetaState} state
     * @example
     * <pre class="brush: js">
     * import { getMetaStack } from 'UI/Base';
     * const meta: IMeta = { title: 'Page title' }
     * const stack: IMetaStack = getMetaStack();
     * const state: IMetaState = stack.push(meta);
     *  ...
     * stack.remove(state);
     * </pre>
     */
    remove(state: IMetaState): void;
}
export interface IMetaStackInternal extends IMetaStack {
    lastState: IMetaStateInternal;
    /**
     * Сериализация stack'a
     * @returns {ISerializedMetaStack}
     * @private
     */
    serialize(): ISerializedMetaStack;
}
export type IDeserializeStack = (s: ISerializedMetaStack) => IMetaStackInternal;

/**
 * Состояние meta-тегов
 * @interface UI/Base:IMetaState
 * @public
 */
export interface IMetaState {
    /**
     * Возвращает уникальный guid состояния
     * @public
     * @method
     */
    getId(): string;
    /**
     * Сравнивает экземпляры IMetaState на равенство
     * В виде метода, т.к ссылочная целостность теряется при сериализации
     * @public
     * @method
     * @param {IMetaState} state
     * @returns {boolean}
     */
    equal(state: IMetaState): boolean;
}
export interface IMetaStateInternal extends IMetaState {
    /** HTML-разметка title и og-тегов */
    outerHTML: string;
    /**
     * Сериализация состояния
     * @returns {ISerializedMetaState}
     * @private
     * @example
     * <pre class="brush: js">
     * const state = new State(meta);
     * deserializeState(state.serialize()).equal(state)) === true;
     * </pre>
     */
    serialize(): ISerializedMetaState;
    /**
     * Возвращает мета-данные состояния
     * @private
     */
    getMeta(): IMeta;

    getPrevStateId(): string;
    setPrevState(state: IMetaState): void;

    getNextStateId(): string;
    setNextState(state: IMetaState): void;
}
export type IDeserializeMeta = (s: ISerializedMetaState) => IMetaStateInternal;

/**
 * Мета-данные страницы
 * @public
 * @example
 * <pre class="brush: js">
 *    const meta: IMeta = {
 *       title: 'Page title',
 *       og: {
 *           description: 'Some Description',
 *           title: 'Example title',
 *           image: 'http://site.com/images/example.jpg',
 *           type: 'article',
 *           url: 'http://www.site.com/example'
 *       }
 *    }
 * </pre>
 */
export interface IMeta {
    /**
     * Title страницы
     */
    title: string;
    /**
     * OpenGraph тэги страницы
     */
    og?: Partial<IOpenGraph>;
}

/**
 * Интерфейс для метаданных OpenGraph (og)
 * @public
 * @remark
 * OpenGraph - протокол, для формирования  данных в превью в посте в соц. сетях.
 */
export interface IOpenGraph {
    /**
     * краткое описание
     */
    description: string;
    /**
     * заголовок поста
     */
    title: string;
    /**
     * ссылка на картинку
     */
    image: string;
    /**
     * тип страницы (статья, новость, видео, категория и т. д.)
     */
    type: string;
    /**
     * ссылка на страницу сайта
     */
    url: string;
}

export type IAttrsDescription = Record<string, string>;
export interface ITagDescription {
    tagName: string;
    attrs?: IAttrsDescription;
    children?: ITagDescription | string;
}
export type JML = [
    string,
    (Record<string, string> | JML | string)?,
    (JML | string)?
];
export type FullJML = [string, Record<string, string>, (JML | string)?];
