import { createEntity } from 'UICommon/theme/_controller/CSS';
import LinkPS from 'UICommon/theme/_controller/css/LinkPS';
import SingleLinkPS from 'UICommon/theme/_controller/css/SingleLinkPS';
import { THEME_TYPE } from 'UI/theme/controller';

describe('UICommon/theme/_controller/CSS node', () => {
    const href = '#href';
    const cssName = 'cssName';
    const themeName = 'themeName';

    describe('createEntity на СП', () => {
        it('Создает экземпляр LinkPS для мультитемы', () => {
            const entity = createEntity(
                href,
                cssName,
                themeName,
                THEME_TYPE.MULTI
            );
            expect(entity).toBeInstanceOf(LinkPS);
        });

        it('Создает экземпляр SingleLinkPS для немультитемы', () => {
            const entity = createEntity(
                href,
                cssName,
                themeName,
                THEME_TYPE.SINGLE
            );
            expect(entity).toBeInstanceOf(SingleLinkPS);
        });
    });
});
