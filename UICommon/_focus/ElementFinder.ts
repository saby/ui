/**
 * Модуль содержит логику нахождения следующего элемента для фокусировки
 */

import { IFocusElementProps, TPropsGetter } from './IFocus';
import { canAcceptFocusControlOnElement } from 'Core/FocusCompatible';

import { isElementVisible } from 'UICommon/Utils';

const CANDIDATE_SELECTOR = [
    'a[href]',
    'link',
    'button',
    'input',
    'select',
    'textarea',
];

function assert(cond: boolean, msg?: string | (() => string)): void {
    let message: string;
    if (!cond) {
        message = typeof msg === 'function' ? msg() : msg;
        throw new Error(message || 'assert');
    }
}

function getStyle(element: HTMLElement, style: string): string {
    return window.getComputedStyle(element)[style];
}

// Determines if the passed element can accept focus themselves instead of
// delegating it to children. These are the usual interactive controls
// (buttons, links, inputs) and containers with 'contenteditable'
function canAcceptSelfFocus(element: HTMLElement): boolean {
    const tabIndex = element.tabIndex;

    return (
        getTabStopState(element) ||
        (tabIndex !== -1 && element.hasAttribute('contenteditable'))
    );
}

function getTabStopState(element: HTMLElement): boolean {
    for (let selector = 0; selector < CANDIDATE_SELECTOR.length; selector++) {
        if (element.matches(CANDIDATE_SELECTOR[selector])) {
            return true;
        }
    }
    return false;
}

const canHasHrefElements = ['a', 'area'];
const canBeDisabledElements = ['input', 'textarea', 'select', 'button'];

// Вычислим подходящий нашей системе фокусов табиндекс, если он не задан явно.
function fixInvalidTabindex(
    element: HTMLElement,
    isContentEditable: boolean
): number {
    if (isContentEditable) {
        return 0;
    }
    const tagName: string = element.tagName.toLowerCase();
    if (canHasHrefElements.indexOf(tagName) !== -1) {
        return element.getAttribute('href') ? 0 : -1;
    }
    if (canBeDisabledElements.indexOf(tagName) !== -1) {
        return element.getAttribute('disabled') === null ? 0 : -1;
    }
    return -1;
}

export function getElementProps(element: HTMLElement): IFocusElementProps {
    const classList = element.classList;
    const isHidden: boolean =
        getStyle(element, 'display') === 'none' ||
        getStyle(element, 'visibility') === 'hidden';

    const enabled: boolean = !isHidden && !classList.contains('ws-disabled');
    const createsContext: boolean =
        element['ws-creates-context'] === 'true' ||
        element.getAttribute('ws-creates-context') === 'true';
    const delegatesTabfocus: boolean =
        element['ws-delegates-tabfocus'] === 'true' ||
        element.getAttribute('ws-delegates-tabfocus') === 'true';
    const tabCycling: boolean =
        element['ws-tab-cycling'] === 'true' ||
        element.getAttribute('ws-tab-cycling') === 'true';

    const tabIndexAttr = element.getAttribute('tabindex');
    let tabIndex: number = parseInt(tabIndexAttr, 10);
    let tabStop: boolean = tabIndex >= 0;

    const isContentEditable =
        element.getAttribute('contenteditable') === 'true';

    if (isNaN(tabIndex)) {
        tabIndex = fixInvalidTabindex(element, isContentEditable);
        tabStop = isContentEditable || getTabStopState(element);
    }

    return {
        enabled,
        tabStop,
        createsContext,
        tabIndex,
        delegateFocusToChildren: delegatesTabfocus && !isContentEditable,
        tabCycling,
    };
}

function firstElementChild(element: HTMLElement): HTMLElement {
    return element.firstElementChild
        ? (element.firstElementChild as HTMLElement)
        : null;
}

function lastElementChild(element: HTMLElement): HTMLElement {
    return element.lastElementChild
        ? (element.lastElementChild as HTMLElement)
        : null;
}

function previousElementSibling(element: HTMLElement): HTMLElement {
    return element.previousElementSibling
        ? (element.previousElementSibling as HTMLElement)
        : null;
}

function nextElementSibling(element: HTMLElement): HTMLElement {
    return element.nextElementSibling
        ? (element.nextElementSibling as HTMLElement)
        : null;
}

/**
 * сравнивает табиндексы по величине
 * @param i1
 * @param i2
 * @returns {number}
 * @param reverse
 */
function compareIndexes(
    index1: number,
    index2: number,
    reverse: boolean
): -1 | 0 | 1 {
    assert(typeof index1 === 'number' && typeof index2 === 'number');

    const i1 = index1 === 0 ? Infinity : index1 > 0 ? index1 : -1;
    const i2 = index2 === 0 ? Infinity : index2 > 0 ? index2 : -1;

    if (i2 === -1 && i1 !== -1) {
        return 1;
    }
    if (i1 === -1 && i2 !== -1) {
        return -1;
    }

    if (i1 > i2) {
        return reverse ? -1 : 1;
    }
    if (i1 < i2) {
        return reverse ? 1 : -1;
    }
    return 0;
}

function findNextElement(
    element: HTMLElement,
    props: IFocusElementProps,
    reverse: boolean,
    contextElement: HTMLElement
): HTMLElement {
    const stepInto = props.enabled && !props.createsContext;
    let next;
    let parent;

    if (stepInto) {
        next = reverse ? lastElementChild(element) : firstElementChild(element);
    }

    if (!next) {
        next = reverse
            ? previousElementSibling(element)
            : nextElementSibling(element);
        if (!next) {
            parent = element.parentNode;
            while (parent !== contextElement && !next) {
                next = reverse
                    ? previousElementSibling(parent)
                    : nextElementSibling(parent);
                if (!isElementVisible(next)) {
                    next = undefined;
                }
                if (!next) {
                    parent = parent.parentNode;
                }
            }
        }
    }

    return next || contextElement;
}

function findInner(
    elem: HTMLElement,
    reverse: boolean,
    propsGetter: TPropsGetter,
    tabbable: boolean = false
): HTMLElement {
    return find(
        elem,
        undefined,
        reverse ? 0 : 1,
        reverse,
        propsGetter,
        tabbable
    );
}

function startChildElement(parent: HTMLElement, reverse: boolean): HTMLElement {
    return reverse ? lastElementChild(parent) : firstElementChild(parent);
}

/**
 * Обходит DOM, обход осуществляется в пределах rootElement. При этом если находит элемент, в который может провалиться,
 * проваливается и ищет там.
 */
function find(
    contextElement: HTMLElement,
    fromElement: HTMLElement,
    givenFromElementTabIndex: number | undefined,
    reverse: boolean,
    propsGetter: TPropsGetter,
    tabbable: boolean = false
): HTMLElement {
    assert(
        contextElement &&
            (fromElement || givenFromElementTabIndex !== undefined) &&
            propsGetter &&
            contextElement !== fromElement
    );

    let next: HTMLElement;
    let nextProps: IFocusElementProps;
    let stage: 0 | 1;
    let result: HTMLElement;
    let cmp: -1 | 0 | 1;
    let props: IFocusElementProps;
    let nearestElement: HTMLElement = null;
    let nearestTabIndex: number = null;
    let foundDelegated: HTMLElement;
    let savedDelegated: HTMLElement;
    let fromElementTabIndex: number = givenFromElementTabIndex;

    if (fromElement) {
        props = propsGetter(fromElement, tabbable);
        fromElementTabIndex = props.tabIndex;
        next = findNextElement(fromElement, props, reverse, contextElement);
    } else {
        next = reverse
            ? lastElementChild(contextElement)
            : firstElementChild(contextElement);
        next = next || contextElement;
    }

    function canDelegate(
        nextElement: HTMLElement,
        nextElementProps: IFocusElementProps
    ): boolean {
        if (
            nextElementProps.delegateFocusToChildren &&
            nextElement.childElementCount
        ) {
            if (canAcceptFocusControlOnElement(nextElement)) {
                // для совместимости, чтобы старый компонент внутри нового окружения мог принять фокус
                foundDelegated = nextElement;
            } else {
                foundDelegated = findInner(
                    nextElement,
                    reverse,
                    propsGetter,
                    tabbable
                );
            }
        }
        // элемент может принять фокус только если он не делегирует внутрь
        // или сам является фокусируемем элементом (тогда игнорируем флаг делегации внутрь, некуда там делегировать)
        // или делегирует внутрь и внутри есть что сфокусировать (тогда он делегирует фокус внутрь)
        return !!(
            !nextElementProps.delegateFocusToChildren ||
            canAcceptSelfFocus(nextElement) ||
            foundDelegated
        );
    }

    let startFromFirst = false;
    for (stage = 0; stage !== 2 && !result; stage++) {
        while (next !== contextElement && next !== fromElement && !result) {
            nextProps = propsGetter(next, tabbable);

            if (nextProps.enabled && nextProps.tabStop) {
                cmp = compareIndexes(
                    nextProps.tabIndex,
                    fromElementTabIndex,
                    reverse
                );
                if (cmp === 0 && stage === 0) {
                    // если индекс совпал, мы уже нашли то что надо
                    if (canDelegate(next, nextProps)) {
                        result = next;
                        savedDelegated = foundDelegated;
                    }
                } else if (cmp > 0) {
                    // обновляем ближайший, если ti у next больше fromElement.ti, но меньше ti ближайшего
                    if (!result) {
                        // проверяем только если еще нет result
                        if (stage === 0) {
                            if (
                                nearestElement === null ||
                                compareIndexes(
                                    nextProps.tabIndex,
                                    nearestElement.tabIndex,
                                    reverse
                                ) < 0
                            ) {
                                if (canDelegate(next, nextProps)) {
                                    nearestElement = next;
                                    nearestTabIndex = nextProps.tabIndex;
                                    savedDelegated = foundDelegated;
                                }
                            }
                        } else {
                            if (
                                nearestElement === null ||
                                compareIndexes(
                                    nextProps.tabIndex,
                                    nearestElement.tabIndex,
                                    reverse
                                ) < 0 ||
                                (startFromFirst &&
                                    compareIndexes(
                                        nextProps.tabIndex,
                                        nearestElement.tabIndex,
                                        reverse
                                    ) <= 0)
                            ) {
                                if (canDelegate(next, nextProps)) {
                                    nearestElement = next;
                                    nearestTabIndex = nextProps.tabIndex;
                                    savedDelegated = foundDelegated;

                                    startFromFirst = false;
                                }
                            }
                        }
                    }
                }
            }

            // Если нативно уходим с элемента с табиндексом -1, ищем любой первый элемент https://jsfiddle.net/2v4eq4rn/
            if (fromElementTabIndex === -1 && nearestElement) {
                result = nearestElement;
            }

            if (!result) {
                next = findNextElement(
                    next,
                    nextProps,
                    reverse,
                    contextElement
                );
                // if (stage === 0 && !next) { // todo ?? findNextElement
                //    next = contextElement;
                // }
            }
        }

        if (next === contextElement && stage === 0) {
            // завершение stage=0, элемент не найден
            if (
                fromElement &&
                ((reverse === false && fromElementTabIndex > 0) ||
                    (reverse === true &&
                        fromElementTabIndex !== 1 &&
                        fromElementTabIndex !== -1))
            ) {
                next = startChildElement(contextElement, reverse);
            }
        }
        if (stage === 0) {
            startFromFirst = true;
        }
    }

    assert(!!result || next === fromElement || next === contextElement);

    if (!result && nearestElement) {
        // assert(fromElementTabIndex > 0 || (reverse && fromElementTabIndex === 0));
        if (nearestTabIndex >= 0) {
            result = nearestElement;
        }
    }

    // ищем подходящий элемент для всех элементов, пока можем проваливаться внутрь нового контекста
    if (result && savedDelegated) {
        result = savedDelegated;
        assert(!!result);
    }

    return result;
}

export function findFirstInContext(
    contextElement: HTMLElement,
    reverse: boolean,
    propsGetter: TPropsGetter = getElementProps,
    tabbable: boolean = false
): HTMLElement {
    return find(
        contextElement,
        undefined,
        reverse ? 0 : 1,
        reverse,
        propsGetter,
        tabbable
    );
}

function getValidatedWithContext(
    element: HTMLElement,
    rootElement: HTMLElement,
    propsGetter: TPropsGetter,
    tabbable: boolean = false
): { element: HTMLElement; context: HTMLElement } {
    let context;
    let lastInvalid = null;
    let parent = element;

    while (parent && parent !== rootElement) {
        if (!propsGetter(parent, tabbable).enabled) {
            lastInvalid = parent;
        }
        parent = parent.parentNode as HTMLElement;
    }

    assert(!!parent, 'Узел fromElement должен лежать внутри узла rootElement');

    const validatedElement = lastInvalid || element;

    if (validatedElement !== rootElement) {
        parent = validatedElement.parentNode;
        while (
            parent !== rootElement &&
            !propsGetter(parent, tabbable).createsContext
        ) {
            parent = parent.parentNode as HTMLElement;
        }
        context = parent;
    }

    return {
        element, // разрешённый/запрещённый, и лежит в разрешённой иерархии, лежит точно в элементе context
        context, // разрешённый, и лежит в разрешённой иерархии
    };
}

function checkElement(element: HTMLElement, paramName: string): void {
    // разрешаются только рутовые элементы, у которых есть parentNode или они являются  documentElement
    const hasParentNode: boolean =
        element === document.documentElement || !!element.parentNode;
    assert(
        element &&
            element.ownerDocument &&
            hasParentNode &&
            element.nodeType === Node.ELEMENT_NODE,
        'Плохой параметр ' + paramName
    );
}

/**
 * ищем следующий элемент в обходе, с учетом того, что у некоторых элементов может быть свой контекст табиндексов
 */
export function findWithContexts(
    rootElement: HTMLElement,
    fromElement: HTMLElement,
    reverse: boolean,
    propsGetter: TPropsGetter = getElementProps,
    tabbable: boolean = false
): HTMLElement {
    checkElement(fromElement, 'fromElement');
    checkElement(rootElement, 'rootElement');

    let validated = getValidatedWithContext(
        fromElement,
        rootElement,
        propsGetter,
        tabbable
    );
    let result = validated.element;

    if (result !== rootElement) {
        do {
            result = find(
                validated.context,
                validated.element,
                undefined,
                reverse,
                propsGetter,
                tabbable
            );
            if (!result) {
                if (propsGetter(validated.context, tabbable).tabCycling) {
                    break;
                } else {
                    validated = getValidatedWithContext(
                        validated.context,
                        rootElement,
                        propsGetter,
                        tabbable
                    );
                }
            }
        } while (!result && validated.element !== rootElement);
    }

    // прокомментить
    if (result === rootElement) {
        result = findFirstInContext(
            rootElement,
            reverse,
            propsGetter,
            tabbable
        );
    }

    // прокомментить
    if (
        !result &&
        propsGetter(validated.context || rootElement, tabbable).tabCycling
    ) {
        result = findFirstInContext(
            validated.context || rootElement,
            reverse,
            propsGetter,
            tabbable
        );
        if (result === undefined) {
            result = fromElement;
        }
    }

    return result;
}
