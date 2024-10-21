/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
/**
 * Модуль, в котором находится логика по отмене скролла, который произошел в результате фокусировки
 */
import { detection } from 'Env/Env';

type TInput = NodeList | Element | HTMLCollection | Node[] | string | void;

// input may be undefined, selector-string, Node, NodeList, HTMLCollection, array of Nodes
// yes, to some extent this is a bad replica of jQuery's constructor function
function nodeArray(input: TInput): Node[] {
    if (!input) {
        return [];
    }

    if (Array.isArray(input)) {
        return input;
    }

    if (typeof input === 'string') {
        const result = document.querySelectorAll(input);
        return [].slice.call(result);
    }

    if ('length' in input) {
        return [].slice.call(input);
    }

    if (input.nodeType !== undefined) {
        return [input];
    }

    throw new TypeError('unexpected input ' + String(input));
}

function isElementDocument(element: Node): element is Document {
    return element && element.nodeType === Node.DOCUMENT_NODE;
}

function contextToElement({
    context,
    label = 'context-to-element',
    resolveDocument,
    defaultToDocument,
}: {
    context: Element;
    label: string;
    resolveDocument: boolean;
    defaultToDocument: boolean;
}): Node {
    let element = nodeArray(context)[0];

    if (resolveDocument && isElementDocument(element)) {
        element = element.documentElement;
    }

    if (!element && defaultToDocument) {
        return document.documentElement;
    }

    if (!element) {
        throw new TypeError(label + ' requires valid options.context');
    }

    if (
        element.nodeType !== Node.ELEMENT_NODE &&
        element.nodeType !== Node.DOCUMENT_FRAGMENT_NODE
    ) {
        throw new TypeError(label + ' requires options.context to be an Element');
    }

    return element;
}

// [elem, elem.parent, elem.parent.parent, �, html]
// will not contain the shadowRoot (DOCUMENT_FRAGMENT_NODE) and shadowHost
function getParents({ context }: { context: Element }): Element[] {
    const list = [];
    let element: Node | null = contextToElement({
        label: 'get/parents',
        context,
        resolveDocument: false,
        defaultToDocument: false,
    });

    while (element) {
        list.push(element);
        // IE does know support parentElement on SVGElement
        element = element.parentNode;
        if (element && element.nodeType !== Node.ELEMENT_NODE) {
            element = null;
        }
    }

    return list as Element[];
}

interface IScrollPosition {
    element: Element;
    scrollTop: number;
    scrollLeft: number;
}

interface IResetScrollConfig {
    resetVertical: boolean;
    resetHorizontal: boolean;
}

export type TEnableScroll = 'horizontal' | 'vertical' | boolean;

// Empty function, does nothing
const ignoreResetScroll = () => {
    // empty
};

export function collectScrollPositions(
    context: Element,
    config: IResetScrollConfig = {
        resetVertical: true,
        resetHorizontal: true,
    }
): () => void {
    if (
        detection.isMobileIOS &&
        (detection.safari || detection.chrome) &&
        isIosScrollableInput(context)
    ) {
        // In iOS Safari and Chrome pressing on an editable area (like input
        // or textarea) pops up the keyboard and scrolls the input into
        // view.
        return ignoreResetScroll;
    }
    const { resetVertical, resetHorizontal } = config;
    if (!resetVertical && !resetHorizontal) {
        return ignoreResetScroll;
    }
    const parents = getParents({ context });
    const scrollPositionList: IScrollPosition[] = parents.map((element) => {
        return {
            element,
            scrollTop: element.scrollTop,
            scrollLeft: element.scrollLeft,
        };
    });

    return function resetScrollPositions(): void {
        scrollPositionList.forEach(({ element, scrollTop, scrollLeft }: IScrollPosition) => {
            if (resetVertical && element.scrollTop !== scrollTop) {
                element.scrollTop = scrollTop;
            }
            if (resetHorizontal && element.scrollLeft !== scrollLeft) {
                element.scrollLeft = scrollLeft;
            }
        });
    };
}
// List of input types that iOS Safari and Chrome scroll to when focused
const iosScrollableInputTypes = ['text', 'date', 'password', 'email', 'number'];

// Check if the iOS Safari and Chrome would scroll to the given
// element when it is focused
function isIosScrollableInput(element: Element): boolean {
    const tagName = element.tagName.toLowerCase();
    const inputType = element.getAttribute('type');

    const isScrollableInput =
        tagName === 'input' && (!inputType || iosScrollableInputTypes.indexOf(inputType) >= 0);
    const isTextArea = tagName === 'textarea';
    const isEditable = element.hasAttribute('contenteditable');

    return isScrollableInput || isTextArea || isEditable;
}
