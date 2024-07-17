// @ts-ignore
import { cookie } from 'Env/Env';
import { Logger, isUnitTestMode, getResourceUrl } from 'UICommon/Utils';
import { createEntity, isSingleEntity, restoreEntity } from './CSS';
import { DEFAULT_THEME, EMPTY_THEME, THEME_TYPE } from './css/const';
import { ICssEntity } from './css/interface';
import Loader, { ICssLoader } from './Loader';
import { AliasStorage, EntityStorage, IAliases } from './Storage';
import * as escapeHtml from 'Core/helpers/String/escapeHtml';

import type { Model } from 'Types/entity';

/**
 * Тип сайта, тип конструктора, он же aspect.
 * Например, для приложения Saby это '87688e42-71bf-11ee-b962-0242ac120002'
 */
export type TSiteType = string | undefined;

export type TClassList = string[];

// Временное решение, пока API не устаканилось. чтобы не ждать SDK в случае смены API.
type TAny = any;

interface IImage {
    attachId: string;
    canDelete: boolean;
    canEdit: boolean;
    fileName: string;
    id: string;
    originalFileId: string;
    sbisDiskId: string;
    size: number;
    url: string;
}

export type TThemePropertiesObject = Partial<{
    logo: IImage;
    picture: IImage;
    background: string;
    backgroundColor: string;
    texture: string;
    dominantColorRGB: string;
    url_full: {
        logo: string;
        picture: string;
        texture: string;
    };
}>;

type TThemeProperties = Model<TThemePropertiesObject>;
export interface IActiveTheme extends TAny {
    selector?: string;
    uuid?: string;
    version?: number;
    classList?: TClassList;
    properties?: TThemeProperties;
}

export type TThemeGetterConfig =
    | {
          selector: string;
      }
    | {
          uuid: string;
          client_id?: number;
      };

/**
 * Область видимости.
 */
export type TScopeType = 'GLOBAL' | 'ACCOUNT' | 'USER' | 'USERDEVICE' | 'PROFILE' | 'DEVICE';

const THEME_PACKAGE_BUILDED = 'ThemesModule/sabythemes';

/**
 * Имя темы. Используется для загрузки статической темы.
 */
type TThemeName = string;

/**
 * Контроллер тем, необходим для скачивания/удаления/коллекции/переключения тем на странице
 * @public
 * @singleton
 */
export class Controller {
    private storage: EntityStorage = new EntityStorage();
    private aliases: AliasStorage = new AliasStorage();

    // Может быть у наследника. TODO abstract
    protected getVariablesExtended: (
        sitetype?: TSiteType | TThemeName,
        scopetype?: TScopeType,
        scope?: string
    ) => Promise<TClassList | void> | TClassList | void;

    /** Имя темы приложения */
    appTheme: string = DEFAULT_THEME;

    constructor(private cssLoader: ICssLoader) {
        this.set = this.set.bind(this);
        this.has = this.has.bind(this);
        this.clear = this.clear.bind(this);
        this.collectCssLinks();
    }

    /**
     * Получение экземпляра CssEntity по имени и теме
     * В случае отсутсвия сохранненого значения в Store даст команду HEAD API (через посредников) на создание тега
     * При повторном запросе востребованность темы возрастает
     */
    get(
        cssName: string,
        themeName?: string,
        themeType: THEME_TYPE = THEME_TYPE.MULTI
    ): Promise<ICssEntity> {
        /** Имя темы или файла может прилететь вот таким 'default\\" onload=\\"console.log(\'XSS\')\\"' */
        const name = escapeHtml(this.aliases.get(cssName));
        const theme = escapeHtml(themeName || this.appTheme);
        const href = this.cssLoader.getHref(name, theme);
        return Promise.resolve(this._get(name, theme, href, themeType));
    }

    /**
     * Получает файл с коэффициентами (CSS переменными) для тем.
     * @param themeName
     */
    getVariables(themeName: TThemeName): Promise<void> | void {
        if (isUnitTestMode()) {
            /** В режиме юнит тестов не будем грузить CSS Variables */
            return;
        }

        /** Имя темы или файла может прилететь вот таким 'default\\" onload=\\"console.log(\'XSS\')\\"' */
        const theme = escapeHtml(themeName);

        const href = this.cssLoader.getHref(null, theme);
        const promise = this._get(theme, theme, href, THEME_TYPE.MULTI) as Promise<ICssEntity>;
        if (promise && promise.then) {
            return promise.then(() => {
                return undefined;
            });
        }
    }

    getActiveTheme(config?: TThemeGetterConfig): Promise<IActiveTheme>;
    /**
     * @deprecated
     */
    getActiveTheme(
        sitetype?: TSiteType | TThemeName,
        scopetype?: TScopeType,
        scope?: string
    ): Promise<IActiveTheme>;
    /**
     * Загрузка активной темы из сбилженных CSS
     * @param config
     */
    async getActiveTheme(
        config?: TThemeGetterConfig | TSiteType | TThemeName,
        _scopetype?: TScopeType,
        _scope?: string
    ): Promise<IActiveTheme> {
        if (!config || typeof config !== 'object') {
            return {};
        }

        const selector = 'selector' in config ? config.selector : config.uuid;

        return {
            selector,
            uuid: selector,
            classList: [
                `t-${selector}`,
                'primary_color',
                'brand_color',
                'secondary_color',
                'danger_color',
                'success_color',
                'warning_color',
                'info_color',
                'neutral_color',
                'link_color',
                'label_color',
                'heading_color',
                'navigation_color',
                'notice-center_background-color',
            ],
        };
    }

    applyStyles({ selector }: IActiveTheme): void {
        if (selector) {
            const styleLink = getResourceUrl(`${THEME_PACKAGE_BUILDED}/${selector}.css`);
            this._get(styleLink, selector, styleLink, THEME_TYPE.MULTI);
        }
    }

    /**
     * Получает файл с коэффициентами (CSS переменными) для тем.
     * @param themeName
     * @deprecated
     */
    getVariablesFeature(
        sitetype?: TSiteType | TThemeName,
        scopetype?: TScopeType,
        scope?: string
    ): Promise<TClassList | void> | TClassList | void {
        if (isUnitTestMode()) {
            /** В режиме юнит тестов не будем грузить CSS Variables */
            return;
        }

        if (this.shouldGetVariablesExtended(sitetype, scopetype, scope)) {
            return this.getVariablesExtended?.(sitetype, scopetype, scope);
        }
    }

    private shouldGetVariablesExtended(
        sitetype?: TSiteType | TThemeName,
        scopetype?: TScopeType,
        scope?: string
    ): boolean {
        // Если задан только sitetype - это имя темы, грузим через cssLoader.
        return !(sitetype && !scopetype && !scope);
    }

    protected _get(
        initialName: string,
        initialTheme: string,
        href: string,
        themeType: THEME_TYPE
    ): Promise<ICssEntity> | ICssEntity {
        /** Имя темы или файла может прилететь вот таким 'default\\" onload=\\"console.log(\'XSS\')\\"' */
        const name = escapeHtml(initialName);
        const theme = escapeHtml(initialTheme);

        // в случаях дополнительных безымянных css, cssName равно href, см. UICommon/theme/_controller/CSS:49
        const registeredName =
            (this.has(name, theme) && name) || (this.has(href, theme) && href) || null;
        if (registeredName) {
            const storedEntity = this.storage.get(registeredName, theme);
            storedEntity.require();
            /** Еще нескаченные css уже имеются в store, необходимо дождаться окончания монтирования в DOM */
            return storedEntity.getLoading();
        }
        const entity = createEntity(href, name, theme, themeType);
        /** Еще нескаченный link сохраняется в store, чтобы избежать повторного fetch */
        this.set(entity);
        const entityLoadCb = () => {
            if (theme === EMPTY_THEME) {
                return entity;
            }
            /** Если link успешно скачан и вмонтирован в DOM, удаляем немультитемные стили */
            this.removeSingleEntities(entity.cssName, entity.themeName);
            return entity;
        };
        const entityLoadErrb = (e: Error) => {
            /** Если стилей нет, удаляем link из Store */
            return this.remove(name, theme).then(() => {
                throw decorateError(e);
            });
        };
        const entityLoading = entity.load();
        if (entityLoading && entityLoading.then) {
            return entityLoading.then(entityLoadCb).catch(entityLoadErrb);
        }
        return entityLoadCb();
    }

    /**
     * Получение всех сохраненных CssEntity
     */
    getAll(): ICssEntity[] {
        return this.storage
            .getAllCssNames()
            .map((name) => {
                return this.storage.getEntitiesBy(name);
            })
            .reduce((prev, cur) => {
                return prev.concat(cur);
            }, []);
    }
    /**
     * Проверка наличия темы `themeName` у контрола `name`
     */
    has(cssName: string, themeName?: string): boolean {
        const name = this.aliases.get(cssName);
        const theme = themeName || this.appTheme;
        return this.storage.has(name, theme);
    }

    isMounted(cssName: string, themeName?: string): boolean {
        /** Имя темы или файла может прилететь вот таким 'default\\" onload=\\"console.log(\'XSS\')\\"' */
        const name = escapeHtml(this.aliases.get(cssName));
        const theme = escapeHtml(themeName || this.appTheme);

        if (!this.storage.has(name, theme)) {
            return false;
        }
        return this.storage.get(name, theme).isMounted;
    }

    /**
     * Установить тему приложения
     * @param {string} themeName
     */
    setTheme(theme: string): Promise<void> | void {
        if (!theme || theme === this.appTheme) {
            return Promise.resolve();
        }
        /** Имя темы или файла может прилететь вот таким 'default\\" onload=\\"console.log(\'XSS\')\\"' */
        const themeName = escapeHtml(theme);

        this.appTheme = themeName;
        return Promise.resolve(this.getVariables(themeName)).then(() => {
            return undefined;
        });
    }

    /**
     * Уменьшить 'востребованность' css,
     * т.е контрол `cssName` удаляется и, если больше нет зависимостей, css также удаляется из DOM
     */
    remove(cssName: string, themeName?: string): Promise<boolean> {
        /** Имя темы или файла может прилететь вот таким 'default\\" onload=\\"console.log(\'XSS\')\\"' */
        const name = escapeHtml(this.aliases.get(cssName));
        const theme = escapeHtml(themeName || this.appTheme);

        if (!this.storage.has(name, theme)) {
            return Promise.resolve(true);
        }
        return this.storage.remove(name, theme);
    }

    clear(): void {
        this.storage.clear();
    }

    /**
     * Определение алиасов имен css
     * @param {IAliases} aliases
     * @example
     * <pre class="brush: js">
     *  it('Метод get при запросе алиаса возвращает css-сущность с оригинальным именем', () => {
     *    controller.define({'aliasName':'originalName'});
     *    return controller.get('aliasName').then((entity) => {
     *       assert.strictEqual(entity.cssName, 'originalName');
     *     });
     *  });
     * </pre>
     */
    define(aliases: IAliases): void {
        this.aliases.set(aliases);
    }

    /**
     * Сохранение css сущности в store
     * @param link
     */
    private set(link: ICssEntity): void {
        this.storage.set(link);
    }
    /**
     * при добавлении темы, немультитемные темы должны удаляться,
     * т.к возникают конфликты селекторов (они одинаковые)
     */
    private removeSingleEntities(cssName: string, themeName: string): void {
        this.storage
            .getEntitiesBy(cssName)
            .filter(isSingleEntity)
            .filter((entity) => {
                return entity.themeName !== themeName;
            })
            .forEach((singleLink) => {
                return singleLink
                    .removeForce()
                    .then(() => {
                        return this.storage.remove(singleLink.cssName, singleLink.themeName);
                    })
                    .catch((e: Error) => {
                        Logger.error(e.stack);
                    });
            });
    }

    /**
     * Сбор всех ссылок на css из DOM,
     * и сохранение их в store
     */
    private collectCssLinks(): void {
        if (typeof document === 'undefined') {
            return;
        }
        Array.from(document.getElementsByTagName('link'))
            .map(restoreEntity)
            .filter((link: ICssEntity) => {
                return !!link;
            })
            .forEach(this.set);
    }

    static instance: Controller;

    static getInstance(): Controller {
        if (typeof Controller.instance !== 'undefined') {
            return Controller.instance;
        }
        // @ts-ignore
        const buildMode = globalThis.contents?.buildMode;
        const isDebug = buildMode === 'debug' || cookie.get('s3debug') === 'true';
        Controller.instance = new Controller(new Loader(isDebug));
        return Controller.instance;
    }
}
function decorateError(e: Error): Error {
    return new Error(
        `UICommon/theme/controller
   ${e.message}
   It's probably an error with internet connection or CORS settings.`
    );
}
