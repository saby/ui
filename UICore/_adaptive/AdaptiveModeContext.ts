/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
import * as React from 'react';
import { AdaptiveModeClass } from './AdaptiveModeClass';

interface IAdaptiveModeContextValue {
    adaptiveMode: AdaptiveModeClass;
}
export type TAdaptiveModeContext = React.Context<IAdaptiveModeContextValue>;

let defaultAdaptiveMode: AdaptiveModeClass;
export function getDefaultAdaptiveMode() {
    if (!defaultAdaptiveMode) {
        defaultAdaptiveMode = new AdaptiveModeClass({});
    }
    return defaultAdaptiveMode;
}
/**
 * Контекст передает поле adaptiveMode - инструмент для настройки адаптивности
 */
const AdaptiveModeContext: TAdaptiveModeContext = React.createContext(undefined);
export { AdaptiveModeContext };
