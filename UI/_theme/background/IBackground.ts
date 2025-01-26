/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import type { IBackgroundImage } from 'UICommon/theme/controller';

export interface IBackground {
    /**
     * Цвет фона в RGB
     */
    background?: string;

    /**
     * Цвет фона в RGB, но как он задаётся в richColorPicker.
     */
    backgroundColor?: string;

    /**
     * Доминантный цвет фона в RGB
     * Испльзуется для градиентных фонов
     */
    dominantColorRGB?: string;
    /**
     * URL до картинки
     */
    texture?: string;
    /**
     * @cfg {IImage} Конфигурация выбранной картинки.
     */
    image?: IBackgroundImage;
}
