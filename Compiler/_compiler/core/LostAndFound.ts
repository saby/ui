/**
 * @author Krylov M.A.
 *
 * Здесь повторяю ошибку, в ходе которой в старой кодогенерации терялись атрибуты.
 * Сначала выводим предупреждение, а в следующую веху поведение приводим к нормальному.
 */

import {
    Ast,
    BaseWasabyElement,
    BindNode,
    Flags,
    AttributeNode,
    OptionNode,
    ValueNode
} from './Ast';

export interface ILostAttribute {
    key: number;
    name: string;
    node: Ast;
    owner: Record<string, Ast>;
    property: string;
}

const SPECIAL_ATTRIBUTES_COLLECTION = [
    'ws-delegates-tabfocus',
    'ws-creates-context',
    'ws-tab-cycling',
    'ws-autofocus',
    'ws-no-focus',
    'tabindex',
    'class',
    'data-access'
];

const LOST_ATTRIBUTES = [
    // scope обрабатывается отдельно
    // attributes обрабатывается отдельно
    // _wstemplatename обрабатывается отдельно
    'class',
    'data-access'
];

export default function findLostAttributes(node: BaseWasabyElement): ILostAttribute[] {
    const attributes: ILostAttribute[] = [];

    // В патче мы восстанавливали оригинальную последовательность атрибутов.
    // Повторяем ее здесь
    Object.keys(node.wsAttributes).forEach((property: string) => {
        const attr = node.wsAttributes[property];

        attributes.push({
            key: attr.wsKey,
            name: attr.wsHasAttributePrefix ? `attr:${attr.wsName}` : attr.wsName,
            node: attr,
            owner: node.wsAttributes,
            property
        });
    });
    Object.keys(node.wsEvents).forEach((property: string) => {
        const attr = node.wsEvents[property];

        if (attr instanceof BindNode) {
            attributes.push({
                key: attr.wsKey,
                name: attr.wsProperty,
                node: attr,
                owner: node.wsEvents,
                property
            });

            return;
        }

        attributes.push({
            key: attr.wsKey,
            name: attr.wsEvent,
            node: attr,
            owner: node.wsEvents,
            property
        });
    });
    Object.keys(node.wsOptions).forEach((property: string) => {
        const attr = node.wsOptions[property];

        if (!attr.hasFlag(Flags.UNPACKED)) {
            return;
        }

        attributes.push({
            key: attr.wsKey,
            name: attr.wsName,
            node: attr,
            owner: node.wsOptions,
            property
        });
    });
    Object.keys(node.wsContents).forEach((property: string) => {
        const attr = node.wsContents[property];

        attributes.push({
            key: node.wsKey,
            name: attr.wsName,
            node: attr,
            owner: node.wsContents,
            property
        });
    });

    attributes.sort((prev, next) => {
        return prev.key - next.key;
    });

    // Повторим алгоритм функции processAttributes и найдем потерянные атрибуты
    const mayBeToMerge: Record<string, ILostAttribute> = { };
    let needMerge = true;
    attributes.forEach((attr) => {
        if (/^bind:/i.test(attr.name)) {
            return;
        }

        if (/^on:/i.test(attr.name)) {
            return;
        }

        if (/^attr:/i.test(attr.name)) {
            needMerge = false;
            return;
        }

        if (SPECIAL_ATTRIBUTES_COLLECTION.indexOf(attr.name) > -1) {
            // В функции parseAttributesForData неудаленный атрибуты попадут в options.
            // Но! В опции также попадали ws-autofocus, tabindex, ..., которые не задавали с префиксом attr.
            mayBeToMerge[attr.name] = attr;
        }
    });

    if (!needMerge) {
        const lost = [];

        Object.values(mayBeToMerge).forEach((attr) => {
            if (LOST_ATTRIBUTES.indexOf(attr.name) > -1) {
                lost.push(attr);

                // Этот атрибут будет также отброшен и при обработке опций.
                // Удалим его и тут.
                delete attr.owner[attr.property];

                return;
            }

            // Этот атрибут будет обработан при обработке опций.
            // Переместим его в соответствующее место.
            if (!(attr.node instanceof AttributeNode)) {
                throw new Error('внутренняя ошибка: ожидался узел типа Attribute');
            }

            const name = attr.name.replace('attr:', '');
            const value = new OptionNode(name, new ValueNode(attr.node.wsValue));

            value.setFlag(Flags.UNPACKED);

            node.wsOptions[name] = value;

            delete attr.owner[attr.property];
        });

        if (lost.length > 0) {
            // Вот эти атрибуты не попадали в старой кодогенерации
            // Нужно вывести соответствующее сообщение
            return lost;
        }
    }

    return undefined;
}
