import { assert } from 'chai';
import Loader from 'UICommon/theme/_controller/Loader';
import { EMPTY_THEME } from 'UICommon/theme/_controller/css/const';

describe('UICommon/theme/_controller/Loader', () => {
    const loader = new Loader();
    const themeName = 'themeName';
    const firstName = 'Root';
    const lastName = 'control';
    const mod = 'modificaton';
    describe('getHref', () => {
        it('Не меняет путь, содержащий .css (загрузка rt-пакетов)', () => {
            const link = 'some/style.css';
            assert.include(loader.getHref(link, themeName), link);
        });

        it('Разрешает путь до темизированных стилей', () => {
            assert.include(
                loader.getHref(`${firstName}/${lastName}`, themeName),
                `${firstName}-${themeName}-theme/${lastName}.css`
            );
        });
        it('Разрешает путь до темизированных стилей с модификацией', () => {
            assert.include(
                loader.getHref(
                    `${firstName}/${lastName}`,
                    `${themeName}__${mod}`
                ),
                `${firstName}-${themeName}-theme/${mod}/${lastName}.css`
            );
        });
        it('Разрешает путь до нетемизированных стилей', () => {
            assert.include(
                loader.getHref(`${firstName}/${lastName}`, EMPTY_THEME),
                `${firstName}/${lastName}.css`
            );
        });
    });
});
