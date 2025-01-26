import {
    AdaptiveInitializerConfigContext,
    IAdaptiveInitializerConfigContextValue,
} from './AdaptiveInitializerConfigContext';
import { ReactElement, useMemo, useContext } from 'react';

interface IAdaptiveInitializerConfigProps extends IAdaptiveInitializerConfigContextValue {
    children?: ReactElement;
}
export function AdaptiveInitializerConfig(props: IAdaptiveInitializerConfigProps) {
    const context = useContext(AdaptiveInitializerConfigContext);
    const domElementWithSizes = props.domElementWithSizes ?? context?.domElementWithSizes;
    const isPhoneForced = props.isPhoneForced ?? context?.isPhoneForced;
    const value = useMemo(() => {
        return {
            domElementWithSizes,
            isPhoneForced,
        };
    }, [domElementWithSizes, isPhoneForced]);
    return (
        <AdaptiveInitializerConfigContext.Provider value={value}>
            {props.children}
        </AdaptiveInitializerConfigContext.Provider>
    );
}
