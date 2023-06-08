import { ReactNode, useMemo } from 'react';
import { AdaptiveModeContext } from './AdaptiveModeContext';
import {AdaptiveModeType} from './AdaptiveModeClass';

interface IAdaptiveModeContextProviderProps {
    adaptiveMode: AdaptiveModeType;
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
