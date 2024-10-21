/**
 * Интерфейс IEffects
 * @public
 */

export type TPosition = 'auto' | 'cover' | 'contain' | 'repeat' | 'coverMin' | 'containMin';

export interface IEffects {
    /**
     * @cfg {Number} Прозрачность картинки в процентах.
     */
    opacity?: number;
    /**
     * @cfg {Number} Размытие картинки в пикселях(от 1 до 5).
     */
    blur?: number;
    /**
     * @cfg {Number} Температура картинки в условных единицах.
     */
    temperature?: number;
    /**
     * @cfg {Number} Контраст картинки в процентах.
     */
    contrast?: number;
    /**
     * @cfg {Number} Насыщенность картинки в процентах(от 0 до 200).
     */
    saturate?: number;
    /**
     * @cfg {String} Положение картинки.
     * @variant auto
     * @variant cover
     * @variant contain
     * @variant repeat
     * @default auto
     */
    position?: TPosition;
}
