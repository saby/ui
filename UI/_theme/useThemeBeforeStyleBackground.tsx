/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import { useLayoutEffect, CSSProperties } from 'react';
import { Body as BodyAPI, Head as HeadAPI } from 'Application/Page';
import { useThemeEffect } from './useThemeEffect';
import { default as generateUniqueID } from './ThemeIDGenerator';

const BACKGROUND_CLASS_PREFIX = 'ui-Theme__backgroundviewer-';
const RELEVANT_STYLE_KEYS = [
    'background',
    'backgroundAttachment',
    'backgroundBlendMode',
    'backgroundClip',
    // 'backgroundColor', когда создавали доп слой backgroundColor не влияил на dnd, а с ::before влияет
    'backgroundImage',
    'backgroundOrigin',
    'backgroundPosition',
    'backgroundPositionX',
    'backgroundPositionY',
    'backgroundRepeat',
    'backgroundSize',
    'filter',
    'border',
    'borderWidth',
    'borderStyle',
    'borderColor',
    'borderRadius',
    'borderTop',
    'borderRight',
    'borderBottom',
    'borderLeft',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderTopStyle',
    'borderRightStyle',
    'borderBottomStyle',
    'borderLeftStyle',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
];

// надо следить за количеством BackgroundViewer, которые используют один класс
// удалять надо, только когда никто его больше не использует
const styleRegistry = new Map<string, { count: number; tagId: string; lines: string }>();

export function useThemeBeforeStyleBackground(
    style: CSSProperties | undefined,
    isUpperScope: boolean
): string | undefined {
    const className = generateUniqueID(style || {}, BACKGROUND_CLASS_PREFIX);

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

        const headInstance = HeadAPI.getInstance();
        const entry = styleRegistry.get(className);
        if (entry) {
            if (entry.lines !== lines) {
                headInstance.deleteTag(entry.tagId);
                const newTagId = headInstance.createTag(
                    'style',
                    {},
                    `.${className}::before { ${lines} }`
                );
                entry.tagId = newTagId;
                entry.lines = lines;
            }
            entry.count++;
        } else {
            const tagId = headInstance.createTag('style', {}, `.${className}::before { ${lines} }`);
            styleRegistry.set(className, { count: 1, tagId, lines });
        }
    }, [style]);

    useLayoutEffect(() => {
        return () => {
            BodyAPI.getInstance().removeClass(className);
            const headInstance = HeadAPI.getInstance();
            const entry = styleRegistry.get(className);

            if (!entry) {
                return;
            }

            entry.count--;
            if (entry.count === 0) {
                headInstance.deleteTag(entry.tagId);
                styleRegistry.delete(className);
            }
        };
    }, [className, style]);

    if (!style || isUpperScope) {
        return;
    }

    const relevantStyles = Object.entries(style).filter(([key]) =>
        RELEVANT_STYLE_KEYS.includes(key)
    );

    if (relevantStyles.length === 0) {
        return;
    }

    return className;
}
