/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import { useLayoutEffect, useRef, CSSProperties } from 'react';
import { Body as BodyAPI, Head as HeadAPI } from 'Application/Page';
import { useThemeEffect } from './useThemeEffect';
import { default as generateUniqueID } from './ThemeIDGenerator';

const BACKGROUND_CLASS_PREFIX = 'ui-Theme__backgroundviewer-';

export function useThemeBeforeStyleBackground(
    style: CSSProperties | undefined,
    isUpperScope: boolean
): string | undefined {
    const className = generateUniqueID(style || {}, BACKGROUND_CLASS_PREFIX);
    const styleTag = useRef<string>();

    useThemeEffect(() => {
        if (isUpperScope || !style) {
            return;
        }

        const lines = Object.entries(style)
            .filter(([key]) => key.includes('background') || key === 'filter')
            .concat([
                ['content', "''"],
                ['display', 'block'],
                ['position', 'absolute'],
                ['inset', '0'],
                ['z-index', -1],
            ])
            .map(
                ([key, value]) =>
                    `${key.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase()}: ${value}; `
            )
            .join('');
        styleTag.current = HeadAPI.getInstance().createTag(
            'style',
            {},
            `.${className}::before { ${lines} }`
        );
    }, [style]);

    useLayoutEffect(() => {
        return () => {
            BodyAPI.getInstance().removeClass(className);
            if (styleTag.current) {
                HeadAPI.getInstance().deleteTag(styleTag.current);
            }
        };
    }, []);

    if (!style || isUpperScope) {
        return;
    }

    const relevantStyles = Object.entries(style).filter(([key]) =>
        [
            'background',
            'backgroundImage',
            'backgroundSize',
            'backgroundPosition',
            'backgroundRepeat',
            'filter',
        ].includes(key)
    );

    if (relevantStyles.length === 0) {
        return;
    }

    return className;
}
