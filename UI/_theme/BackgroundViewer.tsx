/* eslint-disable @typescript-eslint/no-magic-numbers */
/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import type { LegacyRef, ReactNode, CSSProperties } from 'react';
import { forwardRef, cloneElement, useMemo } from 'react';
import { useThemeClassName } from './useThemeClassName';
import { isReactElement } from 'UICore/Executor';

export interface IBackground {
    /**
     * Цвет фона в RGB
     */
    background?: string;
    /**
     * Доминантный цвет фона в RGB
     * Испльзуется для градиентных фонов
     */
    dominantColorRGB?: string;
    /**
     * URL до картинки
     */
    texture?: string;
}

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
     * @name UI/Theme/IBackgroundViewer#backgroundClassName
     * @cfg {string} Имя класса для переменных фона
     */
    backgroundClassName?: string;
    /**
     * @name UI/Theme/IBackgroundViewer#onClick
     * @cfg {Function} Коллбек, который будет вызван при клике на компонент.
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
     * Создавать ли свой контейнер для фона.
     * При true, компонент ожидает что в качестве children будет корневая нода.
     */
    useChildrenContainer?: boolean;

    /**
     * если это верхний враппер, классы нужно повесить на body.
     * @private
     */
    isUpperScope?: boolean;
}

export const LIGHT_CLASS = 't-light';
export const DARK_CLASS = 't-dark';
const RED_COEFICENT = 0.2126;
const GREEN_COEFICENT = 0.7152;
const BLUE_COEFICENT = 0.0722;
const BRIGHTNESS_EDGE = 128;

/**
 * @param color цвет представленный в rgb формате #xxxxxx
 * @returns светлый цвет или тёмный
 */
export function isLight(color: string) {
    try {
        const rgb = color.slice(1);
        const red = Number('0x' + rgb.slice(0, 2));
        const green = Number('0x' + rgb.slice(2, 4));
        const blue = Number('0x' + rgb.slice(4, 6));

        const brightness = RED_COEFICENT * red + GREEN_COEFICENT * green + BLUE_COEFICENT * blue;
        return brightness > BRIGHTNESS_EDGE;
    } catch (e) {
        return true;
    }
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
    ref: LegacyRef<HTMLDivElement>
) {
    const { background, dominantColorRGB, texture } = props.background;
    const calculatedStyles = useMemo((): CSSProperties => {
        const result: CSSProperties = { ...props.style };

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
        return result;
    }, [background, texture, props.style]);

    const lightClass = props.schemeStyleLight ?? LIGHT_CLASS;
    const darkClass = props.schemeStyleDark ?? DARK_CLASS;

    const brightnessClass = useMemo(() => {
        const stringColor = dominantColorRGB || background;
        if (!stringColor || isGradient(stringColor)) {
            return lightClass;
        }
        return isLight(stringColor) ? lightClass : darkClass;
    }, [background, dominantColorRGB, lightClass, darkClass]);

    const classNames = useMemo(() => {
        const classNames = props.className ? [props.className] : [];
        if (props.backgroundClassName) {
            classNames.push(props.backgroundClassName);
        }
        if (brightnessClass.length > 0) {
            classNames.push(brightnessClass);
        }
        return classNames;
    }, [props.className, props.backgroundClassName, brightnessClass]);

    const className = useThemeClassName(classNames, props.isUpperScope ?? false);

    if (props.useChildrenContainer && isReactElement(props.children)) {
        const childrenContainerClassList = [];
        const childrenClassName =
            isReactElement(props.children) && props.children.props.className
                ? props.children.props.className
                : '';
        if (childrenClassName?.length > 0) {
            childrenContainerClassList.push(childrenClassName);
        }
        childrenContainerClassList.push(className);

        return cloneElement(props.children, {
            ref,
            style: calculatedStyles,
            className: childrenContainerClassList.join(' '),
            onClick: props.onClick,
        });
    }

    return (
        <div ref={ref} style={calculatedStyles} className={className} onClick={props.onClick}>
            {props.children}
        </div>
    );
});
