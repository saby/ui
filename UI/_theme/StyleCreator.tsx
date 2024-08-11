type TFontFamily = string;
type TFontSize = string; //число+ед измерения
type TTextColor = string; //значение или ссылка на другой цвет
type TFontWeight = 'bold' | 'normal';
type TFontStyle = 'italic' | 'normal';
type TTextDecoration = 'underline' | 'line-through' | 'none';
type TTextAlign = 'left' | 'right' | 'center' | 'justify';
type TTextTransform = 'none' | 'capitalize' | 'uppercase' | 'lowercase';
type TLineHeight = string; //число + ед измерения

export interface ITextStyle {
    fontFamily: TFontFamily;
    fontSize: TFontSize;
    color: TTextColor;
    fontWeight: TFontWeight;
    fontStyle: TFontStyle;
    textDecoration: TTextDecoration;
    textAlign: TTextAlign;
    textTransform: TTextTransform;
    lineHeight: TLineHeight;
}

type TSelector = string;
export type TFontProp = Record<TSelector, Partial<ITextStyle>>;

interface IProps {
    styles: TFontProp;
}

export default function StyleCreator(props: IProps) {
    const css = Object.keys(props.styles)
        .map((style: string) => {
            return `${style} {
    ${Object.entries(props.styles[style])
        .map(
            ([key, value]) => `${key.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase()}: ${value}; `
        )
        .join('')}
}`;
        })
        .join('\n');

    return <style>{css}</style>;
}
