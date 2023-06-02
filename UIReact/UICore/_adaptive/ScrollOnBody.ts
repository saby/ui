import type { Control } from 'UICore/Base';
import { detection } from 'Env/Env';

function setBodyScroll() {
    const html = document.documentElement;
    const body = document.body;
    const content = document.getElementById('wasaby-content');
    body.style.overflowY = 'auto';
    // for ios 15+
    html.style.height = 'auto';
    if (content) {
        content.style.height = 'auto';
        content.style.minHeight = '100%';
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
        scrollContainers.style.display = 'block';
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
    setBodyScroll();
}

export function applyBodyScroll(control: Control<unknown, unknown>) {
    setAdaptiveStyle(control);
    disableScrollContainers(control);
}