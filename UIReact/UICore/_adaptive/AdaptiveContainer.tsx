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
 * @param {number} [width?] Ширина контейнера
 * @param {number} [height?] Высота контейнера
 * @public .
 * @see https://n.sbis.ru/wasaby/knowledge#toc_2eb25e0a-c867-45a8-a13d-b8c1ff12cdbc
 * Адаптировать контрол удобно под размеры контейнера, в котором он располагается.
 * Чтобы adaptiveMode тоже ориентировался на размеры текущего контейнера, нужно задать эти размеры в специальный компонент.
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
        if (this._isDebug && !this._containerRef.current.children.length) {
            const bold = 'font-weight: bold';
            const normal = 'font-weight: normal';
            logger.error(
                `AdaptiveContainer должен содержать дочернюю верстку, иначе в нем нет смысла. %cНет смысла тратить ресурсы на построение бесполезных компонентов%c.
                Нужно исследовать, почему нет дочерней верстки.
                Например, в children вставляется <AdaptiveContainer ...>{value ? <div>...</div> : null}</AdaptiveContainer>,
                при значении value=false будет вставлен null, это неправильно.
                Значит AdaptiveContainer актуален только для value=true и его нужно внести в тело условия:
                {value ? <AdaptiveContainer ...><div>...</div></AdaptiveContainer> : null}`,
                bold,
                normal
            );
        }
        if (this._isDebug && this._containerRef.current.children.length && !this._errorIsShown) {
            const propWidth = this.props.width || this.props.containerClientWidth;
            const correctWidthParent = this._containerRef.current.parentElement.clientWidth;
            const correctWidthChild = this._containerRef.current.children[0].clientWidth;
            if (
                typeof propWidth === 'number' &&
                Math.abs(correctWidthParent - propWidth) > 1 &&
                Math.abs(correctWidthChild - propWidth) > 1
            ) {
                this._errorIsShown = true;
                logger.error(
                    `incorrect value of aspects.containerClientWidth.
                   value = ${propWidth}
                   correct container.clientWidth value = ${correctWidthParent}`
                );
            }

            const propHeight = this.props.height || this.props.containerClientHeight;
            const correctHeightParent = this._containerRef.current.parentElement.clientHeight;
            const correctHeightChild = this._containerRef.current.children[0].clientHeight;
            if (
                typeof propHeight === 'number' &&
                Math.abs(correctHeightParent - propHeight) > 1 &&
                Math.abs(correctHeightChild - propHeight) > 1
            ) {
                this._errorIsShown = true;
                logger.error(
                    `incorrect value of aspects.containerClientHeight.
                   value = ${propHeight}
                   correct container.clientHeight value = ${correctHeightParent}`
                );
            }
        }
    }
    componentDidMount() {
        this.checkValues();
    }
    componentDidUpdate() {
        this.checkValues();
    }

    render(): JSX.Element {
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
                <div style={{ display: 'contents' }} ref={this._ref}>
                    <DeprecatedAdaptiveModeContextProvider adaptiveMode={this._cachedAdaptiveMode}>
                        {this.props.children}
                    </DeprecatedAdaptiveModeContextProvider>
                </div>
            );
        }
        // todo а можно ли вообще тут разрешать указывать несколько детей?
        const children =
            Array.isArray(this.props.children) || !this.props.children
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
}
