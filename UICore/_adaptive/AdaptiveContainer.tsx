/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
import * as React from 'react';
import { AdaptiveModeContext, TAdaptiveModeContext } from './AdaptiveModeContext';
import { AdaptiveModeClass } from './AdaptiveModeClass';
import { IAspects } from './Aspects';
import { DeprecatedAdaptiveModeContextProvider } from './DeprecatedAdaptiveModeContextProvider';
import { Body as BodyAPI } from 'Application/Page';
import { detection } from 'Env/Env';
import { cloneElement, createRef, LegacyRef, RefObject } from 'react';
import { cookie, logger } from 'Application/Env';
import { ChainOfRef } from 'UICore/Ref';
import { CreateOriginRef } from 'UICore/Ref';

export interface IAdaptiveContainerProps extends IAspects {
    width?: number;
    height?: number;
    children?: React.ReactNode;
    forwardedRef?: LegacyRef<HTMLDivElement>;
    className?: string;
}

/**
 * Компонент используется для настройки адаптивности содержимого под контейнер
 * @class UICore/_adaptive/AdaptiveContainer
 * @public
 * @remark
 * Адаптировать контрол удобно под размеры контейнера, в котором он располагается.
 * Чтобы adaptiveMode тоже ориентировался на размеры текущего контейнера, нужно задать эти размеры в специальный компонент.
 * @see https://n.sbis.ru/wasaby/knowledge#toc_2eb25e0a-c867-45a8-a13d-b8c1ff12cdbc
 * @example
 * Если ширина браузера 1600px, то в примере ниже InnerReact уже будет адаптироваться под ширину 1000px.
 * Таким образом, при настройке адаптивности adaptiveMode.container.clientWidth будет опираться на актуальные размеры контейнера.
 * <pre>
 * <AdaptiveContainer width={ 1000 }>
 *    <InnerReact />
 * </AdaptiveContainer>
 * </pre>
 */
export class AdaptiveContainer extends React.PureComponent<IAdaptiveContainerProps> {
    private _cachedAdaptiveMode: AdaptiveModeClass;
    private _enableBiggerFontsForPhones: boolean;
    private _ref: LegacyRef<HTMLDivElement>;
    private _containerRef: RefObject<HTMLDivElement>;
    private _aspects: IAspects;
    private _isDebug: boolean;
    private _errorIsShown: boolean = false;

    constructor(props: IAdaptiveContainerProps) {
        super(props);

        const s3debug = cookie.get('s3debug');
        this._isDebug = s3debug && s3debug !== 'false';

        if (this._isDebug) {
            const containerRef = createRef<HTMLDivElement>();
            const chain = new ChainOfRef();
            chain.add(new CreateOriginRef(props.forwardedRef));
            chain.add(new CreateOriginRef(containerRef));
            this._containerRef = containerRef;
            this._ref = chain.execute();
        }
    }

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
    checkValues() {
        const aspects: IAspects = this._aspects;
        if (typeof aspects.containerClientWidth !== 'number' || aspects.containerClientWidth < 0) {
            logger.error(
                'incorrect value of aspects.containerClientWidth. value = ' +
                    aspects.containerClientWidth
            );
        }
        if (
            typeof aspects.containerClientHeight !== 'number' ||
            aspects.containerClientHeight < 0
        ) {
            logger.error(
                'incorrect value of aspects.containerClientHeight. value = ' +
                    aspects.containerClientHeight
            );
        }
        if (typeof aspects.windowInnerWidth !== 'number' || aspects.windowInnerWidth < 0) {
            logger.error(
                'incorrect value of aspects.windowInnerWidth. value = ' + aspects.windowInnerWidth
            );
        }
        if (typeof aspects.windowInnerHeight !== 'number' || aspects.windowInnerHeight < 0) {
            logger.error(
                'incorrect value of aspects.windowInnerHeight. value = ' + aspects.windowInnerHeight
            );
        }
        if (typeof aspects.windowOuterWidth !== 'number' || aspects.windowOuterWidth < 0) {
            logger.error(
                'incorrect value of aspects.windowOuterWidth. value = ' + aspects.windowOuterWidth
            );
        }
        if (typeof aspects.windowOuterHeight !== 'number' || aspects.windowOuterHeight < 0) {
            logger.error(
                'incorrect value of aspects.windowOuterHeight. value = ' + aspects.windowOuterHeight
            );
        }
        if (typeof aspects.viewportWidth !== 'number' || aspects.viewportWidth < 0) {
            logger.error(
                'incorrect value of aspects.viewportWidth. value = ' + aspects.viewportWidth
            );
        }
        if (typeof aspects.viewportHeight !== 'number' || aspects.viewportHeight < 0) {
            logger.error(
                'incorrect value of aspects.viewportHeight. value = ' + aspects.viewportHeight
            );
        }
        if (typeof aspects.isTouch !== 'boolean' && aspects.isTouch !== undefined) {
            logger.error('incorrect value of aspects.isTouch. value = ' + aspects.isTouch);
        }
        if (typeof aspects.isVertical !== 'boolean' && aspects.isVertical !== undefined) {
            logger.error('incorrect value of aspects.isVertical. value = ' + aspects.isVertical);
        }
        if (typeof aspects.isPhone !== 'boolean' && aspects.isPhone !== undefined) {
            logger.error('incorrect value of aspects.isPhone. value = ' + aspects.isPhone);
        }
        if (typeof aspects.isTablet !== 'boolean' && aspects.isTablet !== undefined) {
            logger.error('incorrect value of aspects.isTablet. value = ' + aspects.isTablet);
        }
        if (this._isDebug && this._containerRef.current.children.length && !this._errorIsShown) {
            const propWidth = this.props.width || this.props.containerClientWidth;
            if (typeof propWidth === 'number') {
                const correctWidthParent = this._containerRef.current.parentElement.clientWidth;
                const correctWidthChild = this._containerRef.current.children[0].clientWidth;
                if (
                    Math.abs(correctWidthParent - propWidth) > 1 &&
                    Math.abs(correctWidthChild - propWidth) > 1
                ) {
                    this._errorIsShown = true;
                    logger.warn(
                        `incorrect value of aspects.containerClientWidth.
                   value = ${propWidth}
                   correct container.clientWidth value = ${correctWidthParent}`
                    );
                }

                const dataWidth = this._containerRef.current.getAttribute('data-width');
                const dataWidthInt = dataWidth ? parseFloat(dataWidth) : undefined;
                if (dataWidth && propWidth !== dataWidthInt) {
                    logger.warn(
                        `На сервере и клиенте было выставлено разное значение width.
                   Это может повлечь различия в верстке и сломать гидратацию.
                   значение на сервере = ${dataWidthInt}
                   значение на клиенте = ${propWidth}`
                    );
                }
            }

            const propHeight = this.props.height || this.props.containerClientHeight;
            if (typeof propHeight === 'number') {
                const correctHeightParent = this._containerRef.current.parentElement.clientHeight;
                const correctHeightChild = this._containerRef.current.children[0].clientHeight;
                if (
                    Math.abs(correctHeightParent - propHeight) > 1 &&
                    Math.abs(correctHeightChild - propHeight) > 1
                ) {
                    this._errorIsShown = true;
                    logger.warn(
                        `incorrect value of aspects.containerClientHeight.
                   value = ${propHeight}
                   correct container.clientHeight value = ${correctHeightParent}`
                    );
                }

                const dataHeight = this._containerRef.current.getAttribute('data-height');
                const dataHeightInt = dataHeight ? parseFloat(dataHeight) : undefined;
                if (dataHeight && propHeight !== dataHeightInt) {
                    logger.warn(
                        `На сервере и клиенте было выставлено разное значение height.
                   Это может повлечь различия в верстке и сломать гидратацию.
                   значение на сервере = ${dataHeightInt}
                   значение на клиенте = ${propHeight}`
                    );
                }
            }
        }
    }
    componentDidMount() {
        this.checkValues();
    }
    componentDidUpdate() {
        this.checkValues();
    }

    render(): JSX.Element | null {
        if (!this.props.children) {
            return null;
        }

        const contextAdaptiveMode: AdaptiveModeClass = this.context?.adaptiveMode;
        this._aspects = {
            // todo нужно выбрать один из пропов?
            containerClientWidth:
                this.props.width ??
                this.props.containerClientWidth ??
                contextAdaptiveMode?.container.clientWidth.value,
            containerClientHeight:
                this.props.height ??
                this.props.containerClientHeight ??
                contextAdaptiveMode?.container.clientHeight.value,
            windowInnerWidth:
                this.props.windowInnerWidth ?? contextAdaptiveMode?.window.innerWidth.value,
            windowInnerHeight:
                this.props.windowInnerHeight ?? contextAdaptiveMode?.window.innerHeight.value,
            windowOuterWidth:
                this.props.windowOuterWidth ?? contextAdaptiveMode?.window.outerWidth.value,
            windowOuterHeight:
                this.props.windowOuterHeight ?? contextAdaptiveMode?.window.outerHeight.value,
            viewportWidth:
                this.props.viewportWidth ?? contextAdaptiveMode?.window.viewportWidth.value,
            viewportHeight:
                this.props.viewportHeight ?? contextAdaptiveMode?.window.viewportHeight.value,
            screenWidth: this.props.screenWidth ?? contextAdaptiveMode?.window.screenWidth.value,
            screenHeight: this.props.screenHeight ?? contextAdaptiveMode?.window.screenHeight.value,
            isTouch: this.props.isTouch ?? contextAdaptiveMode?.device.isTouch(),
            isVertical: this.props.isVertical ?? contextAdaptiveMode?.orientation.isVertical(),
            isPhone: this.props.isPhone ?? contextAdaptiveMode?.device.isPhone(),
            isTablet: this.props.isTablet ?? contextAdaptiveMode?.device.isTablet(),
        };
        this._cachedAdaptiveMode = this._cachedAdaptiveMode
            ? this._cachedAdaptiveMode._cloneIfNeed(this._aspects)
            : new AdaptiveModeClass(this._aspects);

        this._switchBiggerFonts();

        // TODO заменить на AdaptiveModeContextProvider после отказа от isAdaptive
        if (this._isDebug) {
            return (
                <div
                    style={{ display: 'contents', width: '100%', height: '100%' }}
                    data-width={this._aspects.containerClientWidth}
                    data-height={this._aspects.containerClientHeight}
                    ref={this._ref}
                >
                    <DeprecatedAdaptiveModeContextProvider adaptiveMode={this._cachedAdaptiveMode}>
                        {this.props.children}
                    </DeprecatedAdaptiveModeContextProvider>
                </div>
            );
        }
        // todo а можно ли вообще тут разрешать указывать несколько детей?
        const children = Array.isArray(this.props.children)
            ? this.props.children
            : cloneElement(this.props.children, {
                  ref: this.props.forwardedRef,
              });
        return (
            <DeprecatedAdaptiveModeContextProvider adaptiveMode={this._cachedAdaptiveMode}>
                {children}
            </DeprecatedAdaptiveModeContextProvider>
        );
    }
    static readonly contextType: TAdaptiveModeContext = AdaptiveModeContext;
    static _$temp_flag_to_disable_bigger_fonts_for_sabyget_only: boolean = false;
    static displayName: string = 'UI/Adaptive:AdaptiveContainer';
}
