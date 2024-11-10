import { forwardRef, useContext, useMemo, ForwardedRef, cloneElement, useEffect } from 'react';
import { IActiveTheme } from 'UICommon/theme/controller';
import { ThemeContext } from './context';
import getThemeStorage from './ThemeStorage';

interface IThemeConsumerProps {
    getContextValue?: (activeTheme: IActiveTheme | undefined) => void;
    content?: unknown;
    children?: React.ReactElement;
}

const ThemeConsumer = forwardRef(function ThemeConsumerFn(
    { getContextValue, children, content, ...rest }: IThemeConsumerProps,
    ref: ForwardedRef<unknown>
) {
    const context = useContext(ThemeContext);
    const activeTheme = useMemo(() => {
        if (!getContextValue) {
            return;
        }
        // Есть подозрение, что текущий формат контекста не самый удобный.
        // Чтобы применить тему из контекста, нужно получить её из стора по имени.
        if (context?.theme) {
            const activeTheme = getThemeStorage().getTheme(context.theme);
            if (activeTheme) {
                getContextValue(activeTheme);
                return activeTheme;
            }
        }
        getContextValue(undefined);
    }, [context?.theme, context?.cacheId]);
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
