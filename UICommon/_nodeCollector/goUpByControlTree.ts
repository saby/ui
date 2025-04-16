import { IControl } from 'UICommon/interfaces';
import {
    TControl,
    IWrapHTMLElement,
    TControlOrCompat,
    focusCallbacksObjectsSetName,
    focusParentRefName,
} from './INodeCollector';
import { logger } from 'Application/Env';
import { getClosestControlInner } from './getClosestControl';
import { IControlOptions } from 'UICommon/Base';

const currentGoUpSet = new Set();

// TODO перевести всех пользователей на TControl, заменить goUpByControlTreeInner на goUpByControlTree.
export function goUpByControlTree(
    target: IWrapHTMLElement,
    array?: IControl[],
    withFocusCallbacksObjects: boolean = false
): IControl[] {
    return goUpByControlTreeInner(
        target,
        array as unknown as TControl[],
        withFocusCallbacksObjects
    ) as unknown as IControl[];
}

export function goUpByControlTreeInner(
    target: IWrapHTMLElement,
    array?: TControl[],
    withFocusCallbacksObjects: boolean = false
): TControl[] {
    const controlTree = array || [];
    const closestControl = getClosestControlInner(target) as TControlOrCompat;
    if (!withFocusCallbacksObjects) {
        if (!closestControl) {
            return controlTree;
        }
        addControlsToFlatArray(closestControl, controlTree, true);
        currentGoUpSet.clear();
        return controlTree;
    }

    if (!closestControl) {
        addFocusCallbacksObjectsToControlTree(target, document.body, controlTree);
        currentGoUpSet.clear();
        return controlTree;
    }
    if (
        addFocusCallbacksObjectsToControlTree(target, getFixedContaier(closestControl), controlTree)
    ) {
        currentGoUpSet.clear();
        return controlTree;
    }

    const initialFlatArray: TControlOrCompat[] = [];
    addControlsToFlatArray(closestControl, initialFlatArray, false);

    // А в этой точке нам уже нужно отфильтровать контролы без контейнера.
    const flatArray = initialFlatArray.filter((control) => !!control._container);

    for (let i = 0; i < flatArray.length; i++) {
        const control = flatArray[i];
        if (!control.isFocusActivator) {
            controlTree.push(control);
        }

        if (
            addFocusCallbacksObjectsToControlTree(
                getFixedContaier(control),
                flatArray[i + 1] ? getFixedContaier(flatArray[i + 1]) : document.body,
                controlTree
            )
        ) {
            currentGoUpSet.clear();
            return controlTree;
        }
    }
    currentGoUpSet.clear();
    return controlTree;
}

function addControlsToFlatArray(
    control: TControlOrCompat,
    array: TControl[],
    skipActivator: boolean
): void {
    if (currentGoUpSet.has(control)) {
        const index = array.indexOf(control);
        const namesArr = [];
        for (let i = index; i < array.length; i++) {
            namesArr.push(array[i]._moduleName);
        }
        namesArr.push(control._moduleName);
        const errorMessage =
            'Подъём по дереву контролов зациклился. Возможные причины:\n' +
            '1. Внутри цикла есть чистый реакт в корне васаби, который не прокинул ref.\n' +
            '2. Оперером указан контрол, находящийся в поддереве того, для кого он опенер.\n' +
            namesArr.join(' -> ');

        // явно тащить нельзя, цикл - UICommon/NodeCollector -> UICommon/Utils -> UICommon/NodeCollector
        const Utils = requirejs.defined('UICommon/Utils') && requirejs('UICommon/Utils');
        Utils?.Logger.error(errorMessage);
        return;
    }
    currentGoUpSet.add(control);
    array.push(control);

    let parent: TControlOrCompat | null = getFocusParent(control);
    if (skipActivator) {
        while (parent?.isFocusActivator) {
            parent = getFocusParent(parent);
        }
    }

    checkOpener(parent);

    if (parent) {
        addControlsToFlatArray(parent, array, skipActivator);
    }
}

function getFocusParent(control: TControlOrCompat): TControlOrCompat | null {
    // ищем предка текущего контрола, сначала смотрим есть ли opener, если нет - берем parent
    const options: IControlOptions & { opener?: IControl } = control?._options;
    let result =
        options?.opener ||
        options?._physicParent ||
        control?.getOpener?.() ||
        options?.parent ||
        control?.getParent?.();
    // Поддержим дальшейший подъём по дереву через чистый реакт компонент, если у него есть DOM элемент в поле _container.
    if (!result && isAlive(control)) {
        const container = getFixedContaier(control);
        result = container?.parentNode;
    }
    if (result instanceof HTMLElement) {
        result = getClosestControlInner(result);
    }
    if (isAlive(result)) {
        return result;
    }
    return null;
}

function checkOpener(opener: TControlOrCompat | null): void {
    let error;

    if (opener) {
        // Component instance must have _options or props
        if (opener && !(opener._options || opener.props || opener.isFocusActivator)) {
            const name = opener.getName ? opener.getName() : '[not detected]';
            error = `Control ${opener._moduleName} with name ${name} must have _options`;
        }
    }

    if (error) {
        const message = `[UICore/_nodeCollector/goUpByControlTree:checkOpener] DOMEnvironment - Incorrect opener or parent is found! It seems that anybody set wrong opener option! ${error}`;
        const Utils = requirejs.defined('UICommon/Utils') && requirejs('UICommon/Utils');
        Utils?.Logger.error(message, opener);
    }
}

function isAlive(control: TControlOrCompat): boolean {
    if (!control) {
        return false;
    }
    // Вернём isAlive true, если у контрола _container null. Выглядит немного костыльно, но идей лучше нет.
    // Логика в том, что фокусировку можно позвать из componentDidMount дочернего реакт компонента.
    // В этой точке родительский васаби контрол уже отрендерился, но не отстрелил рефом. Контейнера ещё нет.
    return (
        !(control._destroyed || control._isDestroyed) &&
        (!!control._container || control._container === null)
    );
}

/**
 * Очень сырой механизм, но как быстрое решение наверное сойдёт.
 * Не для наружного использования, так что при необходимости легко будет модифицировать.
 * @param fromContainer - начало подъёма, включительно
 * @param toContainer - конец подъёма, не включительно
 * @param array - массив для пуша результата.
 * @returns 1, если алгоритм перенаправлен, и обход следует остановить.
 * @private
 */
function addFocusCallbacksObjectsToControlTree(
    fixedFromContainer: IWrapHTMLElement | undefined,
    fixedToContainer: IWrapHTMLElement | undefined,
    array: TControl[]
): void | 1 {
    if (
        !fixedFromContainer ||
        !fixedToContainer ||
        fixedFromContainer === fixedToContainer ||
        !fixedToContainer.contains(fixedFromContainer)
    ) {
        return;
    }
    for (
        let currentContainer = fixedFromContainer;
        currentContainer !== fixedToContainer;
        currentContainer = currentContainer.parentNode as IWrapHTMLElement
    ) {
        const focusCallbacksObjectsSet: Set<TControl> | undefined =
            currentContainer[focusCallbacksObjectsSetName];
        if (focusCallbacksObjectsSet) {
            focusCallbacksObjectsSet.forEach((focusCallbacksObject) => {
                if (currentGoUpSet.has(focusCallbacksObject)) {
                    // Не могу писать ошибку, пока в контролах ошибаются в рефах. А в варнингах нет смысла.
                    return;
                }
                currentGoUpSet.add(focusCallbacksObject);
                array.push(focusCallbacksObject);
            });
        }
        const focusParentElement = currentContainer[focusParentRefName]?.current;
        if (focusParentElement) {
            // Подъём перенаправлен. Например, для прохода сквозь портал.
            currentGoUpSet.clear();
            goUpByControlTreeInner(focusParentElement, array, true);
            return 1;
        }
    }
}

function getFixedContaier(control: TControlOrCompat): HTMLElement | undefined {
    const container = control._container;
    if (!container) {
        return;
    }
    if (container.jquery) {
        return container[0] as HTMLElement;
    }
    if (typeof container.contains !== 'function') {
        const errorMessage =
            'В поле _container контрола лежит не HTMLElement. ' +
            'Скорее всего, в корне контрола лежит React.forwardRef, который передал ref из второго аргумента на классовый компонент. ' +
            'Этот ref должен ссылаться на корневой HTMLElement. Подробнее в главе "Просброс ref" статьи https://online.sbis.ru/page/knowledge-bases/wasaby?article=ae49631c-1a0e-4908-90a2-cea13b7a78e1';
        logger.error(
            errorMessage,
            'Контрол с ошибочным контейнером:',
            control,
            'Вместо HTMLElement в контейнере находится:',
            container
        );
        return;
    }
    return container;
}
