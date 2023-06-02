import { Head as AppHead, JSLinks } from 'Application/Page';
import type { JML } from 'Application/Page';
import { getResourceUrl, jsEscape } from 'UI/Utils';
import escapeHtml = require('Core/helpers/String/escapeHtml');
import { IHeadOptions } from 'UI/_head/Interface';

export function createTitle(title: string): void {
    AppHead.getInstance().createTag('title', {}, title);
}
export function createViewPort(): void {
    AppHead.getInstance().createTag('meta', {
        content: 'width=1024',
        name: 'viewport',
    });
}

export function createDefaultTags(cfg: IHeadOptions): void {
    const API = AppHead.getInstance();

    API.createMergeTag(
        'script',
        { type: 'text/javascript' },
        `window.themeName = '${jsEscape(cfg.theme || cfg.defaultTheme || '')}';`
    );

    if (cfg.noscript) {
        API.createNoScript(cfg.noscript);
    }
    const metaAttrs = [
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
        { charset: 'utf-8', class: 'head-server-block' },
    ];
    metaAttrs.forEach((attrs) => {
        // @ts-ignore
        API.createTag('meta', attrs);
    });
}
/**
 * Функция для подготовки данных
 * @param tag
 * @param attrs
 * @returns
 */
const prepareMetaScriptsAndLinks = (tag: string, attrs: object): object => {
    return {
        tag,
        attrs,
    };
};
/**
 * Применим опции meta, scripts и links к странице
 * @param cfg
 * @example
 * <pre class="brush: js">
 * import { createMetaScriptsAndLinks } from 'UI/Head';
 * const data = {
 *     meta: [{
 *         name: "format-detection",
 *         content: "telephone=no"
 *     }, {
 *         name: "viewport",
 *         content: "width=1024"
 *     }],
 *     scripts: [{
 *         type: "text-javascript",
 *         src: "//cdn.sbis.ru/cdn/Boomerang/v.0.0.3.js"
 *     }],
 *     links: [{
 *       rel: "preload",
 *       as: "font",
 *       href: "//cdn.sbis.ru/cdn/TensorFont/1.0.3/TensorFont/TensorFont.woff2",
 *       type: "font/woff2",
 *       crossorigin: "anonymous"
 *     }]
 * };
 * createMetaScriptsAndLinks(data);
 * </pre>
 */
export function createMetaScriptsAndLinks(cfg: IHeadOptions): void {
    const API = AppHead.getInstance();
    const JsLinksAPI = JSLinks.getInstance();
    []
        .concat(
            (cfg.meta || []).map((attr) => {
                return prepareMetaScriptsAndLinks('meta', attr);
            })
        )
        .concat(
            (cfg.scripts || []).map((attr) => {
                return prepareMetaScriptsAndLinks('script', attr);
            })
        )
        .concat(
            (cfg.links || []).map((attr) => {
                return prepareMetaScriptsAndLinks('link', attr);
            })
        )
        .forEach((item: { tag: string; attrs: object }) => {
            ['href', 'src'].forEach((field) => {
                if (item.attrs[field]) {
                    item.attrs[field] = getResourceUrl(item.attrs[field]);
                }
            });

            // на старых страницах прилетают js-скрипты в поле jsLinks - их добавляем на страницу через API JSLinks
            // @ts-ignore
            if (item.tag === 'script' && item.attrs.src) {
                if (typeof window === 'undefined') {
                    JsLinksAPI.createTag(item.tag, item.attrs);
                }

                return;
            }

            // @ts-ignore
            API.createTag(item.tag, item.attrs);
        });
}

/**
 * Поддержка старой опции
 * Запустил процесс отказа от нее
 * https://online.sbis.ru/opendoc.html?guid=fe14fe59-a564-4904-9a87-c38a5a22b924
 * @param options
 * @deprecated
 */
export function applyHeadJson(json: JML[]): void {
    if (!json || !(json instanceof Array)) {
        return;
    }

    /** В реалиях построения от шаблона, придется это гонять через Head API */
    const API = AppHead.getInstance();
    json.forEach((data) => {
        const tag = data[0];
        let attrs = typeof data[1] === 'object' ? data[1] : null;
        const content = typeof data[1] === 'string' ? data[1] : null;

        if (!attrs) {
            attrs = {};
        }
        /** Раньше HeadJSON прогонялся напрямую через TagMarkup. Сейчас необходимо выполнить подготовку */
        for (const attrsKey in attrs) {
            if (attrs.hasOwnProperty(attrsKey)) {
                if (attrsKey === 'href' || attrsKey === 'src') {
                    attrs[attrsKey] = getResourceUrl(attrs[attrsKey]);
                    continue;
                }
                attrs[attrsKey] = escapeHtml(attrs[attrsKey]);
            }
        }

        // @ts-ignore
        API.createTag(tag, attrs, content);
    });
}
