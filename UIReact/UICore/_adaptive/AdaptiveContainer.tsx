import * as React from 'react';
import { AdaptiveModeContext, TAdaptiveModeContext } from './AdaptiveModeContext';
import { AdaptiveModeClass } from './AdaptiveModeClass';
import { IAspects } from './Aspects';
import { DeprecatedAdaptiveModeContextProvider } from './DeprecatedAdaptiveModeContextProvider';
import { Body as BodyAPI } from 'Application/Page';
import { detection } from 'Env/Env';
import { cloneElement, ForwardedRef } from 'react';

interface IAdaptiveContainerProps extends IAspects {
    width?: number;
    height?: number;
    children?: JSX.Element;
    forwardedRef?: ForwardedRef<HTMLElement>;
}

export class AdaptiveContainer extends React.PureComponent<IAdaptiveContainerProps> {
    private _cachedAdaptiveMode: AdaptiveModeClass;
    private _enableBiggerFontsForPhones: boolean;
    private _switchBiggerFonts() {
        // todo https://online.sbis.ru/opendoc.html?guid=a0e665e0-6a2c-40f1-bb89-7ed5ff921e46&client=3
        //  будем обсуждать стоит ли вообще делать увеличение для шрифтов, либо это у них
        //  какая то отдельная тема, для которой на уровне темы не будет увеличения
        if (!AdaptiveContainer._$temp_flag_to_disable_bigger_fonts_for_sabyget_only) {
            if (!this._enableBiggerFontsForPhones && detection.isPhone) {
                BodyAPI.getInstance().addClass('_enable-bigger-fonts-for-phones');
                this._enableBiggerFontsForPhones = true;
            }
            if (this._enableBiggerFontsForPhones && !detection.isPhone) {
                BodyAPI.getInstance().removeClass('_enable-bigger-fonts-for-phones');
                this._enableBiggerFontsForPhones = false;
            }
        }
    }
    render(): JSX.Element {
        const contextAdaptiveMode: AdaptiveModeClass = this.context?.adaptiveMode;
        const aspects: IAspects = {
            // todo нужно выбрать один из пропов?
            containerClientWidth:
                this.props.width ||
                this.props.containerClientWidth ||
                contextAdaptiveMode?.container.clientWidth.value,
            containerClientHeight:
                this.props.height ||
                this.props.containerClientHeight ||
                contextAdaptiveMode?.container.clientHeight.value,
            windowInnerWidth:
                this.props.windowInnerWidth || contextAdaptiveMode?.window.innerWidth.value,
            windowInnerHeight:
                this.props.windowInnerHeight || contextAdaptiveMode?.window.innerHeight.value,
            isTouch: this.props.isTouch ?? contextAdaptiveMode?.device.isTouch(),
            isVertical: this.props.isVertical ?? contextAdaptiveMode?.orientation.isVertical(),
            isPhone: this.props.isPhone ?? contextAdaptiveMode?.device.isPhone(),
            isTablet: this.props.isTablet ?? contextAdaptiveMode?.device.isTablet(),
        };
        this._cachedAdaptiveMode = this._cachedAdaptiveMode
            ? this._cachedAdaptiveMode._cloneIfNeed(aspects)
            : new AdaptiveModeClass(aspects);

        this._switchBiggerFonts();

        // todo а можно ли вообще тут разрешать указывать несколько детей?
        const children =
            Array.isArray(this.props.children) || !this.props.children
                ? this.props.children
                : cloneElement(this.props.children, {
                      ref: this.props.forwardedRef,
                  });
        return (
            // TODO заменить на AdaptiveModeContextProvider после отказа от isAdaptive
            <DeprecatedAdaptiveModeContextProvider adaptiveMode={this._cachedAdaptiveMode}>
                {children}
            </DeprecatedAdaptiveModeContextProvider>
        );
    }
    static readonly contextType: TAdaptiveModeContext = AdaptiveModeContext;
    static _$temp_flag_to_disable_bigger_fonts_for_sabyget_only: boolean = false;
}
