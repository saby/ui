import { Head as AppHead } from 'Application/Page';
import { getConfig } from 'Application/Env';
import { constants } from 'Env/Env';
import * as escapeHtml from 'Core/helpers/String/escapeHtml';
import { IHeadOptions } from 'UI/_head/Interface';

/**
 * Подготовка когфига, который прилетит с сервака на клиент
 * wsConfig нет смысла рендерить на клиенте.
 * Он обязательно должен прийти с сервера.
 * Потому что необходим для загрузки ресурсов
 * очень много параметров имеют альтернативные источники. Взято из UI/_base/HTML
 *
 * csrStartTime - время начала построения страницы на клиенте, в миллисекундах
 */
export function createWsConfig(cfg: IHeadOptions): void {
    if (constants.isBrowserPlatform) {
        return;
    }

    const API = AppHead.getInstance();

    const staticDomains = getStaticDomains(cfg);
    const defaultServiceUrl =
        cfg.servicesPath || constants.defaultServiceUrl || '/service/';
    // @ts-ignore
    const product = cfg.product || constants.product;
    const buildnumber = cfg.buildnumber || constants.buildnumber;
    const preInitScript = cfg.preInitScript ? cfg.preInitScript : '';
    let sbisEnableHydrate = '';
    if (typeof cfg.sbisEnableHydrate === 'boolean') {
        sbisEnableHydrate = `cfg.sbisEnableHydrate = ${cfg.sbisEnableHydrate};`;
    }
    let sbisIsAdaptive = '';
    if (typeof cfg.sbisIsAdaptive === 'boolean') {
        sbisIsAdaptive = `cfg.isAdaptive = ${cfg.sbisIsAdaptive};`;
    }

    API.createMergeTag(
        'script',
        { type: 'text/javascript' },
        [
            'var cfg = window.wsConfig = window.wsConfig || {};',
            `cfg.wsRoot = cfg.wsRoot || '${cfg.wsRoot || constants.wsRoot}';`,
            `cfg.resourceRoot = cfg.resourceRoot || '${
                cfg.resourceRoot || constants.resourceRoot
            }';`,
            `cfg.metaRoot = cfg.metaRoot || '${
                cfg.metaRoot || constants.metaRoot
            }';`,
            `cfg.defaultServiceUrl = cfg.defaultServiceUrl || '${defaultServiceUrl}';`,
            `cfg.appRoot = '${cfg.appRoot || constants.appRoot}';`,
            `cfg.RUMEnabled = ${cfg.RUMEnabled || false};`,
            `cfg.pageName = '${cfg.pageName || ''}';`,
            'cfg.userConfigSupport = true;',
            'cfg.trackErrors = true;',
            `cfg.staticDomains = ${staticDomains};`,
            'cfg.compatible = false;',
            `cfg.product = '${product}';`,
            sbisEnableHydrate,
            sbisIsAdaptive,
            buildnumber ? `window.buildnumber = '${buildnumber}';` : '',
            `window['X-UNIQ-ID'] = '${escapeHtml(
                getConfig('X-UNIQ-ID') || ''
            )}';`,
            `window['X-REQUESTUUID'] = '${escapeHtml(
                getConfig('X-REQUESTUUID') || ''
            )}';`,
            `window['X-CURRENTMETHOD'] = '${
                getConfig('X-CURRENTMETHOD') || ''
            }';`,
            "window['csrStartTime'] = Date.now();",
            preInitScript ? preInitScript : '',
        ]
            .filter((value) => {
                return !!value;
            })
            .join('\n')
    );
}

function getStaticDomains(cfg: IHeadOptions): string {
    let staticDomains: string;

    // @ts-ignore
    staticDomains = cfg.staticDomains || constants.staticDomains || '[]';
    if (typeof staticDomains !== 'string') {
        staticDomains = '[]';
    }
    /** Написано Д. Зуевым в 2019 году. Просто перенес при реструктуризации. */
    if (typeof cfg.staticDomains === 'string') {
        staticDomains = cfg.staticDomains;
    }
    if (cfg.staticDomains instanceof Array) {
        staticDomains = JSON.stringify(cfg.staticDomains);
    }

    return staticDomains;
}
