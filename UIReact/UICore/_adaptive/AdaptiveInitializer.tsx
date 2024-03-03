/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
import * as React from 'react';
import { IAspects } from './Aspects';
import { SizeTracker, ISizes } from './SizeTracker';
import { AdaptiveContainer } from './AdaptiveContainer';
import { SearchParams } from './SearchParams';
import { ReactElement } from 'react';
import { IoC } from 'Env/Env';
import { Bus as EventBus, Channel } from 'Env/Event';
import { TouchDetect } from 'EnvTouch/EnvTouch';
import { AdaptiveModeClass } from './AdaptiveModeClass';
import { updateBodyScroll, updateFreeze } from './ScrollOnBody';
import { enableMobileKeyboardDetection, disableMobileKeyboardDetection } from './MobileKeyboard';
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
    private stopSizeChecking: () => void;
    private _forcedAspects: IAspects;
    private popupManagerChannel: Channel;

    constructor(props: any, context: any) {
        super(props);

        // todo isAdaptive - старое апи адаптивности. надо избавиться.
        // могут передать isAdaptive опцией, чтобы принудительно выключить адаптивность
        // здесь нужно это делать, чтобы isAdaptive был учтен в unsafe_getRootAdaptiveMode
        // в AdaptiveContainer тоже ловлю context.isAdaptive, потому что могут передать его где угодно
        const isAdaptiveStored = getStore('AdaptiveInitializer').get('isAdaptive');
        if (typeof isAdaptiveStored === 'undefined') {
            getStore('AdaptiveInitializer').set('isAdaptive', context.isAdaptive);
        }
        this._forcedAspects = getForcedAspects();

        this.popupManagerChannel = EventBus.channel('popupManager');

        const sizeTracker = new SizeTracker();
        let _sizes: ISizes;
        this.stopSizeChecking = sizeTracker.check((sizes) => {
            _sizes = sizes;

            // проверка что контрол был уже замаунчен
            if (this.state?.preload === false) {
                this.setState({
                    aspects: {
                        ...this.state.aspects,
                        ..._sizes,
                        ...this._forcedAspects,
                    },
                });
            }
        });

        this.state = {
            preload: true,
            aspects: {
                ..._sizes,
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

    private subscribeToPopupManager() {
        if (!ScrollOnBodyStore.read('enabled')) {
            return;
        }

        this.popupManagerChannel.subscribe('managerPopupCreated', this.updateFreeze, this);
        this.popupManagerChannel.subscribe('managerPopupDestroyed', this.updateFreeze, this);
    }

    private unsubscribeToPopupManager() {
        if (!ScrollOnBodyStore.read('enabled')) {
            return;
        }

        this.popupManagerChannel.unsubscribe('managerPopupCreated', this.updateFreeze, this);
        this.popupManagerChannel.unsubscribe('managerPopupDestroyed', this.updateFreeze, this);
    }
    private updateFreeze(_e, _config, popupList) {
        updateFreeze(popupList);
    }

    componentDidMount(): void {
        this.setState({ preload: false });
        updateBodyScroll();
        enableMobileKeyboardDetection();

        this.touchChangedHandler = this.touchChangedHandler.bind(this);
        touchDetector?.subscribe('touchChanged', this.touchChangedHandler);
        this.subscribeToPopupManager();
    }

    componentDidUpdate(): void {
        updateBodyScroll();
    }

    componentWillUnmount(): void {
        touchDetector?.unsubscribe('touchChanged', this.touchChangedHandler);
        disableMobileKeyboardDetection();
        this.stopSizeChecking();
        this.unsubscribeToPopupManager();
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
 */
export function getAdaptiveModeForLoaders() {
    return unsafe_getRootAdaptiveMode();
}

/**
 * Метод возвращает adaptiveMode, аналогично getAdaptiveModeForLoaders, но он костыльный,
 * используется временно для быстрого перехода на новые рельсы, когда-то будет удален, и по месту использования
 * будет искаться правильное решение.
 */
export function unsafe_getRootAdaptiveMode() {
    let _sizes;
    const sizeTracker = new SizeTracker();
    sizeTracker.check((sizes) => {
        _sizes = sizes;
    })();

    const aspects: IAspects = {
        ..._sizes,
        ...getForcedAspects(),
    };
    return new AdaptiveModeClass(aspects);
}
