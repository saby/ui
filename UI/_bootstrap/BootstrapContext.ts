import * as React from 'react';

export interface IBootstrapContextValue {
    initialized: boolean;
}
export type TAdaptiveInitializerConfigContext = React.Context<IBootstrapContextValue | undefined>;

const BootstrapContext: TAdaptiveInitializerConfigContext = React.createContext<
    IBootstrapContextValue | undefined
>(undefined);
export { BootstrapContext };
