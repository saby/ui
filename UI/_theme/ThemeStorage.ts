/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import type { TThemeGetterConfig, IActiveTheme } from 'UI/theme/controller';
import { getStore } from 'Application/Env';
import { getThemeController } from 'UI/theme/controller';
import type { IErrorActiveTheme } from 'UI/Theme';

/**
 * Стор для хранения всех активных тем на странице.
 * Умеет сам грузить тему, после загрузки сохраняет автоматически.
 * @private
 */
class ThemeStorage {
    private _storageUuid: Map<string, IActiveTheme> = new Map();
    private _storageSelector: Map<string, IActiveTheme> = new Map();
    async loadTheme(cfg: TThemeGetterConfig): Promise<IActiveTheme> {
        if ('selector' in cfg && this._storageSelector.has(cfg.selector)) {
            return this._storageSelector.get(cfg.selector) as IActiveTheme;
        }
        const activeTheme = await getThemeController().getActiveTheme(cfg);
        this.saveTheme(activeTheme);
        return activeTheme;
    }

    saveTheme(activeTheme: IActiveTheme | IErrorActiveTheme): void {
        if ('uuid' in activeTheme && activeTheme.uuid) {
            this._storageUuid.set(activeTheme.uuid, activeTheme);
        }
        if (!('error' in activeTheme) && activeTheme?.selector) {
            this._storageSelector.set(activeTheme.selector, activeTheme);
        }
    }

    getThemeByUuid(uuid: string): IActiveTheme | undefined {
        return this._storageUuid.get(uuid);
    }

    getTheme(selector: string): IActiveTheme | undefined {
        return this._storageSelector.get(selector);
    }

    hasTheme(): boolean {
        return this._storageUuid.size > 0 || this._storageSelector.size > 0;
    }
}

export default function getThemeStorage(): ThemeStorage {
    return getStore('theme-store', () => new ThemeStorage());
}
