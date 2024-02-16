/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
/**
 * Модуль для создания корневого контрола и его оживления
 */

import * as AppEnv from 'Application/Env';
import * as AppInit from 'Application/Initializer';
import { loadAsync } from 'WasabyLoader/ModulesLoader';
import { Storage } from 'UICore/Adaptive';
import { Control, selectRenderDomNode, IControlConstructor } from 'UICore/Base';
import { IControlOptions } from 'UICommon/Base';

export interface ICreateControlOptions extends IControlOptions {
    application?: string;
    buildnumber?: string;
}

const isClient = typeof window !== 'undefined';

/**
 * Подготовка StateReceiver.
 * Создание корневого контрола и оживление приложения.
 * @param config
 * @param domElement
 */
export default function startFunction(
    config: ICreateControlOptions = {},
    domElement: HTMLElement
): void {
    config = config || {};
    if (
        isClient &&
        // @ts-ignore
        window.receivedStates &&
        AppInit.isInit()
    ) {
        // @ts-ignore
        AppEnv.getStateReceiver().deserialize(window.receivedStates);
    }

    // @ts-ignore
    let moduleName = domElement.attributes.application;
    if (moduleName) {
        moduleName = moduleName.value;
    }
    loadAsync(moduleName).then((module: IControlConstructor<IControlOptions>): void => {
        config.application = moduleName;
        // @ts-ignore
        config.buildnumber = window.buildnumber;

        /* В случае с Inferno мы должны вешать обработку на дочерний элемент. Так работает синхронизатор/
         * В случае с React, мы должны работать от непосредственно указанного элемента
         */
        const dom: HTMLElement = selectRenderDomNode(domElement);
        config.rskey =
            // @ts-ignore
            dom?.attributes?.key?.value || 'bd_';
        createControl(module, config, dom);
    });
}

/**
 * Создание|оживление корневого контрола.
 * @param control
 * @param config
 * @param dom
 */
function createControl(
    control: IControlConstructor<IControlOptions>,
    config: ICreateControlOptions,
    dom: HTMLElement
): void {
    let configReady: ICreateControlOptions = config || {};
    // @ts-ignore
    if (isClient && window.wsConfig) {
        // @ts-ignore
        configReady = { ...configReady, ...window.wsConfig };
    }

    const needHydrate = hydrateState();

    Control.createControl(control, configReady, dom, needHydrate);
}

let disableHydrateParam = false;
if (typeof window !== 'undefined' && typeof URLSearchParams !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    disableHydrateParam = urlParams.get('disableHydrate') === 'true';
}

// true - гидрируем, false - не гидрируем.
function hydrateState(): boolean {
    if (!isClient) {
        return false;
    }

    // Если гидратация выключена через куку или URL параметр - не гидрируем.
    if (AppEnv.cookie.get('disableHydrate') === 'true' || disableHydrateParam) {
        return false;
    }

    // для IE и старых браузеров можно не гидрировать, во избежание лишних проблем
    // visualViewport не поддерживается в старых браузерах https://caniuse.com/?search=window.visualViewport
    if (!window.visualViewport) {
        return false;
    }

    // Если размеры серверного и клиентского окна не совпадают, гидратация себя ведёт очень непредсказуемо.
    const aspects = Storage.getInstance().get();
    if (
        aspects.windowInnerWidth !== window.innerWidth ||
        aspects.windowInnerHeight !== window.innerHeight ||
        aspects.windowOuterWidth !== window.outerWidth ||
        aspects.windowOuterHeight !== window.outerHeight ||
        aspects.viewportWidth !== window.visualViewport.width ||
        aspects.viewportHeight !== window.visualViewport.height ||
        aspects.containerClientWidth !== document.body.clientWidth ||
        aspects.containerClientHeight !== document.body.clientHeight
    ) {
        return false;
    }

    // если на странице есть асинхронность - на клиент прилетела не полная верстка, а на клиенте за счет receivedState
    // построится полная, так что гидрация упадет, сделаем исключение и будем добиваться отказа от асинхронности
    // на сервере
    if (document.body.querySelectorAll('[name="$$wasaby$async$loading"]').length) {
        return false;
    }

    // CompoundContainer строится особенным образом. На сервере строится верстка и CompoundContainer
    // отрабатывает синхронно, а на клиенте он асинхронный и ждет загрузки контрола, который собирается строить.
    // (в базовом контроле умеем отличать пендинг промис от завершенного, так что возвращение Promise
    // из CompoundContainer отрабатывает по разному на сервере и клиенте)
    // Так что гидрация ругается на различия в верстке.
    if (document.body.querySelectorAll('.ws-CompoundContainer').length) {
        return false;
    }

    // если на странице строится slate текстовый редактор, на сервере он строит не ту верстку что на клиенте,
    // добавим в исключение и выпишем ошибку
    // https://online.sbis.ru/opendoc.html?guid=44222bc4-0fdf-4565-a553-7a6ea1e9e9f6&client=3
    if (document.body.querySelectorAll('.textEditor_slate_Viewer').length) {
        return false;
    }

    return true;
}
