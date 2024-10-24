import { TThemePropertiesObject } from 'UICommon/theme/controller';

// https://git.sbis.ru/sbis/engine/-/blob/rc-24.3100/client/ExtControls/_brandbook/Wrapper.ts?ref_type=heads#L193
function addPreviewerToUrl(url: string, isLogo?: boolean): string {
    if (!url?.length) {
        return '';
    }

    // Хост в ссылке
    const hostRegexp = /^(https?:\/\/[^\/]+\/)/;

    // Наличие previewer в ссылке
    const hasPreviewerRegexp = /^(https?:\/\/[^\/]+)?\/previewer\//;

    // Наличие cdn в ссылке
    const urlContainsCdn = /^(https?:\/\/[^\/]+)?\/cdn\//;

    // Если ссылка уже содержит previewer или cdn, возвращаем без изменений
    if (hasPreviewerRegexp.test(url) || urlContainsCdn.test(url)) {
        return url;
    }

    // Добавляем previewer в начало относительной ссылки
    // если это логотип, то устанавливаем размеры картинки по ширине и высоте в 100px
    // чтобы изначально большая картинка не выглядела плохо в логотипе
    if (!url.match(hostRegexp)) {
        return isLogo ? '/previewer/r/100/100/' + url : '/previewer' + url;
    }

    // Добавляем previewer после доменного имени в url
    return url.replace(hostRegexp, isLogo ? '$1previewer/r/100/100/' : '$1previewer/');
}

const gradientFirstColorRegExp = /(#\w+)|((rgb|rgba|hsl|hsla|var)\([^)]+\))/;
export function getFirstColor(background: string): string | undefined {
    return background.match(gradientFirstColorRegExp)?.[0];
}

/**
 * TODO Перейти на единий механизм формирования стиля на контейнер
 */
export function calculateVaribalesFromThemeProperties(
    themeProperties: TThemePropertiesObject
): object | undefined {
    const { background, url_full: urlFull, logo, picture, texture } = { ...themeProperties };

    // Используем абсолютные пути, если они есть:
    const pictureUrl =
        picture?.url && urlFull?.picture?.includes(picture?.url) ? urlFull.picture : picture?.url;
    const logoUrl = logo?.url && urlFull?.logo?.includes(logo?.url) ? urlFull.logo : logo?.url;
    const textureUrl = texture && urlFull?.texture?.includes(texture) ? urlFull.texture : texture;
    const isGradient =
        !!background &&
        (background.indexOf('linear') !== -1 || background.indexOf('radial') !== -1);

    const styleObj: Record<string, string> = {};

    if (background) {
        styleObj['--brandbook_background-color'] = background;
        /*
        После явного задания background-color в BackgroundViewer в этой переменной нет необходимости, но есть вред.
        Пока закомментирую, если всё ок - в 5000 удалю.
        const unaccentedBackground = isGradient ? getFirstColor(background) : background;
        if (unaccentedBackground) {
            styleObj['--unaccented_background-color'] = unaccentedBackground;
        }
        */
    }

    const bgImgTexturePart = textureUrl ? `url("${textureUrl}")` : '';
    const bgImgGradientPart = isGradient ? background : '';
    const bgImgSeparatorPart = bgImgTexturePart.length && bgImgGradientPart.length ? ', ' : '';
    const backGroundImage = `${bgImgTexturePart}${bgImgSeparatorPart}${bgImgGradientPart}`;
    if (backGroundImage) {
        styleObj['--brandbook_background-image'] = backGroundImage;
    }

    if (pictureUrl) {
        styleObj['--brandbook_picture-url'] = `url("${addPreviewerToUrl(pictureUrl)}");`;
    }

    if (logoUrl) {
        styleObj['--brandbook_logo-url'] = `url("${addPreviewerToUrl(logoUrl, true)}");`;
    }

    return Object.keys(styleObj).length > 0 ? styleObj : undefined;
}
