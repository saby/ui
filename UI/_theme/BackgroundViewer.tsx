/* eslint-disable @typescript-eslint/no-magic-numbers */
/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import type { Ref, ReactNode, CSSProperties } from 'react';
import { forwardRef, cloneElement, useMemo, createContext, useContext } from 'react';
import { useThemeClassName } from './useThemeClassName';
import { getFirstColor } from './background/cssVariables';
import { getStore } from 'Application/Env';
import { isReactElement } from 'UICore/Executor';
import type { IBackground } from './background/IBackground';
import type { IResource } from 'UICommon/theme/controller';


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

const BackgroundContext = createContext<IBackground | null>(null);
const BACKGROUND_VIEWER_STORE_KEY = 'uiThemeBackgroundViewer';

export const LIGHT_CLASS = 't-light';
export const DARK_CLASS = 't-dark';
const TEXT_COLOR_CLASS_NAME = 'controls_themes__wrapper';
const RED_COEFFICIENT = 0.2126;
const GREEN_COEFFICIENT = 0.7152;
const BLUE_COEFFICIENT = 0.0722;
const BRIGHTNESS_EDGE = 128;

/**
 * @param color цвет представленный в rgb формате #xxxxxx
 * @returns светлый цвет или тёмный
 */
export function isLight(color: string) {
    try {
        // dominantColorRGB приходит в формате 'r, g, b'. Хорошо бы разобраться, насколько это правильно, но пока так.
        const { red, green, blue } = getColorRGB(color);

        const brightness =
            RED_COEFFICIENT * red + GREEN_COEFFICIENT * green + BLUE_COEFFICIENT * blue;
        return brightness > BRIGHTNESS_EDGE;
    } catch (e) {
        return true;
    }
}

const rgbRegExp = /^[0-9]+, [0-9]+, [0-9]+$/;

function getColorRGB(color: string): { red: number; green: number; blue: number } {
    if (rgbRegExp.test(color)) {
        const [red, green, blue] = color.split(', ').map(Number);
        return { red, green, blue };
    }
    const rgb = color.slice(1);
    const red = Number('0x' + rgb.slice(0, 2));
    const green = Number('0x' + rgb.slice(2, 4));
    const blue = Number('0x' + rgb.slice(4, 6));
    return { red, green, blue };
}

function isGradient(strValue: string | undefined): boolean {
    return !!strValue && (strValue.indexOf('linear') !== -1 || strValue.indexOf('radial') !== -1);
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
    const upperBackground = isUpperScope
        ? null
        : backgroundFromContext || rootBackgroundStore.get('background');

    // Парадокс, надо обдумать.
    // Если окно темизируется, на него не нужно вешать стили фона. Подробнее в ленте https://online.sbis.ru/opendoc.html?guid=aa69de04-98bc-4ce5-8fdc-8d06f4da59ce&client=3
    // Но с другой стороны, вместе с классами темы нужно повесить класс световой схемы. А никто, кроме BackgroundViewer, не должен знать про эти классы.
    // Пока что сделаю так: если фон совпадает с заданным выше, повешу класс цветовой схемы, но не буду вешать стиль фона.
    // Проблемы выше это решит, но с каждым разом решения всё костыльнее.
    const shouldNotAddBackgroundStyle = useMemo(
        () => !!upperBackground && isSameBackground(upperBackground, props.background),
        [upperBackground, props.background]
    );
    const backgroundStyles = useMemo((): CSSProperties => {
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
        }

        if (!props.useChildrenContainer) {
            result.left = 0;
            result.top = 0;
            result.zIndex = -1;
        }

        return result;
    }, [background, texture, image, props.style, shouldNotAddBackgroundStyle, props.useChildrenContainer]);

    // #region calculate t-light || t-dark
    const lightClass = props.schemeStyleLight ?? LIGHT_CLASS;
    const darkClass = props.schemeStyleDark ?? DARK_CLASS;
    const stringColor = dominantColorRGB || background || image?.dominantColor;
    const brightnessClass = useMemo(() => {
        if (!stringColor) {
            return '';
        }
        if (isGradient(stringColor)) {
            const gradientFirtColor = getFirstColor(stringColor);
            if (!gradientFirtColor) {
                return lightClass;
            }
            return isLight(gradientFirtColor) ? lightClass : darkClass;
        }
        return isLight(stringColor) ? lightClass : darkClass;
    }, [stringColor, lightClass, darkClass]);
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

    let classList = useThemeClassName(classNames, isUpperScope);

    if (props.useChildrenContainer && isReactElement(props.children)) {
        let childrenContainerClassList = [];
        const childrenClassName =
            isReactElement(props.children) && props.children.props.className
                ? props.children.props.className
                : '';
        if (childrenClassName?.length > 0) {
            childrenContainerClassList.push(childrenClassName);
        }
        childrenContainerClassList = childrenContainerClassList.concat(classList);
        
        // Лучше добавлять children только те пропсы, которые действительно есть.
        // Например, onClick со значением undefined приводит к ошибке в консоль.
        const newChildrenProps: Record<string, unknown> = {
            className: childrenContainerClassList.join(' '),
        };
        
        if (ref) {
            newChildrenProps.ref = ref;
        }
        if (props.onClick) {
            newChildrenProps.onClick = props.onClick;
        }
        if (backgroundStyles) {
            newChildrenProps.style = backgroundStyles;
        }

        return (
            <BackgroundContext.Provider value={props.background}>
                {cloneElement(props.children, newChildrenProps)}
            </BackgroundContext.Provider>
        );
    }

    let className = classList.join(' ');
    if (!props.noBackground88221033455786 && !className.includes(TW_RELATIVE)) {
        className += ' ' + TW_RELATIVE;
    }

    if (!props.noBackground88221033455786 && !className.includes(TW_FULL_HEIGHT)) {
        className += ' ' + TW_FULL_HEIGHT;
    }
    let backgroundLayer = !props.noBackground88221033455786 ? <div className="tw-absolute tw-h-full tw-w-full" style={backgroundStyles}></div> : null;
    return (
        <div ref={ref} className={className} onClick={props.onClick} style={{zIndex:0}}>
            { backgroundLayer }
            <BackgroundContext.Provider value={props.background}>
                { props.children }
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
