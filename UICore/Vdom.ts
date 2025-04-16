/**
 * @kaizen_zone f5c191c1-0491-4135-91e2-59f329a1faa1
 */
import type { IOptions } from 'UICommon/Vdom';

import { Control } from 'UICore/Base';
import { IRootAttrs } from 'UICommon/interfaces';
import { Logger } from 'UICommon/Utils';

// TODO: удалить экспорт после замены всех использований.
export const Synchronizer = {
    mountControlToDOM(
        _control: Control,
        _options: IOptions,
        _mountPoint: HTMLElement,
        _attributes: IRootAttrs
    ): void {
        Logger.warn(
            'В сборке на Реакте нет метода mountControlToDOM, нужно использовать createControl'
        );
    },
    unMountControlFromDOM(control: Control, element: HTMLElement | HTMLElement[]): void {
        // Исторически сложилось, что создание и разрушение корневого контрола лежит в разных библиотеках.
        // В документации советуется создавать через Control.createControl, а удалять через unMountControlFromDOM.
        // Пусть пока что этот метод проксирует тот, что лежит рядом с создающим.
        Control.destroyControl(control, element as HTMLElement | [HTMLElement]);
    },
    cleanControlDomLink(_node: HTMLElement, _control?: Control): void {
        // Logger.warn('В сборке на Реакте нет метода cleanControlDomLink, нужно реализовать или удалить везде');
        // этот метод не нужен в реакте, там на анмаунт зовется своя очистка _$controls и controlNodes
    },
};

// TODO: удалить экспорт после замены всех использований.
export const Debug = {
    vdomToHTML(_vdom: unknown, _context: unknown): void {
        Logger.warn(
            'В сборке на Реакте нет метода vdomToHTML, нужно реализовать или удалить везде'
        );
    },
};
