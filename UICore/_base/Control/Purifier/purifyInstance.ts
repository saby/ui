/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
import { Logger } from 'UICommon/Utils';
import { TimeoutHandlersQueue } from 'UICore/Executor';
import { cookie } from 'Application/Env';
import { once } from 'Types/function';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TInstanceValue = any;
type TInstance = Record<string, TInstanceValue>;
type TProxy = typeof Proxy | (() => void);

const asyncPurifyTimeout = 10000;
const timeoutHandlersQueue = new TimeoutHandlersQueue(asyncPurifyTimeout);

const typesToPurify: string[] = ['object', 'function'];

// Защитимся ещё и от кода вида i < proxy.length, чтобы не ломалось приведение к примитиву.
// TODO в 6100 лучше наоборот, вместо прокси сразу крашить вызов. Так хотя бы ошибки будут ловиться облаком.
const toPrimitiveFunction = () => '';

function error(): void {
    Logger.error(
        'Вы пытаетесь использовать поле или метод разрушенного контрола.' +
            'Нужно устранить причину этого обращения. Например, добавить забытую отписку от шины событий при анмаунте.' +
            'По стеку должно быть понятно, где используется контрол.'
    );
}

// Сделаем безопасными обращения вида instance.one.two.funс().three даже после очистки.
const proxy: TProxy =
    typeof Proxy !== 'undefined'
        ? new Proxy(() => {}, {
              get: (_target, propName) => {
                  if (propName === Symbol.toPrimitive) {
                      return toPrimitiveFunction;
                  }
                  error();
                  return proxy;
              },
              set: () => {
                  return false;
              },
              apply: () => {
                  error();
                  return proxy;
              },
          })
        : () => {};

function isValueToPurify(stateValue: TInstanceValue): boolean {
    return !!stateValue && typesToPurify.indexOf(typeof stateValue) !== -1;
}

function purifyState(instance: TInstance, stateName: string): void {
    try {
        // Быстрее всего просто присвоить.
        instance[stateName] = proxy;
    } catch {
        // Может быть только getter, тогда приходится использовать defineProperty. Редкий случай.
        // Object.defineProperty(instance, stateName, commonDefinePropertyAttributes);
    }
}

function purifyInstanceSync(
    instance: TInstance,
    _instanceName: string,
    stateNamesNoPurify?: Record<string, boolean>
): void {
    if (instance.__purified) {
        return;
    }

    const instanceStateNamesToPurify = Object.keys(instance);
    for (const stateName of instanceStateNamesToPurify) {
        if (stateNamesNoPurify && stateNamesNoPurify[stateName]) {
            continue;
        }
        if (!isValueToPurify(instance[stateName])) {
            continue;
        }
        // На данный момент не полностью удаляю ветку с isTestStand,
        // чтобы если что быстро вернуть, не отказываясь от оптимизаций в этом же коммите.
        purifyState(instance, stateName);
    }

    instance.__purified = true;
    // Object.freeze(instance);
}

const cookieName = 'disablePurify';
const isBrowser = typeof window !== 'undefined';
export const isPurifyDisabled: () => boolean = isBrowser
    ? once(() => cookie.get(cookieName) === 'true')
    : () => true;

/**
 * Функция, очищающая экземпляр от объектов и фунций. Генерирует предупреждение при попытке обратиться к ним.
 * Также замораживает экземпляр, тем самым убирая возможность записать или перезаписать поле любого типа.
 * @param {Record<string, any>} instance - экземпляр, поля которого нужно очистить.
 * @param {string} [instanceName = 'instance'] - имя экземпляра для отображения в предупреждении.
 * @param {boolean} [async = false] - вызывать ли очистку с задержкой.
 * @param {Record<string, boolean>} stateNamesNoPurify - объект с именами полей, которые чистить не нужно.
 * @private
 */
export default function purifyInstance(
    instance: TInstance,
    instanceName: string = 'instance',
    async: boolean = false,
    stateNamesNoPurify?: Record<string, boolean>
): void {
    if (async) {
        timeoutHandlersQueue.addHandler(() => {
            purifyInstanceSync(instance, instanceName, stateNamesNoPurify);
        });
    } else {
        purifyInstanceSync(instance, instanceName, stateNamesNoPurify);
    }
}
