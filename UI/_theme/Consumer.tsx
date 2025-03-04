/**
 * @kaizen_zone ac7fdb9c-1706-4d4d-80e8-dc9fb94151ba
 */
import { forwardRef, ForwardedRef, cloneElement, useEffect } from 'react';
import { useActiveTheme } from './useActiveTheme';
import type { IActiveTheme } from 'UICommon/theme/controller';

interface IThemeConsumerProps {
    getContextValue?: (activeTheme: IActiveTheme | undefined) => void;
    content?: unknown;
    children?: React.ReactElement;
}

/**
 * Компонент получения текущей активной темы.
 * Для использования в классовых компонентах, для функциональных есть хук useActiveTheme.
 * Передаёт объект активной темы в двух направлениях:
 * 1. Родителю через колбек проп getContextValue
 * <ThemeConsumer
 *     getContextValue={(activeTheme) => {
 *         this.saveActiveTheme(activeTheme);
 *     }}
 * />
 *
 * 2. Вниз в children через проп activeTheme
 * <ThemeConsumer>
 *    <SomeComponentWithActiveThemeProp />
 * </ThemeConsumer>
 */
const ThemeConsumer = forwardRef(function ThemeConsumerFn(
    { getContextValue, children, content, ...rest }: IThemeConsumerProps,
    ref: ForwardedRef<unknown>
) {
    const activeTheme = useActiveTheme();
    useEffect(() => {
        if (getContextValue) {
            getContextValue(activeTheme);
        }
    }, [activeTheme]);
    useEffect(() => {
        return () => {
            if (getContextValue) {
                getContextValue(undefined);
            }
        };
    }, []);
    if (!children) {
        return null;
    }
    const clonedRefProps = ref ? { forwardedRef: ref } : {};
    return cloneElement(children, {
        activeTheme,
        ...rest,
        ...clonedRefProps,
    });
});

ThemeConsumer.displayName = 'UI/Theme:ThemeConsumer';

export default ThemeConsumer;
