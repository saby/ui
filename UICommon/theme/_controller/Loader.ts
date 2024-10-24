// @ts-ignore
import LinkResolver from './LinkResolver';
// @ts-ignore
import { constants, cookie, detection } from 'Env/Env';
import { EMPTY_THEME, CSS_MODULE_PREFIX, THEMED_CSS_MODULE_PREFIX } from './css/const';
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
import { gets3debug } from 'UICommon/Utils';
// @ts-ignore
import { memoize } from 'Types/function';
import 'i18n!controller?';
import { controller } from 'I18n/i18n';

interface IConfig {
    buildnumber?: string;
    wsRoot?: string;
    appRoot?: string;
    resourceRoot?: string;
}

const isServerSide = typeof window === 'undefined';

function getWsConfig(): IConfig | undefined {
    // @ts-ignore
    return !isServerSide && window.wsConfig;
}

export default class Loader implements ICssLoader {
    // TODO избавиться от LinkResolver, разрешать путь самостоятельно
    lr: LinkResolver;

    constructor(isDebug: boolean = false) {
        const { buildnumber, wsRoot, appRoot, resourceRoot } = constants as IConfig;
        if (isServerSide) {
            this.lr = new LinkResolver(isDebug, buildnumber, wsRoot, appRoot, resourceRoot);
            return;
        }
        // на клиенте require css! иногда начинается раньше инициализации core-init, поэтому
        // смотрим сразу wsConfig
        // TODO убрать после завершения проекта Единая точка старта приложения
        // https://online.sbis.ru/opendoc.html?guid=0f2cfb1c-d0b0-41dc-9fdc-c9fa004ac6d8
        const wsConfig: IConfig = getWsConfig() || {};
        this.lr = new LinkResolver(
            isDebug,
            wsConfig.buildnumber || buildnumber,
            wsConfig.wsRoot || wsRoot,
            wsConfig.appRoot || appRoot,
            wsConfig.resourceRoot || resourceRoot
        );
        this.getHref = memoize(this.getHref);
    }

    getHref(initialName: string, theme: string): string {
        let name: string = initialName;
        const dir = controller.currentLocaleConfig.directionality;
        if (!name && theme !== EMPTY_THEME) {
            return ModulesLoader.getModuleUrl(
                `${THEMED_CSS_MODULE_PREFIX}/${theme}`,
                gets3debug(),
                detection.isIE,
                dir,
                true
            );
        }
        if (name.indexOf('.css') !== -1) {
            return name;
        }
        if (theme === EMPTY_THEME) {
            /**
             * Если нет слешей и заканчивается на .package, то можно добавить превикс из wsConfig
             * Например: online-page-superbuindle.package
             * надо превратить в /resources/online-page-superbuindle.package
             * TODO: Исправится после https://online.sbis.ru/doc/46e18aa9-31a9-418c-9ac1-b15db1de43ce
             * @private
             */
            if (!name.includes('/') && name.endsWith('.package')) {
                const wsConfig: IConfig = getWsConfig() || {};
                name = `${wsConfig.resourceRoot}${name}`;
            }
            return ModulesLoader.getModuleUrl(
                CSS_MODULE_PREFIX + name,
                gets3debug(),
                detection.isIE,
                dir,
                true
            );
        }
        return this.lr.resolveCssWithTheme(name, theme);
    }
}

export interface ICssLoader {
    getHref(name: string | null, theme?: string): string;
}
