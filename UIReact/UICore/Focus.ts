interface IFocusElementProps {
   enabled: boolean;
   tabStop: boolean;
   createsContext: boolean;
   tabIndex: number;
   delegateFocusToChildren: boolean;
   tabCycling: boolean;
}

import { logger } from 'Application/Env';
import { Control } from 'UICore/Base';
import { Logger } from 'UICommon/Utils';

// TODO: заменить экспорт во время реализации системы фокусов для Реакта.
export const ElementFinder = {
   getElementProps(
      element: HTMLElement
   ): IFocusElementProps {
      Logger.warn('Метод ElementFinder.getElementProps ещё не реализован в системе фокусов для Реакта');
   },
   findFirstInContext(
      contextElement: HTMLElement,
      reverse?: boolean,
      propsGetter?: (element: HTMLElement, tabbable: boolean) => IFocusElementProps,
      tabbable?: boolean
   ): HTMLElement {
      Logger.warn('Метод ElementFinder.findFirstInContext ещё не реализован в системе фокусов для Реакта');
   },
   findWithContexts(
      rootElement: HTMLElement,
      fromElement: Element,
      reverse: boolean,
      propsGetter?: (element: HTMLElement, tabbable: boolean) => IFocusElementProps,
      tabbable?: boolean
   ): HTMLElement {
      Logger.warn('Метод ElementFinder.findWithContexts ещё не реализован в системе фокусов для Реакта');
   }
};

// TODO: заменить экспорт во время реализации системы фокусов для Реакта.
export function focus(
   element: HTMLElement,
   cfg?: {
      enableScreenKeyboard?: boolean,
      enableScrollToElement?: boolean
   }
): boolean | void {
   logger.error('Метод focus ещё не реализован в системе фокусов для Реакта');
}

// TODO: заменить экспорт во время реализации системы фокусов для Реакта.
export const _FocusAttrs = {
   prepareAttrsForFocus(attributes: Record<string, string>): void {
      logger.error('Метод _FocusAttrs.prepareAttrsForFocus ещё не реализован в системе фокусов для Реакта');
   },
   prepareTabindex(attrs: Record<string, string>): void {
      Logger.warn('Метод _FocusAttrs.prepareTabindex ещё не реализован в системе фокусов для Реакта');
   },
   patchDom(dom: HTMLElement): void {
      Logger.warn('Метод _FocusAttrs.patchDom ещё не реализован в системе фокусов для Реакта');
   }
};

// TODO: заменить экспорт во время реализации системы фокусов для Реакта.
export function nativeFocus(
   options?: {
      preventScroll?: boolean
   }
): void {
   Logger.warn('Метод nativeFocus ещё не реализован в системе фокусов для Реакта');
}

// TODO: заменить экспорт во время реализации системы фокусов для Реакта.
export function activate(
   element: HTMLElement,
   cfg?: {
      enableScreenKeyboard?: boolean,
      enableScrollToElement?: boolean
   }
): boolean {
   Logger.warn('Метод activate ещё не реализован в системе фокусов для Реакта');
}

export { goUpByControlTree } from 'UICore/NodeCollector';

// TODO: заменить экспорт во время реализации системы фокусов для Реакта.
export const DefaultOpenerFinder = {
   find(control: Control | HTMLElement | HTMLElement[]): Control {
      Logger.warn('Метод DefaultOpenerFinder.find ещё не реализован в системе фокусов для Реакта');
   }
};

// TODO: удалить после решения https://online.sbis.ru/opendoc.html?guid=be6d844a-6fdb-4de3-8cb9-8df24c0dfb59
export function restoreScrollPositionAfterFocus(): void {
   Logger.warn('Метод restoreScrollPositionAfterFocus ещё не реализован в системе фокусов для Реакта');
}
