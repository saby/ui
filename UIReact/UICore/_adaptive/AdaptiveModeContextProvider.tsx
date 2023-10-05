import { ReactNode, useMemo } from 'react';
import { AdaptiveModeContext } from './AdaptiveModeContext';
import { AdaptiveModeClass } from './AdaptiveModeClass';

export interface IAdaptiveModeContextProviderProps {
    adaptiveMode: AdaptiveModeClass;
    children: ReactNode;
}

export function AdaptiveModeContextProvider({
    adaptiveMode,
    children,
}: IAdaptiveModeContextProviderProps): JSX.Element {
    const adaptiveModeContextValue = useMemo(() => {
        return { adaptiveMode };
    }, [adaptiveMode]);

    return (
        <AdaptiveModeContext.Provider value={adaptiveModeContextValue}>
            {children}
        </AdaptiveModeContext.Provider>
    );
}
