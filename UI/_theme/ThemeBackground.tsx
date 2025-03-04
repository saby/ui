/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import { useMemo } from 'react';
import { IActiveTheme, TThemePropertiesObject } from 'UICommon/theme/controller';
import BackgroundViewer from './BackgroundViewer';
import { default as StyleCreator } from './StyleCreator';
import { calculateVaribalesFromThemeProperties } from 'UI/_theme/background/cssVariables';
import { factory } from 'Types/chain';

interface IThemeVariablesCompatProps {
    properties?: IActiveTheme['properties'];
    classList?: string[];
    children: JSX.Element;
    isUpperScope: boolean;
    /**
     * в popup не внедрено отображение фона
     *  https://online.sbis.ru/opendoc.html?guid=db38d223-4ea4-4f25-bcf8-e8d8658f7a54&client=3
     * @private
    */
    noBackground88221033455786?: boolean;
}

/**
 * Компонент вставки фоновой картинки темы.
 * Также добавляет совместимые переменные брендбука.
 * @private
 */
export default function ThemeBackground(props: IThemeVariablesCompatProps): JSX.Element {
    const themeProperties: TThemePropertiesObject = useMemo(
        () => (props.properties ? factory(props.properties).toObject() : {}),
        [props.properties]
    );

    const classList: string[] = props.classList ?? [];
    const stylesSelector = useMemo(() => {
        if (classList.length) {
            return '.' + classList.join('.');
        }
    }, [classList]);
    const StyleCreatorTag = useMemo(() => {
        if (!stylesSelector) {
            return null;
        }

        const styleObject = {
            [stylesSelector]: calculateVaribalesFromThemeProperties(themeProperties),
        };
        return <StyleCreator styles={styleObject} />;
    }, [themeProperties, stylesSelector]);

    const staticThemeName = themeProperties?.staticTheme || 'default';
    // Быстрый костыль. Нужно иначе темизировать заглушки в Hint, но это долго.
    // Обсуждение в ленте ошибки https://online.sbis.ru/opendoc.html?guid=ac345054-f82f-4390-8854-28979d117c3d&client=3
    const hintStyleTag = useMemo(() => {
        if (!stylesSelector) {
            return null;
        }

        // Не могу использовать StyleCreator: он вызывает toLowerCase, а тут нужна большая "H".
        const styleValue =
            '--text-color_Hint-Template:var(--unaccented_text-color);' +
            '--path-color_Hint-Template:var(--unaccented_text-color);';
        return (
            // Без добавления .controls_Hint_theme-default не хватает веса селектора.
            <style>{`${stylesSelector} .controls_Hint_theme-${staticThemeName} { ${styleValue} }`}</style>
        );
    }, [staticThemeName, stylesSelector]);
    
    classList.push(`controls_theme-${staticThemeName}`);

    return (
        <>
            {StyleCreatorTag}
            {hintStyleTag}
            <BackgroundViewer
                background={themeProperties}
                themeStyleSelector={classList.join(' ')}
                isUpperScope={props.isUpperScope}
                noBackground88221033455786={props.noBackground88221033455786}
            >
                {props.children}
            </BackgroundViewer>
        </>
    );
}
