import * as React from 'react';
import { WasabyContextManager, getWasabyContext } from 'UICore/Contexts';
import { AdaptiveModeClass, AdaptiveModeType } from './AdaptiveModeClass';
import { IAspects } from './Aspects';
import { AdaptiveModeContextProvider } from './AdaptiveModeContextProvider';

interface IAdaptiveContainerProps extends IAspects {
    children?: React.ReactNode;
}

export class AdaptiveContainer extends React.PureComponent<IAdaptiveContainerProps> {
    private _cachedAdaptiveMode: AdaptiveModeType;
    render(): JSX.Element {
        const aspects: IAspects = {
            width: this.props.width,
            height: this.props.height,
            isTouch: this.props.isTouch,
            isVertical: this.props.isVertical,
            isPhone: this.props.isPhone,
            isTablet: this.props.isTablet
        };
        this._cachedAdaptiveMode = this._cachedAdaptiveMode ?
            this._cachedAdaptiveMode._cloneIfNeed(aspects) :
            new AdaptiveModeClass(aspects);
        return (
            <AdaptiveModeContextProvider adaptiveMode={this._cachedAdaptiveMode}>
                <WasabyContextManager
                    adaptiveMode={this._cachedAdaptiveMode}
                    isAdaptive={this._cachedAdaptiveMode.device.isPhone()}>
                    {this.props.children}
                </WasabyContextManager>
            </AdaptiveModeContextProvider>
        );
    }

    static readonly contextType = getWasabyContext();
}
