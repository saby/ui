/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import { focus } from 'UICommon/Focus';
import getParentFocusComponents from '../Component/getParentFocusComponents';
import getFocusComponentContainer from '../Component/getFocusComponentContainer';

let mutationObserver: MutationObserver | null = null;
const mutationObserverConfig = {
    childList: true,
    subtree: true,
};

let activeElementWithParents: HTMLElement[] = [];
let lastActiveElement: HTMLElement | null;

export let isRestoreFocusInProgress = false;

export function startRestoreFocus(): void {
    if (typeof MutationObserver === 'undefined' || mutationObserver) {
        return;
    }

    mutationObserver = new MutationObserver(mutationCallback);
    mutationObserver.observe(document, mutationObserverConfig);
    document.addEventListener('focusin', saveActiveElement, true);
    activeElementWithParents = [];
}

export function stopRestoreFocus(): void {
    if (typeof MutationObserver === 'undefined' || !mutationObserver) {
        return;
    }

    mutationObserver.disconnect();
    mutationObserver = null;
    document.removeEventListener('focusin', saveActiveElement, true);
    activeElementWithParents = [];
}

function mutationCallback(): void {
    if (document.activeElement && document.activeElement !== document.body) {
        // Если вызвать фокус в точке componentDidMount, рефы ещё не отстрелят, и дерево будет не актуальным.
        // Актуализируем родителей в mutationCallback, тут все рефы перерисовки уже отстрелены.
        saveActiveElementWithParents(document.activeElement as HTMLElement);

        // Активный элемент не удалился, фокус не улетел.
        return;
    }
    // body может быть активным элементом ещё и в процессе перевода фокуса, между событиями focusOut и focusIn.
    // В этом случае восстанавливать фокус не нужно.
    if (!lastActiveElement || document.body.contains(lastActiveElement)) {
        return;
    }
    isRestoreFocusInProgress = true;

    const lastActiveElementWithParents = activeElementWithParents;
    activeElementWithParents = [];
    lastActiveElement = null;
    for (let i = 0; i < lastActiveElementWithParents.length; i++) {
        const element = lastActiveElementWithParents[i];
        if (document.body.contains(element) && focus(element)) {
            break;
        }
    }

    isRestoreFocusInProgress = false;
}

function saveActiveElementWithParents(element: HTMLElement): void {
    activeElementWithParents = getParentFocusComponents(element).map(getFocusComponentContainer);
}

function saveActiveElement(focusInEvent: FocusEvent): void {
    lastActiveElement = focusInEvent.target as HTMLElement;
    saveActiveElementWithParents(lastActiveElement);
}
