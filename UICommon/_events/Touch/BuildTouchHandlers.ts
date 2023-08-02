import { FastTouchEndController } from './FastTouchEndController';
import { SwipeController } from './SwipeController';
import { LongTapController } from './LongTapController';
import { TouchHandlers } from './TouchHandlers';

import { ITouchEvent } from './TouchEvents';

export interface ITouchHandlers {
    handlerClick: (event: MouseEvent) => void;
    handlerTouchstart: (event: ITouchEvent) => void;
    handlerTouchmove: (event: ITouchEvent) => void;
    handlerTouchend: (event: ITouchEvent) => void;
    getTouchendTarget: () => Element;
    setTouchendTarget: (element: Element) => void;
}

export class BuildTouchHandlers implements ITouchHandlers {
    private touchendTarget: Element;

    constructor() {
        // надо передать правильный контекст в TouchHandlers,
        // т.к. в shouldUseClickByTapOnTouchend в контексте ожидается система событий
        TouchHandlers.bind(this);
    }

    handlerTouchstart(event: ITouchEvent): void {
        TouchHandlers.setPreventShouldUseClickByTap(false);

        TouchHandlers.shouldUseClickByTapOnTouchstart(event);
        // Compatibility. Touch events handling in Control.compatible looks for
        // the `addedToClickState` flag to see if the event has already been
        // processed. Since vdom has already handled this event, set this
        // flag to true to avoid event triggering twice.
        event.addedToClickState = true;

        FastTouchEndController.setClickEmulateState(true);
        SwipeController.initState(event);
        const longTapCallback = () => {
            // т.к. callbackFn вызывается асинхронно, надо передавать с правильным контекстом
            FastTouchEndController.setClickEmulateState.call(
                FastTouchEndController,
                false
            );
            TouchHandlers.setPreventShouldUseClickByTap(true);
        };
        LongTapController.initState(event, longTapCallback.bind(this));
    }

    handlerTouchmove(event: ITouchEvent): void {
        TouchHandlers.shouldUseClickByTapOnTouchmove(event);
        FastTouchEndController.setClickEmulateState(false);
        SwipeController.detectState(event);
        LongTapController.resetState();
    }

    handlerTouchend(event: ITouchEvent): void {
        TouchHandlers.shouldUseClickByTapOnTouchend.call(this, event);

        // Compatibility. Touch events handling in Control.compatible looks for
        // the `addedToClickState` flag to see if the event has already been
        // processed. Since vdom has already handled this event, set this
        // flag to true to avoid event triggering twice.
        event.addedToClickState = true;

        // есть ситуации когда в обработчик клика летит неправильный таргет в мобильном сафари
        // причину выяснить не удалось так что буду брать таргет из touchend
        // https://online.sbis.ru/opendoc.html?guid=a6669e05-8810-479f-8860-bc0d4f5c220e
        // https://online.sbis.ru/opendoc.html?guid=b0f15e03-3672-4be6-8a49-2758bb4c34d7
        // https://online.sbis.ru/opendoc.html?guid=f7e7811b-f093-4964-9838-0f735c97670e
        // https://online.sbis.ru/opendoc.html?guid=076215f4-2cff-4242-a3ff-70f090bfacdd
        // https://online.sbis.ru/opendoc.html?guid=79fc9323-05de-421e-b4ac-bc79ad6c775d
        // https://online.sbis.ru/opendoc.html?guid=911984fb-1757-4f62-999f-600bec2305c0
        // https://online.sbis.ru/opendoc.html?guid=f0695304-83e2-4cc5-b0b3-a63580214bf2
        // https://online.sbis.ru/opendoc.html?guid=99861178-2bd8-40dc-8307-bda1080a91f5
        this.touchendTarget = event.target as Element;
        setTimeout(() => {
            this.touchendTarget = null;
        }, 300);
        FastTouchEndController.clickEmulate(
            event.target as Element,
            event,
            this
        );
        SwipeController.resetState();
        LongTapController.resetState();
    }

    handlerClick(event: MouseEvent): void {
        TouchHandlers.shouldUseClickByTapOnClick(event);

        /**
         * Firefox right click bug
         * https://bugzilla.mozilla.org/show_bug.cgi?id=184051
         */
        if (event.button === 2) {
            event.stopPropagation();
            return;
        }

        /**
         * Break click by select.
         */
        const selection =
            window && window.getSelection ? window.getSelection() : null;

        // Break click on non-empty selection with type "Range".
        // Have to trim because of fake '\n' selection in some cases.
        const hasSelection =
            selection &&
            selection.type === 'Range' &&
            (event.target as HTMLElement).contains(selection.focusNode);
        // getComputedStyle не может правильно отбработать в ie если event.target === document
        const getElement = (target: EventTarget): HTMLElement => {
            if (target === document) {
                return document.body;
            }
            if (target === window) {
                return window.document.body;
            }
            return target as HTMLElement;
        };
        const resolvedElement = getElement(event.target);
        let userSelectIsNone;
        // в редких специфичных сценариях (windows 8.1 + touch + ie11)
        // window.getComputedStyle падает с ошибкой "Интерфейс не поддерживается"
        try {
            userSelectIsNone =
                window && window.getComputedStyle
                    ? window.getComputedStyle(resolvedElement as HTMLElement)[
                          'user-select'
                      ] === 'none'
                    : true;
        } catch (e) {
            userSelectIsNone = true;
        }
        const isTargetNotEmpty =
            window &&
            (event.target as HTMLElement)?.textContent.trim().length > 0;
        if (hasSelection && !userSelectIsNone && isTargetNotEmpty) {
            event.stopImmediatePropagation();
            return;
        }
    }

    getTouchendTarget(): Element {
        return this.touchendTarget;
    }

    setTouchendTarget(element: Element): void {
        this.touchendTarget = element;
    }
}
