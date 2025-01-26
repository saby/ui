import { default as Link } from './Link';
import { Base } from './Base';
import { THEME_TYPE } from './const';
import { Head as HeadAPI, IPageTagId, IPageTagAttrs } from 'Application/Page';
import { ICssEntity } from 'UICommon/theme/_controller/css/interface';

/**
 * Мультитемная ссылка на СП
 * @private
 */
export default class LinkPS extends Base implements ICssEntity {
    loading: Promise<void>;
    headTagId: IPageTagId;
    generateAttrs: () => IPageTagAttrs;
    constructor(
        href: string,
        cssName: string,
        themeName: string,
        public themeType: THEME_TYPE = THEME_TYPE.MULTI
    ) {
        super(href, cssName, themeName, themeType);
        // Единственная общая логика Link и LinkPS. В остальном лучше наследовать от Base, чтобы в LinkPS не создавалось лишних промизов.
        this.generateAttrs = Link.prototype.generateAttrs.bind(this);
    }

    load(): void {
        try {
            const attrs = this.generateAttrs();
            this.headTagId = HeadAPI.getInstance().createTag('link', attrs, null, {
                load: () => {}, // этот метод необходим, т.к. в HeadAPI->ElementPS он вызовется
            });
            this.isMounted = true;
        } catch (err) {
            if (this.headTagId) {
                HeadAPI.getInstance().deleteTag(this.headTagId);
            }
            throw err;
        }
    }

    getLoading(): LinkPS {
        return this;
    }
}
