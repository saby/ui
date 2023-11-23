import { EMPTY_THEME, getThemeController } from 'UICommon/theme/controller';
import { Logger } from 'UICommon/Utils';

const isBrowserPlatform: boolean = typeof window !== 'undefined';

export interface IThemeControllerConfig {
    moduleName: string;
    themeName: string;
    notLoadThemes?: boolean;
    themes?: string[];
    styles?: string[];
    instThemes?: string[];
    instStyles?: string[];
}

export default class ThemeController {
    private readonly _moduleName: string;
    private _themeName: string;
    private readonly _notLoadThemes: boolean = false;
    private _themes: string[] = [];
    private _styles: string[] = [];
    private readonly _instThemes: string[] = [];
    private readonly _instStyles: string[] = [];

    constructor(config: IThemeControllerConfig) {
        this._themeName = config.themeName;
        this._moduleName = config.moduleName;
        this._notLoadThemes = config.notLoadThemes || false;
        this._themes = config.themes || [];
        this._styles = config.styles || [];
        this._instThemes = Array.isArray(config.instThemes)
            ? config.instThemes
            : [];
        this._instStyles = Array.isArray(config.instStyles)
            ? config.instStyles
            : [];
    }

    updateTheme(themeName?: string): Promise<void> | null {
        if (this._themeName === themeName) {
            return null;
        }
        this._themeName = themeName || this._themeName;

        this._loadThemeVariables();
        const themesPromise = this._loadThemes();
        const stylesPromise = this._loadStyles();
        if (
            isBrowserPlatform &&
            !this._isDeprecatedCSS() &&
            !this._isCSSLoaded()
        ) {
            return Promise.all([themesPromise, stylesPromise]).then(nop);
        }

        return null;
    }

    private _isDeprecatedCSS(): boolean {
        const isDeprecatedCSS =
            !!this._instThemes.length || !!this._instStyles.length;

        if (isDeprecatedCSS) {
            Logger.warn(
                `Стили и темы должны перечисляться в статическом свойстве класса ${this._moduleName}`
            );
        }

        return isDeprecatedCSS;
    }

    /**
     * Проверка загрузки стилей и тем контрола
     * @private
     */
    private _isCSSLoaded(): boolean {
        const themeController = getThemeController();
        const themes = this._themes.concat(this._instThemes || []);
        const styles = this._styles.concat(this._instStyles || []);
        if (styles.length === 0 && themes.length === 0) {
            return true;
        }

        return (
            themes.every((cssName) => {
                return themeController.isMounted(cssName, this._themeName);
            }) &&
            styles.every((cssName) => {
                return themeController.isMounted(cssName, EMPTY_THEME);
            })
        );
    }

    /**
     * Загрузка стилей контрола
     * @private
     * @method
     * @example
     * <pre>
     *     import('Controls/_popupTemplate/InfoBox')
     *         .then((InfoboxTemplate) => InfoboxTemplate.loadStyles())
     * </pre>
     */
    private _loadStyles(): Promise<void> | void {
        const themeController = getThemeController();
        const styles = this._styles.concat(this._instStyles || []);
        if (styles.length === 0) {
            return;
        }

        const emptyStyles = styles.map((name) => {
            return themeController.get(name, EMPTY_THEME);
        });
        if (isBrowserPlatform) {
            return Promise.all(emptyStyles).then(nop);
        }
    }

    /**
     * Загрузка тем контрола
     * @private
     * @method
     * @example
     * <pre>
     *     import('Controls/_popupTemplate/InfoBox')
     *         .then((InfoboxTemplate) => InfoboxTemplate.loadThemes('saby__dark'))
     * </pre>
     */
    private _loadThemes(): Promise<void> | void {
        const themeController = getThemeController();
        const themes = this._themes.concat(this._instThemes || []);
        if (themes.length === 0) {
            return;
        }

        const emptyThemes = themes.map((name) => {
            return themeController.get(name, this._themeName);
        });
        if (isBrowserPlatform) {
            return Promise.all(emptyThemes).then(nop);
        }
    }

    /**
     * Вызовет загрузку коэффициентов (CSS переменных) для тем.
     * @method
     * @example
     * <pre>
     *     import('Controls/_popupTemplate/InfoBox')
     *         .then((InfoboxTemplate) => InfoboxTemplate.loadThemeVariables('default__cola'))
     * </pre>
     */
    private _loadThemeVariables(): Promise<void> | void {
        if (!this._themeName || this._notLoadThemes) {
            return;
        }

        let getVarsPromise;
        try {
            getVarsPromise = getThemeController().getVariables(this._themeName);
        } catch (e) {
            logError(e);
            return;
        }

        if (getVarsPromise && getVarsPromise.then) {
            getVarsPromise = getVarsPromise.catch(logError);
        }

        return getVarsPromise;
    }
}

const nop = () => {
    return undefined;
};

function logError(e: Error): void {
    Logger.error(e.message);
}
