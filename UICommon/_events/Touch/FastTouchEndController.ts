/**
 */
import type { IMouseEventInitExtend, IWasabyEventSystem } from '../IEvents';

import { detection } from 'Env/Env';
import { hasNoFocus } from 'UICommon/Focus';
import { createFakeEvent } from './FakeEvent';

const fastEventList = [
    'touchend',
    'mouseover',
    'mousedown',
    'mouseup',
    'click',
];
const focusEvents = ['focus'];
const useNativeEventList = ['input', 'textarea', 'a'];
let wasEmulated = false;

export class FastTouchEndController {
    private static needClickEmulate: boolean = true;

    static setClickEmulateState(state: boolean): void {
        this.needClickEmulate = state;
    }

    static clickEmulate(
        targetElement: Element,
        nativeEvent: TouchEvent,
        eventInstance: IWasabyEventSystem
    ): void {
        // в мобильном сафари фаст тач реализован на уровне webKit подробнее https://webkit.org/blog/5610/more-responsive-tapping-on-ios/
        // TODO: по проекту адаптива надо изучить нужен ли будет модуль в будущем
        if (detection.isMobileIOS && detection.safari) {
            return;
        }
        if (this.wasEventEmulated()) {
            wasEmulated = false;
            return;
        }
        if (this.useNativeTouchEnd(targetElement, nativeEvent)) {
            return;
        }
        const nativeEventTarget = nativeEvent.target as HTMLElement;
        const lastActiveElement = document.activeElement;
        nativeEvent.preventDefault();
        const touch = nativeEvent.changedTouches[0];
        let clickEvent;
        for (let i = 0; i < fastEventList.length; i++) {
            // надо создавать новое событие мыши, а не отдавать объект в систему событий, т.к.
            // в некоторых случаях события всплывают не правильно (например аккордеон)
            clickEvent = new MouseEvent(
                fastEventList[i],
                this.createMouseEvent(fastEventList[i], nativeEvent, touch)
            );
            clickEvent.eventInstance = eventInstance;
            targetElement.dispatchEvent(clickEvent);
        }

        // Если нет ws-no-focus и если не перевели фокус в одном из событий мыши.
        if (
            !hasNoFocus(nativeEventTarget) &&
            document.activeElement === lastActiveElement
        ) {
            nativeEventTarget.focus();
            let focusEvent;
            for (let i = 0; i < focusEvents.length; i++) {
                focusEvent = new FocusEvent(
                    focusEvents[i],
                    this.createMouseEvent(focusEvents[i], nativeEvent, touch)
                );
                focusEvent.eventInstance = eventInstance;
                targetElement.dispatchEvent(focusEvent);
            }
        }
        wasEmulated = true;
    }

    static isFastEventFired(eventName: string): boolean {
        return fastEventList.indexOf(eventName) > -1;
    }

    static wasEventEmulated(): boolean {
        return wasEmulated;
    }

    static restoreEventEmulated(): void {
        wasEmulated = false;
    }

    private static useNativeTouchEnd(
        targetElement: Element,
        nativeEvent: TouchEvent
    ): boolean {
        if (!nativeEvent) {
            return true;
        }
        if (!nativeEvent.preventDefault) {
            return true;
        }
        if (!this.needClickEmulate) {
            return true;
        }
        if (this.isNativeList(targetElement)) {
            return true;
        }
        // БТР - это div c contentEditable, поэтому выделяя его или элементы внутри него мы не должны
        // менять поведение тача (напримре выделение текста по двойному тапу);
        // в новом БТР на react внутри div contenteditable находятся вложенные элементы
        // надо проверить что по клику на эелмент мы не кликнули в div contenteditable
        if (this.findContantEditable(targetElement)) {
            return true;
        }
        // ссылки работают по аналогии с БТР на ipad в safari
        if (
            detection.isMobileIOS &&
            detection.safari &&
            this.findHref(targetElement)
        ) {
            return true;
        }
        // надо учитывать, что поведение при клике в элемент который должен работать с нативным touchend
        // и клике вне него (когда он в фокусе) должны работать нативно (например фокус в input и открыть popup)
        if (
            this.isNativeList(document.activeElement) ||
            this.isContentEditable(document.activeElement)
        ) {
            return true;
        }
        // вызываем нативный тач если есть специальный класса
        if (targetElement.classList.contains('ws-disableFastTouch')) {
            return true;
        }
        // вызываем нативный тач если событие создано вручную
        if (!nativeEvent.isTrusted) {
            return true;
        }
        return false;
    }

    private static isNativeList(element: Element): boolean {
        return useNativeEventList.indexOf(element.tagName.toLowerCase()) > -1;
    }

    private static findContantEditable(element: Element): boolean {
        if (this.isContentEditable(element)) {
            return true;
        }
        if (element.parentElement) {
            return this.findContantEditable(element.parentElement);
        }
        return false;
    }
    private static findHref(element: Element): boolean {
        return !!element.closest('[href]');
    }

    private static isContentEditable(element: Element): boolean {
        return (
            element.hasAttribute('contentEditable') ||
            (element.parentElement &&
                element.parentElement.hasAttribute('contentEditable'))
        );
    }

    private static isHref(element: Element): boolean {
        return (
            element.hasAttribute('href') ||
            (element.parentElement &&
                element.parentElement.hasAttribute('href'))
        );
    }

    private static createMouseEvent(
        eventName: string,
        event: TouchEvent,
        touch: Touch
    ): IMouseEventInitExtend {
        return createFakeEvent(eventName, event, touch);
    }
}
