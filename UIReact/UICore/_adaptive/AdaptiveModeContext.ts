import * as React from 'react';
import { AdaptiveModeClass } from './AdaptiveModeClass';

export interface IAdaptiveModeContextValue {
    adaptiveMode: AdaptiveModeClass;
}
export type TAdaptiveModeContext = React.Context<IAdaptiveModeContextValue>;

const AdaptiveModeContext: TAdaptiveModeContext = React.createContext(undefined);
export { AdaptiveModeContext };
