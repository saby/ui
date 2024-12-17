/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import { memo, forwardRef, cloneElement, useMemo } from 'react';
import type { Ref } from 'react';
import createThemeScope, { useIsUpperScope } from 'UI/_theme/context';
import { useThemeClassName } from 'UI/_theme/useThemeClassName';
import { WasabyContextManager } from 'UI/Contexts';
import { default as ThemeWrapperUuid, isUuid } from './Wrappers/Uuid';
import { default as ThemeWrapperSelector } from './Wrappers/Selector';
import { getThemeController, THEME_APPLICATIONS } from 'UI/theme/controller';
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
    className?: string;
    children: JSX.Element;
    isUpperScope?: boolean;
}
type TChildrenProp = {
    className?: string;
    forwardedRef?: unknown;

    // Магический костыль для окна, без которого почему-то криво строится адаптивный календарь.
    onWheel?: () => void;
};

const emptyCallback: () => void = () => undefined;

/**
 * Компонент вставки нужного компонента создания UI/theme/context
 * @param props.staticTheme это статичная тема дистрибутива
 * @param props.activeTheme это тема из сервиса тем
 */
function ThemeWrapper(props: IThemeWrapperOptions, ref: Ref<unknown>) {
    const {
        activeTheme,
        staticTheme,
        className: classNameFromProps,
        isFramePage,
        children: childrenFromProps,
        isUpperScope: isUpperScopeFromFrops,
        ...rest
    } = props;
    const isUuidTheme = isUuid(activeTheme);
    const isArrayTheme = Array.isArray(activeTheme);
    const isObjectTheme = !!activeTheme && !isUuidTheme && !isArrayTheme;
    const isFallbackSelector =
        (isObjectTheme && isSelector(activeTheme)) ||
        (isArrayTheme && isSelectorArray(activeTheme));
    const isUpperScopeFromContext = useIsUpperScope();
    const isUpperScope = isUpperScopeFromFrops ?? isUpperScopeFromContext;

    // вешаем класс controls_theme-themeName в двух случаях:
    // 1. Явно задана какая-то статическая тема.
    // 2. Есть activeTheme, что будет работать как расширение статической темы. В том числе default без явного задания.
    const hasActiveTheme = (isObjectTheme && !!activeTheme.selector) || isArrayTheme;
    const boundStaticTheme = hasActiveTheme ? getBoundStaticTheme(activeTheme) : undefined;
    const staticThemeName =
        boundStaticTheme ||
        staticTheme ||
        (hasActiveTheme && 'default') ||
        (isUpperScope ? 'default' : undefined);
    const staticThemeClassList = useMemo(() => {
        if (staticThemeName) {
            getThemeController().getVariables(staticThemeName);
            return ['controls_theme-' + staticThemeName];
        }
    }, [staticThemeName]);

    const classList = [];
    const childrenClassName = childrenFromProps.props.className;
    if (childrenClassName) {
        classList.push(childrenClassName);
    }
    const className = useThemeClassName(staticThemeClassList, isUpperScope);
    if (className) {
        classList.push(className);
    }
    if (classNameFromProps) {
        classList.push(classNameFromProps);
    }

    const childrenProps: TChildrenProp = {
        // Магический костыль для окон, без которого почему-то криво строится календарь в адаптиве.
        onWheel: emptyCallback,
        ...rest,
    };
    if (classList.length) {
        childrenProps.className = classList.join(' ');
    }
    // добавлем forwardedRef, только если он реально передан
    if (ref) {
        childrenProps.forwardedRef = ref;
    }
    const children = cloneElement(childrenFromProps, childrenProps);

    if (isFramePage) {
        return <WasabyContextManager theme={staticThemeName}>{children}</WasabyContextManager>;
    }

    if (isUuidTheme) {
        return (
            <WasabyContextManager theme={staticThemeName}>
                <ThemeWrapperUuid uuid={activeTheme} isUpperScope={isUpperScope}>
                    {children}
                </ThemeWrapperUuid>
            </WasabyContextManager>
        );
    }

    if (isFallbackSelector) {
        const selector = isArrayTheme
            ? activeTheme.map((theme) => theme.selector as string)
            : activeTheme.selector;
        return (
            <WasabyContextManager theme={staticThemeName}>
                <ThemeWrapperSelector selector={selector} isUpperScope={isUpperScope}>
                    {children}
                </ThemeWrapperSelector>
            </WasabyContextManager>
        );
    }

    return (
        <WasabyContextManager theme={staticThemeName}>
            <MemoThemeScope activeTheme={activeTheme} isUpperScope={isUpperScope}>
                {children}
            </MemoThemeScope>
        </WasabyContextManager>
    );
}
ThemeWrapper.displayName = 'UI/Theme:ThemeWrapper';

function getBoundStaticTheme(activeTheme: IActiveTheme | IActiveTheme[]): string | undefined {
    if (!Array.isArray(activeTheme)) {
        return getStaticThemeFromProperties(activeTheme);
    }
    for (const theme of activeTheme) {
        const staticTheme = getStaticThemeFromProperties(theme);
        if (staticTheme) {
            return staticTheme;
        }
    }
}

function getStaticThemeFromProperties(activeTheme: IActiveTheme): string | undefined {
    if (activeTheme.themeApply === THEME_APPLICATIONS.palette) {
        return activeTheme.properties?.get('staticTheme');
    }
}

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
