// @ts-ignore
import { constants } from 'Env/Env';
import SingleLink from 'UICommon/theme/_controller/css/SingleLink';
import { THEME_TYPE } from 'UI/theme/controller';
import { IHTMLElement } from 'UICommon/theme/_controller/css/interface';
import { ELEMENT_ATTR } from 'UICommon/theme/_controller/css/const';
import { assert } from 'chai';

const href = '#Some/href';
const name = 'Some/Control';
const theme = 'Some-theme';
const themeType = THEME_TYPE.MULTI;

class LinkElementMock implements IHTMLElement {
    constructor(
        href: string,
        name: string,
        theme: string,
        themeType: THEME_TYPE
    ) {
        this[ELEMENT_ATTR.HREF] = href;
        this[ELEMENT_ATTR.THEME] = theme;
        this[ELEMENT_ATTR.THEME_TYPE] = themeType;
    }
    getAttribute(attr: string): string {
        return this[attr];
    }
    // eslint-disable-next-line no-empty, no-empty-function, @typescript-eslint/no-empty-function
    remove(): void {}
}

let element: LinkElementMock;
let link: SingleLink;

describe('UICommon/theme/_controller/css/SingleLink', () => {
    beforeEach(() => {
        element = new LinkElementMock(href, name, theme, themeType);
        link = new SingleLink(href, name, theme, element);
    });
    afterEach(() => {
        link.remove();
        element = null;
        link = null;
    });

    describe('removeForce', () => {
        it('при удалении экземпляр SingleLink также удаляется элемент из DOM', () => {
            return link.removeForce().then(() => {
                assert.isFalse(link.isMounted);
            });
        });

        it('css, необходимая другим контролам, удаляется', () => {
            link.require();
            link.require();
            link.require();
            return link.removeForce().then(() => {
                assert.isFalse(link.isMounted);
            });
        });
    });
});
