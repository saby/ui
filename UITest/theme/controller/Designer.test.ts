/* eslint-disable @typescript-eslint/ban-ts-comment */
import { generateUniqTheme, TStyleObjectRaw } from 'UI/_theme/Background';

describe('UI/Theme:Designer', () => {
    describe('generateUniqTheme', () => {
        test('формирует стабильный guidDesignTheme', () => {
            const styleObjectRaw: TStyleObjectRaw = {
                background: {
                    // @ts-ignore
                    '--brandbook_background-color': '#ffffff',
                    '--brandbook_picture-url': '#ffffff',
                    '--brandbook_background-image': 'url()',
                    '--brandbook_logo-url': 'url()',
                },
                light: { color: 'red' },
                dark: { color: 'black' },
                font: undefined,
            };

            expect(generateUniqTheme(styleObjectRaw)).toEqual(generateUniqTheme(styleObjectRaw));
        });

        test('guidDesignTheme меняется из-за разных опций', () => {
            const styleObjectRaw: TStyleObjectRaw = {
                background: {
                    // @ts-ignore
                    '--brandbook_background-color': '#ffffff',
                    '--brandbook_picture-url': '#ffffff',
                    '--brandbook_background-image': 'url()',
                    '--brandbook_logo-url': 'url()',
                },
                light: { color: 'red' },
                dark: { color: 'black' },
                font: undefined,
            };
            const first: string = generateUniqTheme(styleObjectRaw);

            // @ts-ignore
            styleObjectRaw.background['--brandbook_background-color'] = '#000000';
            const second: string = generateUniqTheme(styleObjectRaw);
            expect(first).not.toEqual(second);
        });
    });
});
