/**
 * @kaizen_zone 4fd9ac53-4889-442d-adee-a7756f91e01b
 */
import type { Control } from 'UICore/Base';
import { detection } from 'Env/Env';
import ScrollOnBodyStore from './ScrollOnBodyStore';

let scrollOnBodyState = false;
let detectMasterScroll = false;
let forceDisableBodyScroll = false;
// массив, который содержит значения положения скрола
// необходим чтобы каждое окно скролилось с начала, а не с середины
const lastScrollTopPosition = [];

const originStyles = {
    html: {
        overflowY: 'hidden',
        overflowAnchor: 'auto',
    },
    body: {},
    content: {},
};

const modifiedStyles = {
    html: {
        overflowY: 'auto',
        height: 'auto',
        minHeight: '100dvh',
        overflowAnchor: 'none',
    },
    body: {
        height: 'auto',
        overflow: 'clip',
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        paddingBottom: 'env(safe-area-inset-bottom)',
    },
    content: {
        height: 'auto',
        minHeight: detection.isMobileSafari && detection.IOSVersion === 15 ? '100vh' : '100dvh',
        // с display: contents не правильно рассчитывается высота, когда контента меньше чем страницы
        // так же не правильно работает position: sticky при скроле
        display: 'flex',
        overflowY: 'clip',
    },
};

function setAdaptiveStyle(control: Control<unknown, unknown>) {
    // @ts-ignore
    const container = control._container;
    if (!needApplyScrollOnBody(control, container)) {
        return;
    }
    setScrollOnBody(control);
}

function disableScrollContainers(control: Control<unknown, unknown>) {
    // @ts-ignore
    if (!control._$isScrollContainer) {
        return;
    }
    // @ts-ignore
    const scrollContainers = control._container;
    const scrollContainersBase = scrollContainers.firstChild as HTMLElement;
    const scrollContainersBaseUserContent = scrollContainersBase.firstChild
        .firstChild as HTMLElement;
    if (needApplyScrollOnBody(control, scrollContainers)) {
        scrollContainers.style.overflowY = 'auto';
        setTimeout(() => {
            // TODO: как правильно детектить мастер скролл
            if (
                scrollContainers.scrollHeight > window.visualViewport.height ||
                control._isMasterScroll
            ) {
                forceCallScrollHandler(control);
            }
        }, 0);
        setScrollOnBody(control);
    }
    if (needApplyScrollOnBody(control, scrollContainersBase)) {
        scrollContainersBase.style.overflowY = 'auto';
        setScrollOnBody(control);
    }
    if (needApplyScrollOnBody(control, scrollContainersBaseUserContent)) {
        scrollContainersBaseUserContent.style.height = 'auto';
        scrollContainersBaseUserContent.style.minHeight = '100%';
        setScrollOnBody(control);
    }
    // на ios < 16 надо дать возможность скролить внутри окна, но сам сролл на боди не должен работать
    // в версиях до 16 нативные механизмы не работают, поэтому будем делать через события
    // даем скрллить вложенный скролл, но не даем скролить боди
    const controlContainer: Element = control._container;
    if (detectScrollInsidePanel(controlContainer)) {
        controlContainer.addEventListener('touchmove', stopPropagationTouchMoveOnIOS);
        // так делаем потому что надо остановить тач над скролом, если делать на нем, то скролл перестанет работать
        controlContainer.parentElement.addEventListener('touchmove', preventTouchMoveOnIOS);
        const removeFnOnUnmount = function () {
            controlContainer.parentElement.removeEventListener('touchmove', preventTouchMoveOnIOS);
            controlContainer.removeEventListener('touchmove', stopPropagationTouchMoveOnIOS);
        };
        // очищаем все подписки при анмайнте, чтобы не было утечек
        control._$needRemoveBeforeUnmount.push(removeFnOnUnmount);
    }
}

function detectScrollInsidePanel(scrollContainer: Element): boolean {
    if (!detection.isMobileSafari && detection.IOSVersion < 16) {
        return false;
    }
    if (!cachedPopupList || cachedPopupList.getCount() === 0) {
        return false;
    }
    // ищем что скролл находится внутри окна, публичного апи для этого нет
    return isNodeInsideParentWithClassPart(
        scrollContainer,
        cachedPopupList.at(cachedPopupList.getCount() - 1).popupOptions.className
    );
}

function isNodeInsideParentWithClassPart(childNode: Element, parentClassPart: string): boolean {
    let currentNode: Element | null = childNode;

    while (currentNode) {
        if (currentNode.classList && currentNode.className.includes(parentClassPart)) {
            return true;
        }
        currentNode = currentNode.parentElement;
    }

    return false;
}

function applyPopupStyle(control) {
    // @ts-ignore
    if (!control._$isPopupContainer) {
        return;
    }
    // @ts-ignore
    const popupContainers = control._container;
    if (
        needApplyScrollOnBody(control, popupContainers) &&
        popupContainers.style.height === '100%'
    ) {
        popupContainers.style.height = '100vh';
        setScrollOnBody(control);
    }
}

function setScrollOnBody(control: Control<unknown, unknown>) {
    // @ts-ignore
    control.__$scrollOnBody = true;
}

function needApplyScrollOnBody(control: Control<unknown, unknown>, container: HTMLElement) {
    // @ts-ignore
    return container && !control.__$scrollOnBody;
}

function saveOriginStyle(element: HTMLElement, name: string) {
    const fieldName = Object.keys(modifiedStyles[name]);
    if (!fieldName.length) {
        return;
    }
    const forSave = {};
    for (const field of fieldName) {
        forSave[field] = element.style[field] || originStyles[name]?.[field];
    }
    originStyles[name] = forSave;
}

function applyStyle(element: HTMLElement, name: string, restoreOrigin: boolean = false) {
    const fieldName = Object.keys(modifiedStyles[name]);
    if (!fieldName.length) {
        return;
    }
    const forApply = restoreOrigin ? originStyles[name] : modifiedStyles[name];
    for (const field of fieldName) {
        if (forApply[field]) {
            element.style[field] = forApply[field];
        } else {
            element.style.removeProperty(field);
        }
    }
}

function forceCallScrollHandler(control) {
    const fn = (e) => {
        control._scrollHandler(e);
    };
    if (detectMasterScroll) {
        return;
    }
    window.addEventListener('scroll', fn);
    const originalUnmount = control._beforeUnmount;
    control._beforeUnmount = () => {
        window.removeEventListener('scroll', fn);
        detectMasterScroll = false;
        originalUnmount();
    };
    detectMasterScroll = true;
}

/**
 * Включение скролла на боди
 * включает основной функционал прокрутки на боди
 */
function enableBodyScroll() {
    if (scrollOnBodyState) {
        return;
    }
    const html = document.documentElement;
    const body = document.body;
    const content = document.getElementById('wasaby-content');

    saveOriginStyle(html, 'html');
    applyStyle(html, 'html');
    saveOriginStyle(body, 'body');
    applyStyle(body, 'body');

    if (content) {
        saveOriginStyle(content, 'content');
        applyStyle(content, 'content');
    }

    scrollOnBodyState = true;

    document.body.addEventListener('touchmove', preventTouchMoveOnIOS, {
        passive: false,
    });
}

/**
 * Выключение скролла на боди
 * выключает основной функционал прокрутки на боди
 * также сбрасывает позицию скрола
 */
function disableBodyScroll() {
    if (!scrollOnBodyState) {
        return;
    }
    const html = document.documentElement;
    const body = document.body;
    const content = document.getElementById('wasaby-content');

    applyStyle(html, 'html', true);
    applyStyle(body, 'body', true);
    applyStyle(content, 'content', true);

    document.body.removeEventListener('touchmove', preventTouchMoveOnIOS);

    scrollOnBodyState = false;
}

export let scrollOnBodyUnfrozen;
/**
 * "Разморозка" скролла на боди
 * включает возможность прокрутки скролла на боди
 * для полноценной работы скролл на боди должен быть включен с помощью enableBodyScroll
 */
function unfreezeBodyScroll() {
    if (scrollOnBodyUnfrozen === true || !scrollOnBodyState || forceDisableBodyScroll) {
        return;
    }
    // overflowY не работает на ios 16+
    const html = document.documentElement;
    html.style.overflow = 'auto';
    scrollOnBodyUnfrozen = true;
}

/**
 * "Заморозка" скролла на боди
 * отключает возможность прокрутки скролла на боди, но не сбрасывает позицию скролла
 */
function freezeBodyScroll() {
    if (scrollOnBodyUnfrozen === false || !scrollOnBodyState || forceDisableBodyScroll) {
        return;
    }
    // overflowY не работает на ios 16+
    const html = document.documentElement;
    html.style.overflow = 'hidden';
    scrollOnBodyUnfrozen = false;
}

/**
 * Сохранение текущей позиции скролла на боди и его сброс на 0
 * необходимо для работы нескольких списочных контролов
 */
function resetPositionBodyScroll(newBodyHeight?: number) {
    const html = document.documentElement;
    lastScrollTopPosition.push(html.scrollTop);
    html.scrollTop = 0;
    // TODO: надо понять как сбросить высоту контета, чтобы предотвратить его скролл
    // а так же чтобы при открытой панели скролл останавливался на нижней границе это панели
    // по стековым панелям еще один подводный камень есть, если внутри стековой панели есть асинхронный, то на момент построения будет не правильная высота окна
    // получается надо или пересчитывать высоту окна когда все асинхронные дети построятся
    // или как-то высчитывать контейнер реестра и ему выставлять height 0
    // const content = document.getElementById('wasaby-content');
    // contentHeight = content.offsetHeight;
    // content.style.maxHeight = `${newBodyHeight}px`;
}
/**
 * Восстановление последней сохраненной позиции боди скрола
 */
function restorePositionBodyScroll() {
    // TODO: надо понять как сбросить высоту контета, чтобы предотвратить его скролл
    // const content = document.getElementById('wasaby-content');
    // content.style.maxHeight = content.offsetHeight;
    const html = document.documentElement;
    // todo непонятно как это должно работать, если откроем несколько стек панелей, сохранится несколько значений,
    //  а потом восстанавливать будем только при закрытии всех. и возьмется неправильное значение.
    //  будто бы достаточно хранить значение при отрытии первого попапа, и восстанавливать закрывая его.
    const value = lastScrollTopPosition.pop();
    if (typeof value !== 'undefined') {
        html.scrollTop = value;
    }
}
function isSlidingPanel(popup) {
    // todo отключаем временно скролл на боди на стековых панелях тоже, там сложно поддержать правильную работу
    return false;
    // const lastPopupType = popup.controller.TYPE;
    // return lastPopupType === 'SlidingPanel';
}
function isNotificationPanel(popup) {
    const lastPopupType = popup.controller.TYPE;
    return lastPopupType === 'Notification';
}

function checkPopupStack(popupStack) {
    let onlyNotificationInStack = true;
    popupStack.each((item, _index) => {
        if (item.controller.TYPE !== 'Notification') {
            onlyNotificationInStack = false;
        }
    });
    return onlyNotificationInStack;
}

let cachedPopupList: any;
export function updateFreeze(popupList = undefined) {
    cachedPopupList = popupList || cachedPopupList;
    // при закрытии окна нам надо понимать следующее
    // - если закрыли все окна, значит скрол находится в реестре и мы должны скролить body
    // - если есть еще окна, надо проверить что это не стековое окно, если окно стековое, то мы тоже должны скролить body
    if (!cachedPopupList || cachedPopupList.getCount() === 0) {
        unfreezeBodyScroll();
        restorePositionBodyScroll();
    } else {
        const lastPopup = cachedPopupList.at(cachedPopupList.getCount() - 1);
        // открытые окна, могут содержать внутри себя scrollContainer
        // необходимо отключать скролл на боди для всех окон кроме стекового окна,
        // т.к. скрол в стековом окне должен скролить боди, чтобы работали нативные механизмы
        if (isSlidingPanel(lastPopup)) {
            unfreezeBodyScroll();
            resetPositionBodyScroll();
            return;
        }
        // для нотификационных окон, скролл замораживать не надо
        // првоеряем что сролл не заморожен
        // https://online.sbis.ru/opendoc.html?guid=b70989a1-b2da-4ad7-b762-a527d6821369&client=3
        if (isNotificationPanel(lastPopup) && scrollOnBodyUnfrozen !== false) {
            return;
        }
        // может быть ситуация, что нотификационное окно открывается пока открыты другие окна,
        // которые замораживают скролл
        // надо разморозить скролл, если в стеке остались толкьо нотификационные окна
        if (checkPopupStack(cachedPopupList) && scrollOnBodyUnfrozen === false) {
            unfreezeBodyScroll();
            restorePositionBodyScroll();
            return;
        }
        freezeBodyScroll();
    }
}

export function applyBodyScroll(control: Control<unknown, unknown>) {
    setAdaptiveStyle(control);
    disableScrollContainers(control);
    applyPopupStyle(control);
}

export function updateBodyScroll() {
    if (ScrollOnBodyStore.read('enabled')) {
        enableBodyScroll();
        // forced
        scrollOnBodyUnfrozen = undefined;
        updateFreeze();
    } else {
        unfreezeBodyScroll();
        disableBodyScroll();
    }
}

export function moveBodyScroll() {
    freezeBodyScroll();
    forceDisableBodyScroll = true;
}

export function unMoveBodyScroll() {
    forceDisableBodyScroll = false;
    unfreezeBodyScroll();
    restorePositionBodyScroll();
}

function preventTouchMoveOnIOS(e: Event) {
    if (!detection.isMobileSafari && detection.IOSVersion < 16) {
        return;
    }
    if (!cachedPopupList || cachedPopupList?.getCount() === 0) {
        return;
    }
    // на мобильном safari до 16 версии не поддерживаются нативные механизмы блокировки скролла на боди
    // поэтому для SlidingPanel, не на весь экран будем блокировать скролл через событие
    const lastPopup = cachedPopupList.at(cachedPopupList.getCount() - 1);
    const lastPopupType = lastPopup.controller.TYPE;
    if (lastPopupType === 'SlidingPanel' && !lastPopup.popupOptions.maximize) {
        e.preventDefault();
    }
}

function stopPropagationTouchMoveOnIOS(e: Event) {
    e.stopPropagation();
}
