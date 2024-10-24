/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
import { ReactNode, useMemo } from 'react';
import { ScrollOnBodyContext } from './ScrollOnBodyContext';

export interface IScrollOnBodyContextProviderProps {
    isScrollOnBody: boolean;
    children: ReactNode;
}

/**
 * Провайдер для контекста ScrollOnBodyContext, обновляет содержимое контекста значением isScrollOnBody
 * @param isScrollOnBody
 * @param children
 * @constructor
 */
export function ScrollOnBodyContextProvider({
    isScrollOnBody,
    children,
}: IScrollOnBodyContextProviderProps): JSX.Element {
    const scrollOnBodyContextValue = useMemo(() => {
        return { isScrollOnBody };
    }, [isScrollOnBody]);

    return (
        <ScrollOnBodyContext.Provider value={scrollOnBodyContextValue}>
            {children}
        </ScrollOnBodyContext.Provider>
    );
}
