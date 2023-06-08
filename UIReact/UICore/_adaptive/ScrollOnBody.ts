import type { Control } from 'UICore/Base';

function setBodyScroll() {
    const html = document.documentElement;
    const body = document.body;
    const content = document.getElementById('wasaby-content');
    body.style.overflowY = 'auto';
    // убираем высоту с html, т.к. если ее кто-то задаст, то скроллить body нельзя
    html.style.height = '';
    if (content) {
        content.style.height = 'auto';
        content.style.minHeight = '100%';
        // с display: contents не правильно рассчитывается высота, когда контента меньше чем страницы
        // так же не правильно работает position: sticky при скроле
        content.style.display = 'flex';
    }
}

function setAdaptiveStyle(control: Control<unknown, unknown>) {
    if (!control._$adaptiveStyles) {
        return;
    }
    // @ts-ignore
    const container = control._container;
    if (!needApplyScrollOnBody(control, container)) {
        return;
    }
    Object.assign(container.style, control._$adaptiveStyles);
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
    const scrollContainersBaseUserContent = scrollContainersBase.firstChild.firstChild as HTMLElement;
    if (needApplyScrollOnBody(control, scrollContainers)) {
        scrollContainers.style.overflowY = 'auto';
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

function setScrollOnBody(control: Control<unknown, unknown>) {
    // @ts-ignore
    control.__$scrollOnBody = true;
}

function needApplyScrollOnBody(control: Control<unknown, unknown>, container: HTMLElement) {
    // @ts-ignore
    return container && !control.__$scrollOnBody;
}

export function enableBodyScroll() {
    return;
    setBodyScroll();
}

export function applyBodyScroll(control: Control<unknown, unknown>) {
    return;
    setAdaptiveStyle(control);
    disableScrollContainers(control);
}