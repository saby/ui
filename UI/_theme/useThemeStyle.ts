/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import { useLayoutEffect, useRef, CSSProperties } from 'react';
import { Body as BodyAPI, Head as HeadAPI } from 'Application/Page';
import { useThemeEffect } from './useThemeEffect';


const BACKGROUND_BODY_CLASS = 'ui-Theme__backgroundviewer';

/**
 * Хук, который формирует style для фона или вставляет класс на body с фоном.
 * @param style объект со стилями для React-компонентов
 * @param isUpperScope самый ли верхний уровень компонента фона
 * @private
 */
export function useThemeStyleBackground(
    style: CSSProperties | undefined,
    isUpperScope: boolean
): CSSProperties | undefined {
    const styleTag = useRef<string>();
    
    useThemeEffect(() => {
        if (!isUpperScope || !style) {
            return;
        }
        
        BodyAPI.getInstance().addClass(BACKGROUND_BODY_CLASS);
        
        const lines = [['background-position', 'top center']].concat(Object.entries(style).filter(([key]) => key.includes('background') || key === 'filter'), [
            ['content', '\'\''],
            ['display', 'block'],
            ['position', 'fixed'],
            ['width', '100%'],
            ['height', '100%'],
            ['z-index', '-1'],
        ])
            .map( 
                ([key, value]) =>
                    `${key.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase()}: ${value}; `
            )
            .join('');
        styleTag.current = HeadAPI.getInstance().createTag('style', {}, `.${BACKGROUND_BODY_CLASS}::before { ${lines} }`);
    }, [style]);
    
    useLayoutEffect(() => {
        return () => {
            if (isUpperScope) {
                BodyAPI.getInstance().removeClass(BACKGROUND_BODY_CLASS);
            }
            if (styleTag.current) {
                HeadAPI.getInstance().deleteTag(styleTag.current);
            }
        }
    }, [isUpperScope]);
    
    if (!isUpperScope) {
        return style;
    }
    
    return;
}
