/**
 * @jest-environment jsdom
 */
import { assert } from 'chai';
// @ts-ignore
import { constants } from 'Env/Env';
import Link from 'UICommon/theme/_controller/css/Link';
import { THEME_TYPE } from 'UI/theme/controller';
import { IHTMLElement } from 'UICommon/theme/_controller/css/interface';
import { ELEMENT_ATTR } from 'UICommon/theme/_controller/css/const';
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
let link: Link;

describe('UICommon/theme/_controller/css/Link', () => {
    beforeEach(() => {
        element = new LinkElementMock(href, name, theme, themeType);
        link = new Link(href, name, theme, element);
    });
    afterEach(() => {
        link.remove();
        element = null;
        link = null;
    });

    describe('load', () => {
        it('load returns Promise<void>', () => {
            assert.instanceOf(link.load(), Promise);
        });

        it('isMounted true after load', () => {
            return (link.load() as Promise<void>).then(() => {
                assert.isTrue(link.isMounted);
            });
        });
    });

    describe('from', () => {
        it('Link`s instance from HTMLLinkElement', () => {
            assert.instanceOf(link, Link);
            assert.strictEqual(name, link.cssName);
            assert.strictEqual(theme, link.themeName);
        });
    });

    describe('require / remove', () => {
        it('при удалении экземпляр Link также удаляется элемент из DOM', () => {
            return link.remove().then((isRemoved) => {
                assert.isFalse(link.isMounted);
                assert.isTrue(isRemoved);
            });
        });

        it('css, необходимая другим контролам, не удаляется', () => {
            link.require();
            return link.remove().then((isRemoved) => {
                assert.isFalse(isRemoved);
            });
        });
    });
});
