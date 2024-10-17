import type { IBackgroundImage } from 'UICommon/theme/controller';

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
    /**
     * @cfg {IImage} Конфигурация выбранной картинки.
     */
    image?: IBackgroundImage;
}
