/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
/**
 * Модуль для создания корневого контрола и его оживления
 */

import * as AppEnv from 'Application/Env';
import * as AppInit from 'Application/Initializer';
import { loadAsync } from 'WasabyLoader/ModulesLoader';
import { unsafe_getRootAdaptiveMode } from 'UICore/Adaptive';
import { Control, selectRenderDomNode, IControlConstructor } from 'UICore/Base';
import { IControlOptions } from 'UICommon/Base';
import { cookie } from 'Env/Env';

export interface ICreateControlOptions extends IControlOptions {
    application?: string;
    buildnumber?: string;
    bootstrapKey?: string;
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
        config.bootstrapKey = config.rskey =
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
    if (cookie.get('disableHydrate') === 'true' || disableHydrateParam) {
        return false;
    }

    // Если размеры серверного и клиентского окна не совпадают, гидратация себя ведёт очень непредсказуемо.
    const serverAdaptiveAcpects = unsafe_getRootAdaptiveMode(true);
    if (
        serverAdaptiveAcpects.window.innerHeight.value !== window.innerHeight ||
        serverAdaptiveAcpects.window.innerWidth.value !== window.innerWidth ||
        serverAdaptiveAcpects.container.clientWidth.value !== document.body.clientWidth ||
        serverAdaptiveAcpects.container.clientHeight.value !== document.body.clientHeight ||
        serverAdaptiveAcpects.container.scrollWidth.value !== document.body.scrollWidth ||
        serverAdaptiveAcpects.container.scrollHeight.value !== document.body.scrollHeight
    ) {
        return false;
    }

    // если на странице есть асинхронность - на клиент прилетела не полная верстка, а на клиенте за счет receivedState
    // построится полная, так что гидрация упадет, сделаем исключение и будем добиваться отказа от асинхронности
    // на сервере
    if (document.body.querySelectorAll('[name="$$wasaby$async$loading"]').length) {
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
