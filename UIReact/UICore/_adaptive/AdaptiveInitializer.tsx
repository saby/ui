/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { IAspects } from './Aspects';
import { WindowSizeTracker, BodySizeTracker, IWindowSizes, IBodySizes } from './SizeTracker';
import { AdaptiveContainer } from './AdaptiveContainer';
import { SearchParams } from './SearchParams';
import { ReactElement } from 'react';
import { IoC } from 'Env/Env';
import { TouchDetect } from 'EnvTouch/EnvTouch';
import { AdaptiveModeClass } from './AdaptiveModeClass';
import { enableBodyScroll, disableBodyScroll } from './ScrollOnBody';
import { location as envLocation } from 'Application/Env';
import { getWasabyContext, TWasabyContext } from 'UICore/Contexts';
import { getStore } from 'Application/Env';
import { default as ScrollOnBodyStore } from './ScrollOnBodyStore';
import 'css!Tailwind/tailwind';

// При изменении isTouch нужно обновить AdaptiveContainer.
interface IAdaptiveInitializerAspects extends IAspects {
    realIsTouch: boolean;
}
interface IAdaptiveInitializerState {
    preload: boolean;
    aspects: Partial<IAdaptiveInitializerAspects>;
}

let touchDetector: TouchDetect;
if (typeof window !== 'undefined') {
    touchDetector = TouchDetect.getInstance();
}

function getForcedAspects(): IAspects {
    let href = '';
    try {
        href = envLocation.href;
    } catch (e) {
        IoC.resolve('ILogger').error(
            'UI/Adaptive:AdaptiveInitializer. ' +
                'Не получилось вычислить Application/Env:location.href',
            e
        );
    }

    const aspects: IAspects = {};
    const urlParams = new SearchParams(href);
    const width = urlParams.get('width');
    const height = urlParams.get('height');
    const isVertical = urlParams.get('isVertical');
    const isAdaptiveInitial = getStore('AdaptiveInitializer').get('isAdaptive');
    const isPhone =
        urlParams.get('isPhone') ||
        (typeof isAdaptiveInitial === 'boolean' ? isAdaptiveInitial + '' : undefined);
    const isTablet = urlParams.get('isTablet');
    const isTouch = urlParams.get('isTouch');
    // todo containerClientWidth
    if (typeof width === 'string') {
        aspects.containerClientWidth = parseInt(width, 10);
    }
    if (typeof height === 'string') {
        aspects.containerClientHeight = parseInt(height, 10);
    }
    if (typeof isVertical === 'string') {
        aspects.isVertical = isVertical === 'true';
    }
    if (typeof isPhone === 'string') {
        aspects.isPhone = isPhone === 'true';
    }
    if (typeof isTablet === 'string') {
        aspects.isTablet = isTablet === 'true';
    }
    if (typeof isTouch === 'string') {
        aspects.isTouch = isTouch === 'true';
    }
    return aspects;
}

/**
 * Компонент предназначен для инициализации системы адаптивности, используется в корне приложения
 * @class UICore/_adaptive/AdaptiveInitializer
 * @public .
 */
export class AdaptiveInitializer extends React.Component<any, IAdaptiveInitializerState> {
    private stopWindowSizeChecking: () => void;
    private stopBodySizeChecking: () => void;
    private _forcedAspects: IAspects;

    constructor(props: any, context: any) {
        super(props);

        // todo isAdaptive - старое апи адаптивности. надо избавиться.
        // могут передать isAdaptive опцией, чтобы принудительно выключить адаптивность
        // здесь нужно это делать, чтобы isAdaptive был учтен в unsafe_getRootAdaptiveMode
        // в AdaptiveContainer тоже ловлю context.isAdaptive, потому что могут передать его где угодно
        getStore('AdaptiveInitializer').set('isAdaptive', context.isAdaptive);
        this._forcedAspects = getForcedAspects();

        const windowSizeTracker = new WindowSizeTracker();
        let _windowSizes: IWindowSizes;
        this.stopWindowSizeChecking = windowSizeTracker.check((windowSizes) => {
            _windowSizes = windowSizes;

            // проверка что контрол был уже замаунчен
            if (this.state?.preload === false) {
                this.setState({
                    aspects: {
                        ...this.state.aspects,
                        ...windowSizes,
                        ...this._forcedAspects,
                    },
                });
            }
        }, true);

        const bodySizeTracker = new BodySizeTracker();
        let _bodySizes: IBodySizes;
        this.stopBodySizeChecking = bodySizeTracker.check((bodySizes) => {
            _bodySizes = bodySizes;

            // проверка что контрол был уже замаунчен
            if (this.state?.preload === false) {
                this.setState({
                    aspects: {
                        ...this.state.aspects,
                        ...bodySizes,
                        ...this._forcedAspects,
                    },
                });
            }
        }, true);

        this.state = {
            preload: true,
            aspects: {
                ..._windowSizes,
                ..._bodySizes,
                ...this._forcedAspects,
            },
        };
    }
    private touchChangedHandler(_e: unknown, isTouch: boolean) {
        // контрол ожил
        if (this.state?.preload === false) {
            // isTouch не форсирован
            if (typeof this._forcedAspects.isTouch !== 'boolean') {
                // значение реально изменилось
                if (this.state.aspects.realIsTouch !== isTouch) {
                    // todo hack
                    // запускаем перерисовку с новым инстансом аспектов, но без записи значения isTouch.
                    // это не форсированное значение, поэтому не задаем его в aspects.
                    // при пересоздании AdaptiveMode возьмется актуальное значение из touchDetector и актуализируется в куке.
                    const aspects = { ...this.state.aspects };
                    aspects.realIsTouch = isTouch;
                    this.setState({ aspects });
                }
            }
        }
    }

    protected operateScrollOnBody() {
        if (ScrollOnBodyStore.read('enabled')) {
            enableBodyScroll();
        } else {
            disableBodyScroll();
        }
    }

    componentDidMount(): void {
        this.setState({ preload: false });
        this.operateScrollOnBody();

        this.touchChangedHandler = this.touchChangedHandler.bind(this);
        touchDetector?.subscribe('touchChanged', this.touchChangedHandler);
    }

    componentDidUpdate(): void {
        this.operateScrollOnBody();
    }

    componentWillUnmount(): void {
        touchDetector?.unsubscribe('touchChanged', this.touchChangedHandler);
        this.stopWindowSizeChecking();
        this.stopBodySizeChecking();
    }

    render(): ReactElement {
        // в контролах нельзя использовать фичи, а контроллеры не имеют доступа к контексту
        // поэтому сохраним в стор значенеи фичи, и будет проверять в контролах его
        getStore('AdaptiveInitializer').set('isScrollOnBody', this.context.isScrollOnBody);
        if (typeof window !== 'undefined') {
            // ограничение размеров для интеграционных тестов для эмуляции аспектов адаптивности
            if (this._forcedAspects.containerClientWidth) {
                document.body.style.width = this._forcedAspects.containerClientWidth + 'px';
            }
            if (this._forcedAspects.containerClientHeight) {
                document.body.style.height = this._forcedAspects.containerClientHeight + 'px';
            }
        }

        return <AdaptiveContainer {...this.state.aspects}>{this.props.children}</AdaptiveContainer>;
    }

    static readonly contextType: TWasabyContext = getWasabyContext();
}

// todo посмотрим нужен ли он будет, мб добавится логика специально для лоадеров. если нет - удалю
/**
 * Метод возвращает adaptiveMode, когда он требуется вне рамок построения верстки, например в загрузчиках данных на сервере
 * Такой способ получения adaptiveMode не учитывает актуальные размеры контейнера, задаваемые через AdaptiveContainer.
 * Требуется использовать этот метод только в тех случаях, когда нужно получить adaptiveMode легально
 * вне рамок построения верстки.
 * @param skipFirstRecalculate
 */
export function getAdaptiveModeForLoaders(skipFirstRecalculate?: boolean) {
    return unsafe_getRootAdaptiveMode(skipFirstRecalculate);
}

/**
 * Метод возвращает adaptiveMode, аналогично getAdaptiveModeForLoaders, но он костыльный,
 * используется временно для быстрого перехода на новые рельсы, когда-то будет удален, и по месту использования
 * будет искаться правильное решение.
 * @param skipFirstRecalculate
 */
export function unsafe_getRootAdaptiveMode(skipFirstRecalculate?: boolean) {
    let _windowSizes;
    let _bodySizes;

    const windowSizeTracker = new WindowSizeTracker();
    windowSizeTracker.check((windowSizes) => {
        _windowSizes = windowSizes;
    }, skipFirstRecalculate)();
    const bodySizeTracker = new BodySizeTracker();
    bodySizeTracker.check((bodySizes) => {
        _bodySizes = bodySizes;
    }, skipFirstRecalculate)();

    const aspects: IAspects = {
        ..._windowSizes,
        ..._bodySizes,
        ...getForcedAspects(),
    };
    return new AdaptiveModeClass(aspects);
}
