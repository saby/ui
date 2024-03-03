import { default as Link } from './Link';
import { THEME_TYPE } from './const';
import { Head as HeadAPI } from 'Application/Page';
import { ICssEntity } from 'UICommon/theme/_controller/css/interface';

/**
 * Мультитемная ссылка на СП
 * @private
 */
export default class LinkPS extends Link implements ICssEntity {
    loading: Promise<void> = undefined;
    constructor(
        href: string,
        cssName: string,
        themeName: string,
        public themeType: THEME_TYPE = THEME_TYPE.MULTI
    ) {
        super(href, cssName, themeName, null, themeType);
    }

    load(): void {
        try {
            const attrs = this.generateAttrs();
            this.headTagId = HeadAPI.getInstance().createTag(
                'link',
                attrs,
                null,
                {
                    load: () => {}, // этот метод необходим, т.к. в HeadAPI->ElementPS он вызовется
                }
            );
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
