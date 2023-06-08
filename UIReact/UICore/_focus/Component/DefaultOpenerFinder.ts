/* eslint-disable */

/**
 * В этом модуле содержится логика по нахождению opener'а, если opener нигде не задан
 */

/*Проблема:
При открытии диалога мы задаем опцию opener, чтобы связать открываемый диалог с инициирующим открытие компонентом, чтобы
работала система фокусов. Иногда так случается, что из места, где зовется открытие диалога, недоступен компонент,
который нужно установить как opener.

Например, открываем реестр задач, из него открываем задачу, в задаче открываем миникарточку сотрудника, в миникарточке
сотрудника открываем дополнительные команды, а там выбираем перейти в подробную карточку. При этом после открытия подробной
карточки миникарточка и дополнительные команды должны закрыться, а реестр задач и диалог задачи должны остаться открытыми.
Более того, если мы закроем диалог задачи, подробная карточка сотрудника должна быть закрыта.
Для достижения такого функционала подробной карточке в качестве опенера необходимо задать диалог задачи. Но в диалоге
дополнительных команд у нас нет доступа к диалогу задачи, который мы хотели бы указать в качестве опенера.

Для решения проблемы предлагается типизировать диалоги опцией isDefaultOpener. Опция равная true означает, что диалог
является опенером по умолчанию для всех диалогов, которые открываются изнутри этого диалога или дочерних диалогов любого
уровня вложенности, которые сами не являются опенерами по умолчанию.
Открываемый диалог, которому не задана опция opener, получит в качестве опенера диалог по умолчанию.

Опция isDefaultOpener по умолчанию будет задан true для классов диалога, которые не должны закрываться при переводе фокуса
в дочерние диалоги. Таким классами будут:
Controls/Popup/Opener/Dialog
Controls/Popup/Opener/Stack
Controls/Popup/Opener/Sticky

Таким образом для решения проблемы достаточно будет просто не задавать opener для подробной карточки сотрудника.
*/

import { goUpByControlTree } from 'UICore/NodeCollector';
import { Control } from 'UICore/Base';

class DefaultOpenerFinder {
    find(element: Control | Element | [Element]): Control {
        const container = this.getContainer(element);

        if (!container) {
            return;
        }

        const controlTree = goUpByControlTree(container);
        for (const control of controlTree) {
            if (control._options?.isDefaultOpener) {
                return control;
            }
        }
    }

    private getContainer(element: Control | Element | [Element]): Element {
        if (!element) {
            return;
        }
        if ('_container' in element) {
            // @ts-ignore _container is protected
            return element._container;
        }
        if ('length' in element) {
            return element[0];
        }
        return element;
    }
}

const defaultOpenerFinder = new DefaultOpenerFinder();

export default defaultOpenerFinder;
