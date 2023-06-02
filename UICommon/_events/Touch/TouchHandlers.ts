import { constants } from 'Env/Env';
import type { ITouchEvent } from './TouchEvents';
import type { IMouseEventInitExtend } from '../IEvents';
import type { ITouchHandlers } from './BuildTouchHandlers';

import { createFakeEvent } from './FakeEvent';

let touchId: number = 0;

export class TouchHandlers {
    private static clickStateTarget: {
        target: HTMLElement;
        touchId: number;
    }[] = [];
    private static preventShouldUseClickByTap: boolean = false;
    private static clickState = {
        detected: false,
        stage: '',
        timer: undefined,
        timeout: 500,
        target: null,
        touchCount: 0,
        timeStart: undefined,
    };

    private static _touchHandlers: ITouchHandlers;
    private static captureEventHandler: (MouseEvent) => void;

    //# region обработка тача на специфичных устройствах

    static shouldUseClickByTapOnClick(event: MouseEvent): void {
        if (TouchHandlers.shouldUseClickByTap(event.target as Element)) {
            const idx = TouchHandlers.getClickStateIndexForTarget(
                TouchHandlers.fixSvgElement(event.target)
            );
            // if click event occurred, we can remove monitored target
            if (idx > -1) {
                TouchHandlers.clickStateTarget.splice(idx, 1);
            }
        }
    }

    static shouldUseClickByTapOnTouchstart(event: ITouchEvent): void {
        if (TouchHandlers.shouldUseClickByTap(event.target as Element)) {
            // Для svg запоминаем ownerSVGElement, т.к. иногда в touchstart таргет - это тег svg,
            // при этом у события click, таргетом будет внутренний элемент
            const target = TouchHandlers.fixSvgElement(event.target);
            TouchHandlers.clickStateTarget.push({
                target,
                touchId: touchId++, // записываем номер текущего касания
            });
        }
    }

    static shouldUseClickByTapOnTouchmove(event: ITouchEvent): void {
        if (TouchHandlers.shouldUseClickByTap(event.target as Element)) {
            TouchHandlers.clickState.touchCount++;
            // Only one touchmove event is allowed between touchstart and touchend events on Ipad.
            // If more than one touchmove did occurred, we don't emulate click event.
            // But on windows installed devices touchmove event can occur some times,
            // therefore we must check if touchmove count more than 1.
            if (TouchHandlers.clickState.touchCount > 3) {
                const idx = TouchHandlers.getClickStateIndexForTarget(
                    TouchHandlers.fixSvgElement(event.target)
                );
                if (idx > -1) {
                    TouchHandlers.clickStateTarget.splice(idx, 1);
                }
            }
        }
    }

    static shouldUseClickByTapOnTouchend(event: ITouchEvent): void {
        if (
            TouchHandlers.shouldUseClickByTap(event.target as Element) &&
            !TouchHandlers.preventShouldUseClickByTap
        ) {
            const lastTouchId = touchId;
            TouchHandlers.clickState.touchCount = 0;
            // click occurrence checking
            setTimeout(() => {
                // Вызываем клик, если клик был не вызван автоматически после touchEnd. Такое иногда
                // происходит на тач-телевизорах и планшетах на Windows, и в ограниченной версии
                // вебкита, используемой например в Presto Offline.
                // Для того чтобы понять, нужно ли нам эмулировать клик, проверяем два условия:
                // 1. Элемент, на котором сработал touchEnd, есть в массиве clickStateTarget
                //    (туда они добавляются при touchStart, и удаляются, если на этом элементе
                //    срабатывает touchMove или click)
                // 2. Если этот элемент там есть, проверяем что он соответствует именно тому touchStart,
                //    который является парным для этого touchEnd. Это можно определить по номеру касания
                //    touchId. Это предотвращает ситуации, когда мы быстро нажимаем на элемент много
                //    раз, и этот setTimeout, добавленный на первое касание, находит в массиве clickStateTarget
                //    тот же элемент, но добавленный на сотое касание.
                const idx = TouchHandlers.getClickStateIndexForTarget(
                    TouchHandlers.fixSvgElement(event.target)
                );
                if (
                    idx > -1 &&
                    TouchHandlers.clickStateTarget[idx].touchId < lastTouchId
                ) {
                    // If the click did not occur, we emulate the click through the
                    // vdom environment only (so that the old WS3 environment ignores it).
                    // To do so, we generate the fake click event object based on the data
                    // from the touchend event and propagate it using the vdom bubbling.
                    const clickEventObject =
                        TouchHandlers.generateClickEventFromTouchend.call(
                            this,
                            event
                        ) as MouseEvent;
                    this._touchHandlers.handlerClick(clickEventObject);
                }
            }, TouchHandlers.clickState.timeout);
        }
    }

    static setPreventShouldUseClickByTap(value: boolean): void {
        TouchHandlers.preventShouldUseClickByTap = value;
    }
    /*
     * Обеспечивает правильную работу тач событий на телевизорах с тачем и windows планшетах
     */
    private static shouldUseClickByTap(target: Element): boolean {
        // In chrome wrong target comes in event handlers of the click events on touch devices.
        // It occurs on the TV and the Windows tablet. Presto Offline uses limited version of WebKit
        // therefore the browser does not always generate clicks on the tap event.
        return (
            // в оффлайн-киоске на должен стрелять клик по тачу
            // проблема кроется в аппаратной составляющей киоска, при скроле процессор забивается на 100%
            // это приводит к ложному вызову клика на touchend, т.к. устройство физически не успевает все обработать
            // поэтому будем определять необходимость генерации клика по наличию классу wnc-sabyget-composite__shop
            (constants.browser.isDesktop &&
                !target.closest('.wnc-sabyget-composite__shop')) ||
            (constants.compatibility.touch &&
                constants.browser.chrome &&
                navigator &&
                navigator.userAgent.indexOf('Windows') > -1)
        );
    }

    private static generateClickEventFromTouchend(
        event: TouchEvent
    ): IMouseEventInitExtend {
        let touch: any = event.changedTouches && event.changedTouches[0];
        if (!touch) {
            touch = {
                clientX: 0,
                clientY: 0,
                screenX: 0,
                screenY: 0,
            };
        }

        // We do not use document.createEvent or new MouseEvent to make an
        // actual event object, because in that case we can not change
        // the target - target property is non-configurable in some
        // browsers.
        // We create a simple object instead and fill in the fields we might
        // need.
        return createFakeEvent('click', event, touch);
    }

    //# endregion

    // Возвращает самое старое (т. к. они расположены по порядку) касание, для которого
    // сработал touchStart, но для которого не было touchMove или click
    private static getClickStateIndexForTarget(target: HTMLElement): number {
        return TouchHandlers.clickStateTarget.findIndex((el: any): boolean => {
            return el.target === target;
        });
    }

    private static fixSvgElement(element: EventTarget): HTMLElement {
        return (element as SVGElement).ownerSVGElement
            ? ((element as SVGElement)
                  .ownerSVGElement as unknown as HTMLElement)
            : (element as HTMLElement);
    }
}
