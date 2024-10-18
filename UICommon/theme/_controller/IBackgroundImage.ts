import { IStyle } from './IStyle';
import { IEffects, TPosition } from './IEffects';

/**
 * Интерфейс IBackgroundImage
 * @public
 */

export interface IResource {
    cropValue?: string;
    originalValue?: string;
    type: string;
    value: string;
}

export interface IBackgroundImage extends IStyle, IEffects {
    /**
     * @cfg {TSbisResource} Свойство ресурса.
     */
    resource: IResource;
    /**
     * @cfg {Date} Дата создания картинки.
     */
    date?: number;
    /**
     * @cfg {String} Название картинки.
     */
    name?: string;
    /**
     * @cfg {Number} Размер картинки в байтах.
     */
    size?: number;
    /**
     * @cfg {String} Доминантный цвет картинки.
     */
    dominantColor?: string;
    cropDominantColor?: string;
    originalDominantColor?: string;
    stylePosition?: TPosition;
}
