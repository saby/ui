/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import { forwardRef, LegacyRef, ReactNode, CSSProperties, useMemo } from 'react';

export interface IBackground {
    color?: string;
    url?: string;
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
     * @name UI/Theme/IBackgroundViewer#onClick
     * @cfg {Function} Коллбек, который будет вызван при клике на компонент.
     */
    onClick?: () => void;
    /**
     * @name UI/Theme/IBackgroundViewer#style
     * @cfg {object} Стилевые опции.
     */
    style?: CSSProperties;
}

function isGradient(strValue: string | undefined): boolean {
    return !!strValue && (strValue.indexOf('linear') !== -1 || strValue.indexOf('radial') !== -1);
}

/**
 * Компонент отображения фона из сервиса стилей.
 * @see ExtControls/BackgroundViewer
 * @public
 */
export default forwardRef(function BackgroundViewer(
    props: IBackgroundViewer,
    ref: LegacyRef<HTMLDivElement>
) {
    const calculatedStyles = useMemo((): CSSProperties => {
        const { color, url } = props.background;
        const result: CSSProperties = { ...props.style };

        const isBackgroundGradient = isGradient(color);
        if (color) {
            if (isBackgroundGradient) {
                result.backgroundImage = color;
            } else {
                result.backgroundColor = color;
            }
        }
        if (url) {
            result.backgroundImage = `url(${url})` + `${isBackgroundGradient ? ',' + color : ''}`;
            result.backgroundRepeat = 'repeat';
            result.backgroundPosition = 'center';
        }
        return result;
    }, [props.background]);

    return (
        <div ref={ref} style={calculatedStyles} className={props.className} onClick={props.onClick}>
            {props.children}
        </div>
    );
});
