import type { Control } from 'UICore/Base';

let scrollOnBodyState = false;
let detectMasterScroll = false;
const originStyles = {};

const modifiedStyles = {
    html: {
        overflowY: 'auto',
        height: 'auto',
        minHeight: '100dvh',
    },
    body: {
        height: 'auto',
    },
    content: {
        height: 'auto',
        minHeight: '100dvh',
        // с display: contents не правильно рассчитывается высота, когда контента меньше чем страницы
        // так же не правильно работает position: sticky при скроле
        display: 'flex',
    },
};

let fixedElementTopValue = 0;

const fixedElementStyle = {
    position: 'fixed',
    zIndex: '100',
    width: '100%',
    top: fixedElementTopValue,
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
        forSave[field] = element.style[field];
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
        element.style[field] = forApply[field];
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

export function enableBodyScroll() {
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
}

export function disableBodyScroll() {
    if (!scrollOnBodyState) {
        return;
    }
    const html = document.documentElement;
    const body = document.body;
    const content = document.getElementById('wasaby-content');

    applyStyle(html, 'html', true);
    applyStyle(body, 'body', true);
    applyStyle(content, 'content', true);

    scrollOnBodyState = false;
}

export function applyBodyScroll(control: Control<unknown, unknown>) {
    setAdaptiveStyle(control);
    disableScrollContainers(control);
    applyPopupStyle(control);
}

export function fixOnScrollObserver(
    triggerElement: Element,
    element: Element,
    hideOn: number = 1,
    additionClass?: string[]
) {
    // TODO: не понятно в какой момент должен фиксироваться элемент
    const config = {
        root: null,
        rootMargin: '0px',
        threshold: [0, hideOn],
    };
    const applyFixedStyleCallback = (entries) => {
        entries.forEach((entry) => {
            const fieldName = Object.keys(fixedElementStyle);
            const parent = element.parentNode;
            if (entry.intersectionRatio < hideOn) {
                const forSave = {};
                const forApply = fixedElementStyle;
                for (const field of fieldName) {
                    forSave[field] = element.style[field];
                    element.style[field] = forApply[field];
                }
                if (additionClass) {
                    element.classList.add(...additionClass);
                }
                element.__$originStyle = forSave;
                fixedElementTopValue = element.scrollHeight;

                parent.__$originPadding = parent.style.paddingTop;
                parent.style.paddingTop = `${fixedElementTopValue}px`;
            }
            if (entry.intersectionRatio === 1) {
                const forApply = element.__$originStyle;
                if (forApply) {
                    for (const field of fieldName) {
                        element.style[field] = forApply[field];
                    }
                }
                parent.style.paddingTop = parent.__$originPadding;

                if (additionClass) {
                    element.classList.remove(...additionClass);
                }
            }
        });
    };

    const observer = new IntersectionObserver(applyFixedStyleCallback, config);

    observer.observe(triggerElement);
}
