/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import { focus } from 'UICommon/Focus';
import getParentFocusComponents from '../Component/getParentFocusComponents';
import getFocusComponentContainer from '../Component/getFocusComponentContainer';

let isRestoreFocusStarted: boolean = false;
let mutationObserver: MutationObserver = null;
const mutationObserverConfig = {
    childList: true,
    subtree: true,
};

let activeElementWithParents: HTMLElement[] = null;
let lastActiveElement: HTMLElement;

export let isRestoreFocusInProgress = false;

export function startRestoreFocus(): void {
    if (typeof MutationObserver === 'undefined' || isRestoreFocusStarted) {
        return;
    }
    isRestoreFocusStarted = true;

    mutationObserver = new MutationObserver(mutationCallback);
    mutationObserver.observe(document, mutationObserverConfig);
    document.addEventListener('focusin', saveActiveElement, true);
    activeElementWithParents = [];
}

export function stopRestoreFocus(): void {
    if (typeof MutationObserver === 'undefined' || !isRestoreFocusStarted) {
        return;
    }
    isRestoreFocusStarted = false;

    mutationObserver.disconnect();
    mutationObserver = null;
    document.removeEventListener('focusin', saveActiveElement, true);
    activeElementWithParents = null;
}

function mutationCallback(): void {
    if (document.activeElement && document.activeElement !== document.body) {
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

function saveActiveElement(focusInEvent: FocusEvent): void {
    lastActiveElement = focusInEvent.target as HTMLElement;
    activeElementWithParents = getParentFocusComponents(lastActiveElement).map(
        getFocusComponentContainer
    );
}
