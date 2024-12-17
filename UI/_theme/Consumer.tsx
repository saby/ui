import { forwardRef, ForwardedRef, cloneElement, useEffect, useMemo } from 'react';
import { useActiveTheme } from './useActiveTheme';
import type { IActiveTheme } from 'UICommon/theme/controller';

interface IThemeConsumerProps {
    getContextValue?: (activeTheme: IActiveTheme | undefined) => void;
    content?: unknown;
    children?: React.ReactElement;
}

const ThemeConsumer = forwardRef(function ThemeConsumerFn(
    { getContextValue, children, content, ...rest }: IThemeConsumerProps,
    ref: ForwardedRef<unknown>
) {
    const activeTheme = useActiveTheme();
    useMemo(() => {
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
