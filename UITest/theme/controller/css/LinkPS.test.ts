import { assert } from 'chai';
import LinkPS from 'UICommon/theme/_controller/css/LinkPS';
const href = '#Some/href';
const name = 'Some/Control';
const theme = 'Some-theme';

let link: LinkPS;

describe('UICommon/theme/_controller/css/LinkPS', () => {
    beforeEach(() => {
        link = new LinkPS(href, name, theme);
    });
    afterEach(() => {
        link.remove();
        link = null;
    });

    describe('load', () => {
        it('load returns void 0', () => {
            assert.isUndefined(link.load());
        });

        it('isMounted true after load', () => {
            link.load();
            assert.isTrue(link.isMounted);
            link.remove();
        });
    });

    describe('require / remove', () => {
        it('невостребованный экземпляр LinkPS удаляется', () => {
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
