/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
/**
 * Утилита для кроссбраузерной фокусировки, с возможностью отключить вызов экранной клавиатуре и отменить скролл при фокусировке
 */

import { detection } from 'Env/Env';
import { TouchDetect } from 'EnvTouch/EnvTouch';

import { Logger } from 'UICommon/Utils';

import { collectScrollPositions, TEnableScroll } from './_ResetScrolling';
import * as ElementFinder from './ElementFinder';

import { IFocusConfig, IMatchesElement, IIEElement } from './IFocus';

function isIEElement(element: Element): element is IIEElement {
    return detection.isIE && 'setActive' in element;
}

let isTouchInterface = false;
if (typeof window !== 'undefined') {
    const touchDetector = TouchDetect.getInstance();
    touchDetector.subscribe('touchChanged', (e, isTouch) => {
        isTouchInterface = isTouch;
    });
}

/**
 * make foreignObject instance. using for hack with svg focusing.
 * @private
 */
function makeFocusableForeignObject(): ChildNode {
    const fragment = document.createElement('div');
    fragment.innerHTML =
        '<svg><foreignObject width="30" height="30">' +
        '<input type="text"/>' +
        '</foreignObject></svg>';

    return fragment.firstChild.firstChild;
}

/**
 * focusing of foreignObject. This hack will be use when it is need to focus svg element.
 */
function focusSvgForeignObjectHack(element: SVGElement): boolean {
    // Edge13, Edge14: foreignObject focus hack
    // https://jsbin.com/kunehinugi/edit?html,js,output
    // https://jsbin.com/fajagi/3/edit?html,js,output

    // inject and focus an <input> element into the SVG element to receive focus
    const foreignObject = makeFocusableForeignObject();
    element.appendChild(foreignObject);
    const input = (foreignObject as Element).querySelector('input');
    nativeFocus.call(input);

    // upon disabling the activeElement, IE and Edge
    // will not shift focus to <body> like all the other
    // browsers, but instead find the first focusable
    // ancestor and shift focus to that
    input.disabled = true;

    // clean up
    element.removeChild(foreignObject);
    return true;
}

/**
 * Trying all possible ways to focus element. Return true if successfully focused.
 * @param element
 * @param cfg
 */
function tryMoveFocus(element: HTMLElement | SVGAElement, cfg: IFocusConfig): void {
    const preventScroll = cfg.enableScrollToElement === false;
    if (isIEElement(element) && preventScroll) {
        // In IE, calling `focus` scrolls the focused element into view,
        // which is not the desired behavior. Built-in `setActive` method
        // makes the element active without scrolling to it
        try {
            // метод позовется только в ie, где он поддерживается
            element.setActive();
        } finally {
            // Обернули в try/catch, потому что вызов setActive у элемента с visibility:hidden в ie падает с ошибкой
        }
        return;
    }
    // Дадим шанс отработать нативному preventScroll, чтобы по возможности не вызывать лишние подскроллы туда-сюда.
    const nativeFocusOptions: FocusOptions = {
        preventScroll,
    };
    try {
        if (element.focus && element.focus !== replacedFocus) {
            // SVGElement.prototype.focus
            element.focus(nativeFocusOptions);
            return;
        }
        nativeFocus.call(element, nativeFocusOptions);
    } catch (e) {
        if (element instanceof SVGElement) {
            focusSvgForeignObjectHack(element);
            return;
        }
        // Если это не SVG - нам в другой catch, где логируется ошибка.
        throw e;
    }
}

/**
 * check if focus of element was successful.
 * @private
 */
function checkFocused(element: HTMLElement): boolean {
    // для последнего же проверим активный элемент.
    if (element === document.activeElement) {
        return true;
    }
    // если фокусируется скрытый элемент (или его предок скрыт), выводим ошибку, потому что он не сфокусируется
    let currentElement = element;
    while (currentElement) {
        let reason: string;
        const style = getComputedStyle(currentElement);
        if (style.display === 'none') {
            reason = 'display: none';
        }
        if (style.visibility === 'hidden') {
            reason = 'visibility: hidden';
        }
        if (reason) {
            const elementString = element.outerHTML.slice(0, element.outerHTML.indexOf('>') + 1);
            const currentElementString = currentElement.outerHTML.slice(
                0,
                currentElement.outerHTML.indexOf('>') + 1
            );
            const message =
                "[UICommon/_focus/Focus:checkFocused] - Can't focus element because of this element or it's parent " +
                `has ${reason} style! maybe you need use ws-hidden or ws-invisible classes for change element ` +
                'visibility (in old ws3 controls case). Please check why invisible element is focusing.' +
                `Focusing element is ${elementString}, invisible element is ${currentElementString}.`;
            Logger.warn(message, currentElement);

            break;
        }
        currentElement = currentElement.parentElement;
    }
    return false;
}

/**
 * Фокусировка нативно подскролливает страницу к сфокусированному объекту.
 * Если нужна фокусировка без подскролла - сохраним все значения скролла элемента и его родителей.
 * @param element Элемент, который планируем фокусировать
 * @param enableScrollToElement Подскроллить полностью, только вертикально, только горизонтально или не подскролливать совсем.
 * @returns Функция, возвращающая сохранённые значения скролла
 * @private
 */
function makeResetScrollFunction(
    element: HTMLElement,
    enableScrollToElement: TEnableScroll
): () => void {
    // Нужно будет вернуть вертикальные позиции, если нужен горизонтальный или полный подскролл.
    const resetVertical = enableScrollToElement === false || enableScrollToElement === 'horizontal';
    // Нужно будет вернуть горизонтальные позиции, если нужен вертикальный или полный подскролл.
    const resetHorizontal = enableScrollToElement === false || enableScrollToElement === 'vertical';
    return collectScrollPositions(element, {
        resetVertical,
        resetHorizontal,
    });
}

function matches(el: HTMLElement, selector: string): boolean {
    const crossPlatformElement = el as unknown as IMatchesElement;
    return (
        crossPlatformElement.matches ||
        crossPlatformElement.matchesSelector ||
        crossPlatformElement.msMatchesSelector ||
        crossPlatformElement.mozMatchesSelector ||
        crossPlatformElement.webkitMatchesSelector ||
        crossPlatformElement.oMatchesSelector
    ).call(el, selector);
}

function checkInput(el: HTMLElement): boolean {
    return matches(el, 'input[type="text"], textarea, *[contentEditable=true]');
}

function getNonInputFocusableContainer(element: HTMLElement): HTMLElement {
    let currentElement = element;
    while (currentElement) {
        // ищем ближайший элемент, который может быть сфокусирован и не является полем ввода
        if (ElementFinder.getElementProps(currentElement).tabStop && !checkInput(currentElement)) {
            break;
        }
        currentElement = currentElement.parentElement;
    }
    return currentElement;
}

function checkEnableScreenKeyboard(): boolean {
    return detection.isMobilePlatform || isTouchInterface;
}

function fixElementForMobileInputs(element: HTMLElement, cfg: IFocusConfig): HTMLElement {
    // на мобильных устройствах иногда не надо ставить фокус в поля ввода. потому что может показаться
    // экранная клавиатура. на ipad в случае асинхронной фокусировки вообще фокусировка откладывается
    // до следующего клика, и экранная клавиатура показывается не вовремя.

    // можно было бы вообще ничего не фокусировать, но есть кейс когда это нужно:
    // при открытии задачи поле исполнителя должно активироваться, чтобы показался саггест.
    // но фокус на поле ввода внутри не должен попасть, чтобы не повторилась ошибка на ipad.

    // поищем родительский элемент от найденного и сфокусируем его. так контрол, в котором лежит
    // поле ввода, будет сфокусирован, но фокус встанет не в поле ввода, а в его контейнер.

    // enableScreenKeyboard должен быть параметром метода activate, а не свойством контрола поля ввода,
    // потому что решается базовая проблема, и решаться она должна в общем случае (для любого
    // поля ввода), и не для любого вызова activate а только для тех вызовов, когда эта поведение
    // необходимо. Например, при открытии панели не надо фокусировать поля ввода
    // на мобильных устройствах.
    let result = element;
    if (!cfg.enableScreenKeyboard && checkEnableScreenKeyboard()) {
        // если попали на поле ввода, нужно взять его родительский элемент и фокусировать его
        if (checkInput(element)) {
            result = getNonInputFocusableContainer(element);
        }
    }
    return result;
}

const focusCalledElementsMap = new Map<HTMLElement, number>();
/**
 * Moves focus to a specific HTML or SVG element
 */
function focusInner(element: HTMLElement, cfg: IFocusConfig): boolean {
    focusCalledElementsMap.set(element, focusCalledElementsMap.size);
    // Заполняем cfg значениями по умолчанию, если другие не переданы
    const undoScrolling = makeResetScrollFunction(element, cfg.enableScrollToElement);
    try {
        tryMoveFocus(element, cfg);
    } catch (e) {
        const elementsStrArr = [];
        focusCalledElementsMap.forEach((_: number, focusCalledElement: HTMLElement) => {
            const outerHTML = focusCalledElement.outerHTML;
            elementsStrArr.push(outerHTML.slice(0, outerHTML.indexOf('>') + 1));
        });
        Logger.error(
            'Ошибка фокусировки. Элементы, для которых вызывался фокус:\n' +
                elementsStrArr.join('\n'),
            undefined,
            e
        );
    }

    const isLastFocused = focusCalledElementsMap.get(element) === focusCalledElementsMap.size - 1;
    const isFirstFocused = focusCalledElementsMap.get(element) === 0;
    if (isFirstFocused) {
        focusCalledElementsMap.clear();
    }

    // Раз мы вызвали фокус из стека другого вызова фокуса,
    // кто-то переводит фокус из обработчика onFocus/onBlur.
    // То есть прошлый перевод фокуса явно был успешный.
    const result = isLastFocused ? checkFocused(element) : true;

    if (result && isFirstFocused && isLastFocused) {
        // TODO попробовать придумать работу makeResetScrollFunction для каскадного перевода фокуса.
        // Сложности из-за поддержки 'horizontal' и 'vertical'.
        // Пока что вообще не будем вызывать undoScrolling в случае каскада, как это было и раньше.
        undoScrolling();
    }

    return result;
}

/**
 * Экспортируем нативный фокус, поскольку мы его переопределяем при инициализации.
 */
export let nativeFocus: Function;

/**
 * @public
 * @param {HTMLElement} [elementToFocus]
 * @param {IFocusConfig} [config]
 * @returns {boolean} сфокусировался ли элемент
 */
export function focus(
    element: HTMLElement,
    { enableScreenKeyboard = false, enableScrollToElement = false }: IFocusConfig = {}
): boolean {
    const cfg: IFocusConfig = { enableScrollToElement, enableScreenKeyboard };
    const elementFixed = fixElementForMobileInputs(element, cfg);
    return focusInner(elementFixed, cfg);
}

function replacedFocus({ preventScroll = false }: FocusOptions = {}): void {
    focus(this, {
        enableScreenKeyboard: true,
        enableScrollToElement: !preventScroll,
    });
}

// Заменяем нативный фокус на функцию из библиотеки фокусов.
// В ней исправлены многие ошибки кроссбраузерной и кроссплатформенной совместимости.
// Кроме того это упрощает отладку, т.к. способ программно сфокусировать элемент будет только один.
export function _initFocus(): void {
    if (nativeFocus) {
        return;
    }
    if (typeof HTMLElement !== 'undefined') {
        nativeFocus = HTMLElement.prototype.focus;
        HTMLElement.prototype.focus = replacedFocus;
    }
}
_initFocus();
