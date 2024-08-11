/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import { memo, forwardRef, cloneElement, useMemo } from 'react';
import type { Ref } from 'react';
import createThemeScope, { useThemeClassName } from 'UI/theme/context';
import { WasabyContextManager } from 'UI/Contexts';
import { default as ThemeWrapperUuid, isUuid } from './Wrappers/Uuid';
import { default as ThemeWrapperSelector } from './Wrappers/Selector';
import { getThemeController } from 'UI/theme/controller';
import type { IActiveTheme } from 'UI/theme/controller';

export const ERROR_FALLBACK_SELECTOR = 'Ошибка загрузки темы';
const RootThemeScope = createThemeScope();
const MemoThemeScope = memo(RootThemeScope);

export interface IErrorActiveTheme {
    error: string;
    selector: string;
}

export interface IThemeWrapperOptions {
    activeTheme?: IActiveTheme | IErrorActiveTheme | string | IErrorActiveTheme[] | IActiveTheme[];
    staticTheme?: string;
    isFramePage?: boolean;
    children: JSX.Element;
}
type TChildrenProp = { className?: string; forwardedRef?: unknown };

/**
 * Компонент вставки нужного компонента создания UI/theme/context
 * @param props.staticTheme это статичная тема дистрибутива
 * @param props.activeTheme это тема из сервиса тем
 */
function ThemeWrapper(props: IThemeWrapperOptions, ref: Ref<unknown>) {
    const activeTheme = props.activeTheme;
    const isUuidTheme = isUuid(activeTheme);
    const isArrayTheme = Array.isArray(activeTheme);
    const isObjectTheme = !!activeTheme && !isUuidTheme && !isArrayTheme;
    const isFallbackSelector =
        (isObjectTheme && isSelector(activeTheme)) ||
        (isArrayTheme && isSelectorArray(activeTheme));

    // css, полученная с сервиса через GetCss, работает как патч статической default.css.
    // Без неё работать не будет. К тому же, в качестве staticTheme в случае кастомной темы придёт какой-то uuid.
    const hasDataToGetCss = isObjectTheme && !!activeTheme.selector;
    const staticThemeName = (hasDataToGetCss ? 'default' : props.staticTheme) || 'default';
    const shouldAppendClassName = hasDataToGetCss || !!props.staticTheme;
    const staticThemeClassList = useMemo(() => {
        getThemeController().getVariables(staticThemeName);
        if (shouldAppendClassName) {
            return ['controls_theme-' + staticThemeName];
        }
    }, [staticThemeName, shouldAppendClassName]);

    const className = useThemeClassName(staticThemeClassList, props.children.props.className);
    const childrenProps: TChildrenProp = className ? { className } : {};
    // добавлем forwardedRef, только если он реально передан
    if (ref) {
        childrenProps.forwardedRef = ref;
    }
    const children = cloneElement(props.children, childrenProps);

    if (props.isFramePage) {
        return <WasabyContextManager theme={staticThemeName}>{children}</WasabyContextManager>;
    }

    if (isUuidTheme) {
        return (
            <WasabyContextManager theme={staticThemeName}>
                <ThemeWrapperUuid uuid={activeTheme}>{children}</ThemeWrapperUuid>
            </WasabyContextManager>
        );
    }

    if (isFallbackSelector) {
        const selector = isArrayTheme
            ? activeTheme.map((theme) => theme.selector as string)
            : activeTheme.selector;
        return (
            <WasabyContextManager theme={staticThemeName}>
                <ThemeWrapperSelector selector={selector}>{children}</ThemeWrapperSelector>
            </WasabyContextManager>
        );
    }

    return (
        <WasabyContextManager theme={staticThemeName}>
            <MemoThemeScope activeTheme={activeTheme}>{children}</MemoThemeScope>
        </WasabyContextManager>
    );
}
ThemeWrapper.displayName = 'UI/Theme:ThemeWrapper';

// Если вызывать эту проверку после !activeTheme и isUuid, ts понимает, что тут не uuid и не undefined.
// Не нужно снова вызывать те же проверки, микро оптимизация.
function isSelector(theme: IActiveTheme | IErrorActiveTheme): theme is IErrorActiveTheme {
    if ('error' in theme) {
        return true;
    }

    return false;
}

function isSelectorArray(
    theme: (IActiveTheme | IErrorActiveTheme)[]
): theme is IErrorActiveTheme[] {
    return !!theme.find((themeInArr) => isSelector(themeInArr));
}

export default memo(forwardRef(ThemeWrapper));
