import { useContext } from 'react';
import { useAdaptiveMode } from 'UI/Adaptive';
import { _AdaptiveInitializerConfigContext } from 'UICore/Adaptive';

export default function Control1() {
    const adaptiveMode = useAdaptiveMode();
    const context = useContext(_AdaptiveInitializerConfigContext);
    return (
        <div>
            adaptiveMode: {JSON.stringify(adaptiveMode)}
            domElementWithSizes: {context?.domElementWithSizes?.getAttribute('style')}
            isPhoneForced: {context?.isPhoneForced + ''}
        </div>
    );
}
