/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
/**
 * Модуль, в котором находится логика по отмене скролла, который произошел в результате фокусировки
 */
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
        throw new TypeError(
            label + ' requires options.context to be an Element'
        );
    }

    return element;
}

// [elem, elem.parent, elem.parent.parent, �, html]
// will not contain the shadowRoot (DOCUMENT_FRAGMENT_NODE) and shadowHost
function getParents({ context }: { context: Element }): Element[] {
    const list = [];
    let element = contextToElement({
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

    return list;
}

interface IScrollPosition {
    element: Element;
    scrollTop: number;
    scrollLeft: number;
}

export interface IResetScrollConfig {
    resetVertical: boolean;
    resetHorizontal: boolean;
}

export type TEnableScroll = 'horizontal' | 'vertical' | boolean;

export function collectScrollPositions(
    context: Element,
    config: IResetScrollConfig = {
        resetVertical: true,
        resetHorizontal: true,
    }
): () => void {
    const parents = getParents({ context });
    const scrollPositionList: IScrollPosition[] = parents.map((element) => {
        return {
            element,
            scrollTop: element.scrollTop,
            scrollLeft: element.scrollLeft,
        };
    });

    return function resetScrollPositions(): void {
        scrollPositionList.forEach((savedScrollPosition: IScrollPosition) => {
            if (config.resetVertical) {
                savedScrollPosition.element.scrollTop =
                    savedScrollPosition.scrollTop;
            }
            if (config.resetHorizontal) {
                savedScrollPosition.element.scrollLeft =
                    savedScrollPosition.scrollLeft;
            }
        });
    };
}
