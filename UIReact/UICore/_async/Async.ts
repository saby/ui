/**
 * @kaizen_zone 4cbeec99-a5a5-48bf-8531-411cf558b0c0
 */
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
import * as Library from 'WasabyLoader/Library';
import { constants } from 'Env/Env';
import { descriptor } from 'Types/entity';
import { Control } from 'UICore/Base';
import { IControlOptions, TemplateFunction } from 'UICommon/Base';
import { addPageDeps } from 'UICommon/Deps';
import { Logger } from 'UICommon/Utils';
import { CommonUtils } from 'UICommon/Executor';
import template = require('wml!UICore/_async/Async');

function generateErrorMsg(templateName: string, msg?: string): string {
    const tTemplate = `Ошибка загрузки контрола "${templateName}"`;
    const tHint =
        'Возможны следующие причины:\n\t \
                  • Ошибка в самом контроле\n\t \
                  • Долго отвечал БЛ метод в _beforeUpdate\n\t \
                  • Контрола не существует';
    return !msg ? `${tTemplate}\n${tHint}` : `${tTemplate}: ${msg}`;
}

export type TAsyncStateReceived = boolean | string;

export interface IAsyncOptions extends IControlOptions {
    templateName: string;
    templateOptions: IControlOptions;
    noBubbleEvents?: boolean;
}

/**
 * Абстрактная реализация контейнера для асинхронной загрузки контролов.
 * !Важно: нельзя использовать этот контейнер напрямую! Необходимо использовать {@link Controls/Container/Async}
 * @see Controls/Container/Async
 * Подробное описание и примеры вы можете найти <a href='/doc/platform/developmentapl/interface-development/pattern-and-practice/async-load/'>здесь</a>.
 *
 * @public
 */
export default abstract class Async extends Control<IAsyncOptions, TAsyncStateReceived> {
    /**
     * @event UICore/Async:Async#templateLoad Событие оповещения, что указанный в templateName шаблон загружен и вставлен в DOM
     */

    protected _template: TemplateFunction = template;
    protected currentTemplateName: string;
    protected optionsForComponent: Record<string, unknown> = {};
    /**
     * Флаг для того, чтобы избежать повторной загрузки шаблона, при изменении опций до окончания асинхронной загрузки
     */
    protected asyncLoading: boolean = false;
    /**
     * Флаг, о том, что произошла ошибка при загрузке модуля - чтобы не было циклической попытки загрузки
     */
    private loadingErrorOccurred: boolean = false;
    protected error: TAsyncStateReceived | void;
    protected userErrorMessage: string | void;
    protected defaultErrorMessage: string = 'У СБИС возникла проблема';
    /**
     * Флаг чтобы понимать, что был загружен контрол и вставлен на страницу -
     * т.к. после монтирования в DOM нужно будет опубликовать событие templateLoad
     * @private
     */
    private needNotifyOnLoad: boolean = false;

    protected _beforeMount(options: IAsyncOptions): Promise<void> | void {
        if (!options.templateName) {
            this.error =
                'В модуль Async передали не корректное имя шаблона (templateName=undefined|null|empty)';
            Logger.error(this.error);
            return;
        }

        if (constants.isBrowserPlatform && !ModulesLoader.isLoaded(options.templateName)) {
            return this._loadContentAsync(options.templateName, options.templateOptions);
        }

        this.error = this._loadContentSync(options.templateName, options.templateOptions);
        if (this.error) {
            this.userErrorMessage = this.defaultErrorMessage;
        }
    }

    protected _componentDidMount(): void {
        this._notifyOnLoad();
    }

    /**
     * Если можем подставить данные при изменении синхронно, то делаем это до обновления
     * @param {*} opts
     */
    protected _beforeUpdate(opts: IAsyncOptions): void {
        if (this.asyncLoading) {
            return;
        }

        if (opts.templateName === this.currentTemplateName) {
            // поменялись только опции шаблона
            this._insertComponent(
                this.optionsForComponent.resolvedTemplate,
                opts.templateOptions,
                opts.templateName
            );
            return;
        }

        if (ModulesLoader.isLoaded(opts.templateName)) {
            this._loadContentSync(opts.templateName, opts.templateOptions);
        }
    }

    _componentDidUpdate(): void {
        if (this.asyncLoading) {
            return;
        }
        if (this.loadingErrorOccurred) {
            this.loadingErrorOccurred = false;
            return;
        }
        if (this.currentTemplateName === this._options.templateName) {
            this._notifyOnLoad();
            return;
        }
        this._loadContentAsync(this._options.templateName, this._options.templateOptions);
    }

    protected _notifyOnLoad(): void {
        if (this.needNotifyOnLoad && !this.error && !this.asyncLoading) {
            this.needNotifyOnLoad = false;
            this._notify('templateLoad');
        }
    }

    protected _loadContentSync(name: string, options: IControlOptions): TAsyncStateReceived {
        const loaded = this._loadSync(name);
        if (loaded === null) {
            return generateErrorMsg(name);
        }

        this.needNotifyOnLoad = true;
        this._insertComponent(loaded, options, name);
        addPageDeps([Library.parse(name).name]);
        return false;
    }

    protected _loadSync<T = unknown>(name: string): T {
        try {
            const loaded = ModulesLoader.loadSync<T>(name);
            if (loaded) {
                return loaded;
            }
        } catch (err) {
            Logger.error(`Couldn't load module "${name}"`, err);
        }
        return null;
    }

    protected _loadContentAsync(name: string, options: IControlOptions): Promise<void> {
        this.asyncLoading = true;
        this.loadingErrorOccurred = false;

        return this._loadAsync(name).then(
            (loaded) => {
                this.asyncLoading = false;
                if (!loaded) {
                    this.loadingErrorOccurred = true;
                    this.error = generateErrorMsg(name);
                    Logger.warn(this.error);
                    this.userErrorMessage = this.defaultErrorMessage;
                    return;
                }

                this.needNotifyOnLoad = true;
                this._insertComponent(loaded, options, name);
            },
            (err) => {
                this.asyncLoading = false;
                this.loadingErrorOccurred = true;
                this._setErrorState(err, name);
            }
        );
    }

    protected _loadAsync(name: string): Promise<unknown> {
        return ModulesLoader.loadAsync(name).catch((error) => {
            Logger.error(`Couldn't load module "${name}"`, error);
            ModulesLoader.unloadSync(name);
            throw new Error(this.defaultErrorMessage);
        });
    }

    protected _setErrorState(err: Error, name: string): void {
        this.error = generateErrorMsg(name);
        this.userErrorMessage = err.message;
    }

    protected _insertComponent(tpl: unknown, options: IControlOptions, templateName: string): void {
        this.error = '';
        this.currentTemplateName = templateName;
        this.optionsForComponent = {};
        const opts = options || {};
        for (const key in opts) {
            if (opts.hasOwnProperty(key)) {
                this.optionsForComponent[key] = opts[key];
            }
        }

        if (tpl && CommonUtils.isDefaultExport(tpl)) {
            // @ts-ignore
            this.optionsForComponent.resolvedTemplate = tpl.default;
            return;
        }
        this.optionsForComponent.resolvedTemplate = tpl;
    }

    static getOptionTypes(): Record<string, unknown> {
        return {
            templateName: descriptor(String).required(),
        };
    }
}

/**
 * @name UICore/Async:Async#content
 * @cfg {String} Содержимое контейнера.
 */

/**
 * @name UICore/Async:Async#templateName
 * @cfg {String} Имя асинхронно загружаемого контрола.
 * Можно использовать только {@link /doc/platform/developmentapl/interface-development/pattern-and-practice/javascript-libraries/#_2 публичные пути библиотеки}.
 */

/**
 * @name UICore/Async:Async#templateOptions
 * @cfg {Object} Параметры содержимого контейнера Async.
 */
