import { Control } from 'UICore/Base';
import { IOptions } from 'UICommon/Vdom';
import { IRootAttrs } from 'UICommon/interfaces';
import { Logger } from 'UICommon/Utils';

// TODO: удалить экспорт после замены всех использований.
export const Synchronizer = {
    mountControlToDOM(
        control: Control,
        options: IOptions,
        mountPoint: HTMLElement,
        attributes: IRootAttrs
    ): void {
        Logger.warn(
            'В сборке на Реакте нет метода mountControlToDOM, нужно использовать createControl'
        );
    },
    unMountControlFromDOM(
        control: Control,
        element: HTMLElement | HTMLElement[]
    ): void {
        // Исторически сложилось, что создание и разрушение корневого контрола лежит в разных библиотеках.
        // В документации советуется создавать через Control.createControl, а удалять через unMountControlFromDOM.
        // Пусть пока что этот метод проксирует тот, что лежит рядом с создающим.
        Control.destroyControl(control, element);
    },
    cleanControlDomLink(node: HTMLElement, control?: Control): void {
        // Logger.warn('В сборке на Реакте нет метода cleanControlDomLink, нужно реализовать или удалить везде');
        // этот метод не нужен в реакте, там на анмаунт зовется своя очистка _$controls и controlNodes
    },
};

// TODO: удалить экспорт после замены всех использований.
export const Debug = {
    vdomToHTML(vdom: unknown, context: unknown): Promise<unknown> {
        Logger.warn(
            'В сборке на Реакте нет метода vdomToHTML, нужно реализовать или удалить везде'
        );
    },
};
