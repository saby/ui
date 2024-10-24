/**
 * Интерфейс IStyle
 * @public
 */

export interface IStyle {
    /**
     * @cfg {TStyle} Стиль картинки.
     */
    style: {
        type: TStyleType;
        value: string;
    };
}
/**
 * @typedef TStyle
 * @property {TStyleTypeVariant} type Тип стиля.
 * @property {String} value Значение стиля.
 */

export type TStyleType =
    | 'original'
    | 'horizontalGradient'
    | 'verticalGradient'
    | 'blackout'
    | 'brightening';
/**
 * @typedef TStyleTypeVariant
 * @property {String} original Без стиля.
 * @property {String} horizontalGradient Горизонтальный градиент.
 * @property {String} verticalGradient Вертикальный градиент.
 * @property {String} blackout Затемнение.
 * @property {String} brightening Осветление.
 */
