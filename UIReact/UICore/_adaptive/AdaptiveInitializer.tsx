/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { IAspects } from './Aspects';
import { createSizeTracker } from './SizeTracker';
import { AdaptiveContainer } from './AdaptiveContainer';
import { SearchParams } from './SearchParams';
import { ReactElement } from 'react';
import { detection, IoC } from 'Env/Env';
import { TouchDetect } from 'EnvTouch/EnvTouch';
import { AdaptiveModeClass } from './AdaptiveModeClass';
import { enableBodyScroll } from './ScrollOnBody';
import { location as envLocation } from 'Application/Env';

interface IAdaptiveInitializerState {
    preload: boolean;
    aspects: IAspects;
}

let touchDetector: TouchDetect;
if (typeof window !== 'undefined') {
    touchDetector = TouchDetect.getInstance();
}

function getForcedAspects(): IAspects {
    let href = '';
    try {
        href = envLocation.href;
    } catch(e) {
        IoC.resolve('ILogger').error('UI/Adaptive:AdaptiveInitializer. ' +
            'Не получилось вычислить Application/Env:location.href', e);
    }

    const aspects: IAspects = {};
    const urlParams = new SearchParams(href);
    const width = urlParams.get('width');
    const height = urlParams.get('height');
    const isVertical = urlParams.get('isVertical');
    const isPhone = urlParams.get('isPhone');
    const isTablet = urlParams.get('isTablet');
    const isTouch = urlParams.get('isTouch');
    if (width) {
        aspects.width = parseInt(width, 10);
    }
    if (height) {
        aspects.height = parseInt(height, 10);
    }
    if (isVertical) {
        aspects.isVertical = isVertical === 'true';
    }
    if (isPhone) {
        aspects.isPhone = isPhone === 'true';
    }
    if (isTablet) {
        aspects.isTablet = isTablet === 'true';
    }
    if (isTouch) {
        aspects.isTouch = isTouch === 'true';
    }
    return aspects;
}

export class AdaptiveInitializer extends React.Component<
    any,
    IAdaptiveInitializerState
> {
    private stopChecking: () => void;
    private _forcedAspects: IAspects;

    constructor(props: any) {
        super(props);

        this._forcedAspects = getForcedAspects();
        const sizeTracker = createSizeTracker();

        let aspectsInitial: IAspects;
        this.stopChecking = sizeTracker.check((aspects) => {
            aspects.isTouch = !!(
                detection.isMobilePlatform || touchDetector?.isTouch()
            );
            aspectsInitial = {...aspects, ...this._forcedAspects};

            // проверка что контрол был уже замаунчен
            if (this.state?.preload === false) {
                this.setState({ aspects: aspectsInitial });
            }
        });

        this.state = {
            preload: true,
            aspects: aspectsInitial,
        };
    }
    private touchChangedHandler(_e, isTouch) {
        if (this.state?.preload === false) {
            if (this.state.aspects.isTouch !== isTouch) {
                const aspects = { ...this.state.aspects };
                aspects.isTouch = this._forcedAspects.isTouch ?? isTouch;
                this.setState({ aspects });
            }
        }
    }
    componentDidMount(): void {
        this.setState({ preload: false });

        if (unsafe_getRootAdaptiveMode().device.isPhone()) {
            enableBodyScroll();
        }

        touchDetector?.subscribe('touchChanged', this.touchChangedHandler);
    }
    componentWillUnmount(): void {
        touchDetector?.unsubscribe('touchChanged', this.touchChangedHandler);
        this.stopChecking();
    }

    render(): ReactElement {
        if (typeof window !== 'undefined') {
            // ограничение размеров для интеграционных тестов для эмуляции аспектов адаптивности
            if (this._forcedAspects.width) {
                document.body.style.width = this._forcedAspects.width + 'px';
            }
            if (this._forcedAspects.height) {
                document.body.style.height = this._forcedAspects.height + 'px';
            }
        }

        return (
           <AdaptiveContainer {...this.state.aspects}>
               {this.props.children}
           </AdaptiveContainer>
        );
    }
}

// todo посмотрим нужен ли он будет, мб добавится логика специально для лоадеров. если нет - удалю
export function getAdaptiveModeForLoaders() {
    return unsafe_getRootAdaptiveMode();
}
export function unsafe_getRootAdaptiveMode() {
    const sizeTracker = createSizeTracker();
    let aspectsInitial: IAspects;
    sizeTracker.check((aspects) => {
        aspects.isTouch = detection.isMobilePlatform;
        aspectsInitial = {...aspects, ...getForcedAspects()};
    })();

    return new AdaptiveModeClass(aspectsInitial);
}
