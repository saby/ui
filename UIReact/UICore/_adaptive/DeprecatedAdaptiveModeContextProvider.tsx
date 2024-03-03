import { useContext } from 'react';
import { WasabyContextManager, getWasabyContext } from 'UICore/Contexts';
import {
    AdaptiveModeContextProvider,
    IAdaptiveModeContextProviderProps,
} from './AdaptiveModeContextProvider';

// TODO удалить после отказа от isAdaptive
export function DeprecatedAdaptiveModeContextProvider({
    adaptiveMode,
    children,
}: IAdaptiveModeContextProviderProps): JSX.Element {
    const wasabyContextValue = useContext(getWasabyContext());

    // todo isAdaptive - старое апи адаптивности. надо избавиться.
    // могут передать isAdaptive опцией, чтобы принудительно выключить адаптивность
    const isPhone = adaptiveMode.device.isPhone() || wasabyContextValue.isAdaptive;
    const clonedAdaptiveMode = adaptiveMode._cloneIfNeed({ isPhone });
    return (
        <WasabyContextManager isAdaptive={isPhone}>
            <AdaptiveModeContextProvider adaptiveMode={clonedAdaptiveMode}>
                {children}
            </AdaptiveModeContextProvider>
        </WasabyContextManager>
    );
}
