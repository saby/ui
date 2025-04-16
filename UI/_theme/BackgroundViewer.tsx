/* eslint-disable @typescript-eslint/no-magic-numbers */
/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import type { Ref, ReactNode, CSSProperties } from 'react';
import { forwardRef, useMemo, useContext } from 'react';
import type { IBackground } from './background/IBackground';
import type { IResource, IBackgroundImage } from 'UICommon/theme/controller';
import { getStore } from 'Application/Env';
import { isReactElement } from 'UICore/Executor';
import { useThemeStyleBackground } from 'UI/_theme/useThemeStyle';
import { useThemeClassName } from './useThemeClassName';
import { getFirstColor } from './background/cssVariables';
import { useThemeBeforeStyleBackground } from './useThemeBeforeStyleBackground';
import { default as ChildrenContainer } from './_backgroundViewer/ChildrenContainer';
import { BackgroundContext } from './_backgroundViewer/Context';

const TW_FULL_HEIGHT = 'tw-h-full';
const TW_RELATIVE = 'tw-relative';
export interface IBackgroundViewer {
    /**
     * @name UI/Theme/IBackgroundViewer#background
     * @cfg {ExtControls/richColorPicker:IBackground} Объект конфигурации фона.
     */
    background: IBackground;
    /**
     * @name UI/Theme/IBackgroundViewer#children
     * @cfg {ReactNode} Контент для компонента.
     */
    children?: ReactNode;
    /**
     * @name UI/Theme/IBackgroundViewer#className
     * @cfg {string} Имя класса.
     */
    className?: string;
    /**
     * @name UI/Theme/IBackgroundViewer#themeStyleSelector
     * @cfg {string} Селектор стиля с переменными темы
     */
    themeStyleSelector?: string;
    /**
     * Коллбек, который будет вызван при клике на компонент.
     * @function UI/Theme/IBackgroundViewer#onClick
     * @public
     * @return {void}
     */
    onClick?: () => void;
    /**
     * @name UI/Theme/IBackgroundViewer#style
     * @cfg {object} Стилевые опции.
     */
    style?: CSSProperties;
    /**
     * имя стиля для светлой темы
     */
    schemeStyleLight?: string;
    /**
     * имя стиля для темной темы
     */
    schemeStyleDark?: string;
    /**
     * Создавать ли свой DIV для фона.
     * При true, компонент ожидает что в качестве children будет корневая нода.
     */
    useChildrenContainer?: boolean;
    /**
     * если это верхний враппер, классы нужно повесить на body.
     * FIXME перенести в ThemeBackground
     * @private
     */
    isUpperScope?: boolean;
    /**
     * в popup не внедрено отображение фона
     *  https://online.sbis.ru/opendoc.html?guid=db38d223-4ea4-4f25-bcf8-e8d8658f7a54&client=3
     * @private
     */
    noBackground88221033455786?: boolean;
}

const BACKGROUND_VIEWER_STORE_KEY = 'uiThemeBackgroundViewer';

export const LIGHT_CLASS = 't-light';
export const DARK_CLASS = 't-dark';
const TEXT_COLOR_CLASS_NAME = 'controls_themes__wrapper';
const RED_COEFFICIENT = 0.2126;
const GREEN_COEFFICIENT = 0.7152;
const BLUE_COEFFICIENT = 0.0722;
const BRIGHTNESS_EDGE = 128;
const DEFAULT_LIGHT_DOMINANT_VALUE = '255, 255, 255';
const DEFAULT_DARK_DOMINANT_VALUE = '0, 0, 0';
const OPACITY_THRESHOLD = 0.5;
const OPACITY_FULL = 1;

const rgbRegExp = /^[0-9]+, [0-9]+, [0-9]+$/;
const rgbRegWithOpacityExp = /^[0-9]+, [0-9]+, [0-9]+, [0-9]+$/;
const hexRegExp = /^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
const rgbaRegExp = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*[\d.]+\s*)?\)$/;
const gradientRegExp =
    /(#[0-9A-Fa-f]{3,8}|rgb(a)?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*\d*\.?\d+)?\s*\))/;
const hexWithOpacityRegExp = /#[0-9a-fA-F]{8}/;

/**
 * @param color цвет представленный в rgba формате #RRGGBBAA
 * @returns значение прозрачности
 */
function getOpacity(color: string) {
    // Ищем HEX-цвет с альфа-каналом в строке, ищем только 8-символьный HEX (#RRGGBBAA)
    const hexWithAlpha = color.match(hexWithOpacityRegExp);
    if (!hexWithAlpha) {
        return 1;
    }
    // Извлекаем альфа-канал (последние 2 символа)
    const alphaHex = hexWithAlpha[0].slice(-2);
    // Переводим HEX альфа-канала в десятичное число
    const alphaDecimal = parseInt(alphaHex, 16);
    // Вычисляем прозрачность в процентах
    return Math.round((alphaDecimal / 255) * 100) / 100;
}

/**
 * Функция для определения цветовой схемы по hex
 * @param color цвет представленный в rgb формате #xxxxxx
 * @param effect
 * @param strength
 * @param hasRootBG определяем цвет для корневого фона или нет
 * @returns светлый цвет или тёмный
 */
export function isLight(
    color: string,
    effect?: IBackgroundImage['style']['type'],
    strength?: number,
    hasRootBG: boolean = true
) {
    try {
        // dominantColorRGB приходит в формате 'r, g, b'. Хорошо бы разобраться, насколько это правильно, но пока так.
        const { red, green, blue, opacity } = getColorRGB(color);
        let brightness =
            RED_COEFFICIENT * red + GREEN_COEFFICIENT * green + BLUE_COEFFICIENT * blue;
        if (effect === 'brightening' && typeof strength === 'number') {
            brightness = brightness * (1 - strength) + strength * 255;
        } else if (effect === 'blackout' && typeof strength === 'number') {
            brightness = brightness * (1 - strength);
        }
        const roundedBrightness = Math.round(brightness);
        // если мы определяем цветность на корне, не надо учитывать прозрачность,
        // т.к. фон могу сделать полностью прозрачным и мы будем считать его темным
        if (!hasRootBG) {
            return roundedBrightness > BRIGHTNESS_EDGE;
        }
        if (roundedBrightness > BRIGHTNESS_EDGE) {
            // это значит что сам цвет - светлый без учета прозрачности
            return roundedBrightness * opacity > BRIGHTNESS_EDGE;
        }
        return roundedBrightness * opacity + (1 - opacity) * 255 > BRIGHTNESS_EDGE;
    } catch (e) {
        return true;
    }
}

/**
 * Функция извлечения каждого цветового канала + альфа канала из строки
 * @param color цвет представленный в rgb или hex
 * @returns объект {red, green, blue, opacity}
 */
function getColorRGB(color: string): { red: number; green: number; blue: number; opacity: number } {
    // извлекаем цвет из формата "255, 255, 255"
    if (rgbRegExp.test(color)) {
        const [red, green, blue, opacity = 1] = color.split(', ').map(Number);
        return { red, green, blue, opacity };
    }
    // извлекаем цвет из формата "255, 255, 255, 1"
    if (rgbRegWithOpacityExp.test(color)) {
        const [red, green, blue, opacity = 1] = color.split(', ').map(Number);
        return { red, green, blue, opacity };
    }

    // извлекаем цвет из формата "rgb(255, 255, 255)"
    if (rgbaRegExp.test(color)) {
        const [red, green, blue, opacity = 1] = color.match(/\d+/g) as string[];
        return {
            red: Number(red),
            green: Number(green),
            blue: Number(blue),
            opacity: Number(opacity),
        };
    }

    // извлекаем цвет из формата "#ffffff" или "#ffffff00"
    const rgb = color.slice(1);
    const red = Number('0x' + rgb.slice(0, 2));
    const green = Number('0x' + rgb.slice(2, 4));
    const blue = Number('0x' + rgb.slice(4, 6));
    const opacity = getOpacity(color);
    return { red, green, blue, opacity };
}

/**
 * Функция для проверки строки является ли градиентом
 * @param color строка для проверки
 * @returns  возвращает true - если цвет градиент
 * @private
 */
function isGradient(color: string | undefined): boolean {
    return !!color && (color.startsWith('linear-gradient') || color.startsWith('radial-gradient'));
}

/**
 * Функция для проверки строки является ли она hex или rgb цветом
 * @param strValue строка для проверки
 * @returns возвращает true - если цвет валидный
 * @private
 */
function isHexOrRGBColor(strValue: string | undefined): strValue is string {
    if (!strValue || typeof strValue !== 'string') {
        return false;
    }
    // проверяем только на hex и rgba, но есть еще hls, но мы его все равно не разбрерм в getColorRGB
    // цвет почемуто передают в разных форматах
    // hex: #ffffff или #ffffff00
    // rgb: rgb(255, 255, 255) или rbg(255, 255, 255, 0.5) или 255, 255, 255
    // пока поддержим все форматы, но вообще последний rgb странный
    return (
        hexRegExp.test(strValue) ||
        rgbaRegExp.test(strValue) ||
        rgbRegExp.test(strValue) ||
        rgbRegWithOpacityExp.test(strValue)
    );
}

/**
 * Функция для извлечения основного цвета градиента
 * @param color цвет
 * @returns строка с извлеченом цветом или оригинальная строка
 * @private
 */
function getFirstColorFromGradient(color: string): string {
    if (color.startsWith('linear-gradient') || color.startsWith('radial-gradient')) {
        const match = color.match(gradientRegExp);
        return match ? match[0] : color;
    }
    return color;
}

/**
 * Функция для рассчета доминантного цвета, когда цвет фона в схеме и доминантынй отличаются
 * @param isLightTheme текущая цветовая схема
 * @param stringColor доминантный цвет в hex формате
 * @param themeOpacity значение прозрачности текущего фона
 * @param backgroundFromContext значение из контекта
 * @returns строка с рассчитаным доминантным цветом
 * @private
 */
function getDominantColor(
    isLightTheme: boolean,
    stringColor: string = '',
    themeOpacity: number = 1,
    backgroundFromContext: IBackground | null
) {
    // нет доминантного цвета, смотрим есть ли в контексте
    if (!stringColor) {
        return backgroundFromContext?.dominantColorRGB ?? stringColor;
    }

    // если нет контекста, то считаем фон рутовым, может быть надо на проп isUpperScore смотреть, но его почему то нет
    const isRootBackground = !!backgroundFromContext;
    // определяем цветность доминантного цвета
    const isStringColorLight = isLight(stringColor, undefined, undefined, isRootBackground);
    // проверяем прозрачность текущего фона
    const isNoOpacity = themeOpacity === OPACITY_FULL;

    // цветность фона и доминанта совпали, нет прозрачности и мы не рут
    if (isStringColorLight === isLightTheme && (isNoOpacity || !isRootBackground)) {
        return stringColor;
    }

    // мы рутовый фон
    if (!isRootBackground) {
        // если текущий фон не прозрачен, то зависим только от его цветности
        if (isNoOpacity) {
            return isLightTheme ? DEFAULT_LIGHT_DOMINANT_VALUE : DEFAULT_DARK_DOMINANT_VALUE;
        }
        // для прозранчого форна нам надо проверить соответтсвие цветности текущего фона и доминанта
        if (themeOpacity < OPACITY_FULL && isLightTheme !== isStringColorLight) {
            return isLightTheme ? DEFAULT_DARK_DOMINANT_VALUE : DEFAULT_LIGHT_DOMINANT_VALUE;
        }
    }

    // мы не рут и прозранчые
    if (themeOpacity < OPACITY_THRESHOLD) {
        // для прозрачного фона менее 50% смотри какая цветность фона в контексте
        return backgroundFromContext?.isLigthTheme
            ? DEFAULT_LIGHT_DOMINANT_VALUE
            : DEFAULT_DARK_DOMINANT_VALUE;
    }
    if (themeOpacity >= OPACITY_THRESHOLD && themeOpacity < OPACITY_FULL) {
        // для прозрачного фона более 50% смотри какая цветность у фона
        return isLightTheme ? DEFAULT_LIGHT_DOMINANT_VALUE : DEFAULT_DARK_DOMINANT_VALUE;
    }

    // смотрим если ли доминантый цвет в контексте, если есть и цветности противоречят, то возьмем за основу значение из контекста
    // вообще не уверен что это правильно
    const bgDominantColor = backgroundFromContext?.dominantColorRGB;
    if (
        bgDominantColor &&
        isLightTheme === backgroundFromContext.isLigthTheme &&
        isLight(bgDominantColor) !== isStringColorLight
    ) {
        return bgDominantColor;
    }

    // если ничего не поняли то вернем доминатный цвет
    return stringColor;
}

/**
 * Компонент создания фона для области
 * @see ExtControls/BackgroundViewer
 * @public
 */
export default forwardRef(function BackgroundViewer(
    props: IBackgroundViewer,
    ref: Ref<HTMLDivElement>
) {
    const { dominantColorRGB, texture, image } = props.background;
    const background = props.background.background ?? props.background.backgroundColor;
    const isUpperScope = props.isUpperScope ?? false;
    const backgroundFromContext = useContext(BackgroundContext);
    const rootBackgroundStore = getStore<IBackgroundViewer>(BACKGROUND_VIEWER_STORE_KEY);
    if (isUpperScope) {
        rootBackgroundStore.set('background', props.background);
    }

    const effectStrength = useMemo(() => {
        let alpha = 0;
        if (image?.style?.type === 'blackout' || image?.style?.type === 'brightening') {
            alpha = getOpacity(image.style.value);
        }
        return alpha;
    }, [image]);

    const upperBackground = isUpperScope
        ? null
        : backgroundFromContext || rootBackgroundStore.get('background');

    // определяем текущую цветовую схему, по-умолчанию считаем цветовую схему светлой
    // надо учесть есть ли реальный фон, если фона нет, то взять значение цветовой схемы из контекста
    // если фон есть, то надо проверить не явялется ли он градиентом,
    // для градиента расчитываем по доминантному цвету (должен приходить сверху)
    // если доминантного цвета нет, то рассчитываем схему на основе первого значения цвета градиента
    // если получили "нормальный" цвет, надо проверить его на валидность, что строка это или rgb или hex
    // если цвет валидный, то пытаемся рассчитать светлый он или темный
    const [isLightScheme, opacityValue] = useMemo(() => {
        const color = background ?? backgroundFromContext?.background;
        const opacity = getOpacity(color ?? '');

        let baseColor: string | undefined = color || dominantColorRGB;
        const isGradientColor = isGradient(color);

        if (color && isGradientColor) {
            baseColor = getFirstColorFromGradient(color);
        }

        if (!isGradientColor && !isHexOrRGBColor(baseColor)) {
            return [backgroundFromContext?.isLigthTheme ?? true, opacity];
        }

        const dominantColor: string =
            dominantColorRGB ?? backgroundFromContext?.dominantColorRGB ?? '';
        const backColor: string = isGradientColor ? dominantColor : (baseColor as string);
        const _isLightScheme = isLight(backColor, undefined, undefined, !!backgroundFromContext);

        const stringColor = getDominantColor(
            _isLightScheme,
            dominantColorRGB || background || image?.dominantColor,
            opacity,
            backgroundFromContext
        );

        return [stringColor ? isLight(stringColor) : _isLightScheme, opacity];
    }, [background, backgroundFromContext, dominantColorRGB, image]);
    // Парадокс, надо обдумать.
    // Если окно темизируется, на него не нужно вешать стили фона. Подробнее в ленте https://online.sbis.ru/opendoc.html?guid=aa69de04-98bc-4ce5-8fdc-8d06f4da59ce&client=3
    // Но с другой стороны, вместе с классами темы нужно повесить класс световой схемы. А никто, кроме BackgroundViewer, не должен знать про эти классы.
    // Пока что сделаю так: если фон совпадает с заданным выше, повешу класс цветовой схемы, но не буду вешать стиль фона.
    // Проблемы выше это решит, но с каждым разом решения всё костыльнее.
    const shouldNotAddBackgroundStyle = useMemo(
        () => !!upperBackground && isSameBackground(upperBackground, props.background),
        [upperBackground, props.background]
    );
    let backgroundStyles: CSSProperties | undefined = useMemo((): CSSProperties => {
        const result: CSSProperties = { ...props.style };
        if (shouldNotAddBackgroundStyle) {
            return result;
        }

        const isBackgroundGradient = isGradient(background);
        if (background) {
            if (isBackgroundGradient) {
                result.backgroundImage = background;
            } else {
                result.backgroundColor = background;
            }
        }
        if (texture) {
            result.backgroundImage =
                `url(${texture})` + `${isBackgroundGradient ? ',' + background : ''}`;
            result.backgroundRepeat = 'repeat';
            result.backgroundPosition = 'center';
        }
        if (image) {
            const url = getResourceUrl(image.resource);
            const gradient =
                (image.style?.type && image.style.type !== 'original' && image.style.value) ||
                (isBackgroundGradient && background);
            result.backgroundImage = (gradient ? gradient + ', ' : '') + `url(${url})`;

            if (image.position === 'repeat') {
                result.backgroundSize = getActualValue('contain', 'position');
                result.backgroundRepeat = 'repeat';
            } else {
                result.backgroundSize = getActualValue(image.position, 'position');
            }
            result.filter =
                `opacity(${getActualValue(image.opacity, 'opacity')}%)` +
                ` blur(${getActualValue(image.blur, 'blur')}px)` +
                ` hue-rotate(${getActualTemperature(image.temperature)}deg)` +
                ` contrast(${getActualValue(image.contrast, 'contrast')}%)` +
                ` saturate(${getActualValue(image.saturate, 'saturate')}%)`;

            result.backgroundPosition = 'top center';
        }

        result.left = 0;
        result.top = 0;
        result.zIndex = -1;

        return result;
    }, [background, texture, image, props.style, shouldNotAddBackgroundStyle]);

    backgroundStyles = useThemeStyleBackground(backgroundStyles, isUpperScope);
    const backgroundStylesClassName = useThemeBeforeStyleBackground(backgroundStyles, isUpperScope);

    // #region calculate t-light || t-dark
    const lightClass = props.schemeStyleLight ?? LIGHT_CLASS;
    const darkClass = props.schemeStyleDark ?? DARK_CLASS;
    const stringColor = getDominantColor(
        isLightScheme,
        dominantColorRGB || background || image?.dominantColor,
        opacityValue,
        backgroundFromContext
    );
    const brightnessClass = useMemo(() => {
        if (!stringColor) {
            return '';
        }
        if (isGradient(stringColor)) {
            const gradientFirtColor = getFirstColor(stringColor);
            if (!gradientFirtColor) {
                return lightClass;
            }
            return isLight(
                gradientFirtColor,
                image?.style?.type,
                effectStrength,
                !!backgroundFromContext
            )
                ? lightClass
                : darkClass;
        }
        return isLight(stringColor, image?.style?.type, effectStrength, !!backgroundFromContext)
            ? lightClass
            : darkClass;
    }, [stringColor, lightClass, darkClass, image]);
    // #endregion

    const classNames = useMemo(() => {
        const result = props.className ? [props.className] : [];
        if (props.themeStyleSelector) {
            result.push(props.themeStyleSelector);
        }
        if (brightnessClass.length > 0) {
            result.push(brightnessClass);
            if (!props.className?.includes(TEXT_COLOR_CLASS_NAME)) {
                result.push(TEXT_COLOR_CLASS_NAME);
            }
        }
        return result;
    }, [props.className, props.themeStyleSelector, brightnessClass]);

    const classList = useThemeClassName(classNames, isUpperScope);

    const backgroundContextValue = useMemo(() => {
        return {
            ...props.background,
            isLigthTheme: isLightScheme,
        };
    }, [props.background, isLightScheme]);

    if (props.noBackground88221033455786) {
        // в случае построения окна надо повесить все классы, которые могут передать от ThemeBackground
        // но не надо применять стили фона с ::before, т.к. они могут влиять на отображение окон
        return (
            <div ref={ref} className={classList.join('')} onClick={props.onClick}>
                <BackgroundContext.Provider value={backgroundContextValue}>
                    {props.children}
                </BackgroundContext.Provider>
            </div>
        );
    }
    if (props.useChildrenContainer && isReactElement(props.children)) {
        return (
            <ChildrenContainer
                children={props.children}
                classList={classList}
                backgroundContextValue={backgroundContextValue}
                onClick={props.onClick}
                backgroundStyles={backgroundStyles}
                backgroundStylesClassName={backgroundStylesClassName}
            />
        );
    }

    let className = classList.join(' ');
    if (!className.includes(TW_RELATIVE)) {
        className += ' ' + TW_RELATIVE;
    }

    if (!className.includes(TW_FULL_HEIGHT)) {
        className += ' ' + TW_FULL_HEIGHT;
    }

    // это в 3100 надо удалять, но сначала обсдуить как должно выглядить повдеение dnd
    const backgroundLayer = !!backgroundStyles ? (
        <div className="tw-absolute tw-h-full tw-w-full" style={backgroundStyles}></div>
    ) : null;

    if (backgroundStylesClassName) {
        className += ' ' + backgroundStylesClassName;
        backgroundStyles = {};
    }
    return (
        <div ref={ref} className={className} onClick={props.onClick} style={{ zIndex: 0 }}>
            {backgroundLayer}
            <BackgroundContext.Provider value={backgroundContextValue}>
                {props.children}
            </BackgroundContext.Provider>
        </div>
    );
});

const backgroundKeys: (keyof IBackground)[] = [
    'background',
    'backgroundColor',
    'dominantColorRGB',
    'image',
    'texture',
];

function isSameBackground(firstBackground: IBackground, secondBackground: IBackground): boolean {
    for (const key of backgroundKeys) {
        if (firstBackground[key] !== secondBackground[key]) {
            return false;
        }
    }
    return true;
}

const SBIS_DISK_RESOURCE = 'sbisDisk';
const PREVIEWER = '/previewer/cache';
const DISK_URL = '/disk/api/v1/';

function getResourceUrl(resource: IResource): string {
    if (resource.type === SBIS_DISK_RESOURCE) {
        return `${PREVIEWER}${DISK_URL}${resource.value}`;
    }
    return resource.value;
}

const PERCENT = 100;

type TValueType = 'blur' | 'opacity' | 'contrast' | 'saturate' | 'position';

function getActualValue(
    value: number | string | undefined | null,
    type: TValueType
): string | number {
    if (value !== undefined && value !== null) {
        return value;
    }
    if (type === 'blur') {
        return 0;
    }
    if (type === 'position') {
        return 'cover';
    }
    return PERCENT;
}

function getActualTemperature(value: number | undefined | null): number {
    if (value === undefined || value === 0 || value === null) {
        return 0;
    }
    if (value > 0) {
        return value;
    }
    return 180 + Math.abs(value);
}
