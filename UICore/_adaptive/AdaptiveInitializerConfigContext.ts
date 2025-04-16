/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
import * as React from 'react';

export interface IAdaptiveInitializerConfigContextValue {
    domElementWithSizes?: HTMLElement;
    isPhoneForced?: boolean;
}
export type TAdaptiveInitializerConfigContext = React.Context<
    IAdaptiveInitializerConfigContextValue | undefined
>;

const AdaptiveInitializerConfigContext: TAdaptiveInitializerConfigContext = React.createContext<
    IAdaptiveInitializerConfigContextValue | undefined
>(undefined);
export { AdaptiveInitializerConfigContext };
