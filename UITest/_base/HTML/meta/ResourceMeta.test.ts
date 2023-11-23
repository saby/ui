import { assert } from 'chai';
import { getMetaStack } from 'UI/Base';
import { ResourceMeta } from 'UI/_base/meta';
/* eslint-disable */
describe('UI/_base/_meta/ResourceMeta', () => {
    it('проверка метода enter', () => {
        const TITLE_CONTENT = 'ResourceMetaTitle1';
        const resource = new ResourceMeta({ title: TITLE_CONTENT });
        resource.enter();
        assert.isTrue(
            // @ts-ignore
            getMetaStack().lastState._meta.title === TITLE_CONTENT,
            'В stack не был добавлен актуальный state'
        );
    });
    it('проверка метода dispose', () => {
        const TITLE_CONTENT = 'ResourceMetaTitle2';
        const resource = new ResourceMeta({ title: TITLE_CONTENT });
        resource.enter();
        resource.dispose();
        assert.isFalse(
            // @ts-ignore
            getMetaStack().lastState._meta.title === TITLE_CONTENT,
            'В stack не был удален текущий state'
        );
    });
});
