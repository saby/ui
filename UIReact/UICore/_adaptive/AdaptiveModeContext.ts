import * as React from 'react';
import { AdaptiveModeClass } from './AdaptiveModeClass';

interface IAdaptiveModeContextValue {
    adaptiveMode: AdaptiveModeClass;
}
export type TAdaptiveModeContext = React.Context<IAdaptiveModeContextValue>;

/**
 * Контекст передает поле adaptiveMode - инструмент для настройки адаптивности
 */
const AdaptiveModeContext: TAdaptiveModeContext = React.createContext(undefined);
export { AdaptiveModeContext };
