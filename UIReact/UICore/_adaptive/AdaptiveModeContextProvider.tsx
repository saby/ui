/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
import { ReactNode, useMemo } from 'react';
import { AdaptiveModeContext } from './AdaptiveModeContext';
import { AdaptiveModeClass } from './AdaptiveModeClass';

export interface IAdaptiveModeContextProviderProps {
    adaptiveMode: AdaptiveModeClass;
    children: ReactNode;
}

/**
 * Провайдер для контекста AdaptiveModeContext, обновляет содержимое контекста значением adaptiveMode
 * @param adaptiveMode
 * @param children
 * @constructor
 */
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
