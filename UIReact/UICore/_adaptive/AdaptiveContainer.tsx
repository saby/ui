import * as React from 'react';
import { WasabyContextManager, getWasabyContext } from 'UICore/Contexts';
import { AdaptiveModeClass, AdaptiveModeType } from './AdaptiveModeClass';
import { IAspects } from './Aspects';
import { AdaptiveModeContextProvider } from './AdaptiveModeContextProvider';

interface IAdaptiveContainerProps extends IAspects {
    width?: number;
    height?: number;
    children?: React.ReactNode;
}

export class AdaptiveContainer extends React.PureComponent<IAdaptiveContainerProps> {
    private _cachedAdaptiveMode: AdaptiveModeType;
    private _enableBiggerFontsForPhones: boolean;
    private _switchBiggerFonts() {
        if (typeof window === 'undefined') {
            return;
        }
        if (!this._enableBiggerFontsForPhones && this._cachedAdaptiveMode.device.isPhone()) {
            document.body.classList.add('_enable-bigger-fonts-for-phones');
            this._enableBiggerFontsForPhones = true;
        }
        if (this._enableBiggerFontsForPhones && !this._cachedAdaptiveMode.device.isPhone()) {
            document.body.classList.remove('_enable-bigger-fonts-for-phones');
            this._enableBiggerFontsForPhones = false;
        }
    }
    render(): JSX.Element {
        const aspects: IAspects = {
            // todo нужно выбрать один из пропов?
            containerClientWidth:
                this.props.containerClientWidth ||
                this.props.width ||
                this.context.adaptiveMode?.container.clientWidth.value,
            containerClientHeight:
                this.props.containerClientHeight ||
                this.props.height ||
                this.context.adaptiveMode?.container.clientHeight.value,
            containerScrollWidth:
                this.props.containerScrollWidth ||
                this.context.adaptiveMode?.container.scrollWidth.value,
            containerScrollHeight:
                this.props.containerScrollHeight ||
                this.context.adaptiveMode?.container.scrollHeight.value,
            windowInnerWidth:
                this.props.windowInnerWidth || this.context.adaptiveMode?.window.innerWidth.value,
            windowInnerHeight:
                this.props.windowInnerHeight || this.context.adaptiveMode?.window.innerHeight.value,
            isTouch: this.props.isTouch,
            isVertical: this.props.isVertical,
            // todo isAdaptive - старое апи адаптивности. надо избавиться.
            // могут передать isAdaptive опцией, чтобы принудительно выключить адаптивность
            isPhone: this.props.isPhone || this.context.isAdaptive,
            isTablet: this.props.isTablet,
        };
        this._cachedAdaptiveMode = this._cachedAdaptiveMode
            ? this._cachedAdaptiveMode._cloneIfNeed(aspects)
            : new AdaptiveModeClass(aspects);

        this._switchBiggerFonts();

        return (
            <AdaptiveModeContextProvider adaptiveMode={this._cachedAdaptiveMode}>
                <WasabyContextManager
                    adaptiveMode={this._cachedAdaptiveMode}
                    isAdaptive={this._cachedAdaptiveMode.device.isPhone()}
                >
                    {this.props.children}
                </WasabyContextManager>
            </AdaptiveModeContextProvider>
        );
    }
    static readonly contextType = getWasabyContext();
}
