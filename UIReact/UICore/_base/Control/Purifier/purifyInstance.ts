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

// Сделаем безопасными обращения вида instance.one.two.funс().three даже после очистки.
const proxy: TProxy =
    typeof Proxy !== 'undefined'
        ? new Proxy(() => {}, {
              get: (target, propName) => {
                  if (propName === Symbol.toPrimitive) {
                      return toPrimitiveFunction;
                  }
                  return proxy;
              },
              set: () => {
                  return false;
              },
              apply: () => {
                  return proxy;
              },
          })
        : () => {};

const commonDefinePropertyAttributes = {
    enumerable: false,
    configurable: false,
    get: function useAfterPurify(): TProxy {
        return proxy;
    },
};

function createUseAfterPurifyErrorFunction(stateName: string, instanceName: string): () => TProxy {
    return function useAfterPurify(): TProxy {
        Logger.error(
            'Разрушенный контрол ' +
                instanceName +
                ' пытается обратиться к своему полю ' +
                stateName +
                '. Для предотвращения утечки памяти значение было удалено.' +
                'Избегайте использования полей контрола после его дестроя, дестрой должен быть последней операцией над контролом.'
        );
        return proxy;
    };
}

function isValueToPurify(stateValue: TInstanceValue): boolean {
    return !!stateValue && typesToPurify.indexOf(typeof stateValue) !== -1;
}

function purifyState(
    instance: TInstance,
    stateName: string,
    instanceName: string,
    isTestStand: boolean
): void {
    if (isTestStand) {
        const useAfterPurifyErrorFunction = createUseAfterPurifyErrorFunction(
            stateName,
            instanceName
        );
        Object.defineProperty(instance, stateName, {
            enumerable: false,
            configurable: false,
            get: useAfterPurifyErrorFunction,
            set: useAfterPurifyErrorFunction,
        });
        return;
    }
    try {
        // Быстрее всего просто присвоить.
        instance[stateName] = proxy;
    } catch {
        // Может быть только getter, тогда приходится использовать defineProperty. Редкий случай.
        Object.defineProperty(instance, stateName, commonDefinePropertyAttributes);
    }
}

function purifyInstanceSync(
    instance: TInstance,
    instanceName: string,
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
        purifyState(instance, stateName, instanceName, true);
    }

    instance.__purified = true;
    Object.freeze(instance);
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
 * @param {Record<string, boolean>} [stateNamesNoPurify?] - объект с именами полей, которые чистить не нужно.
 * @class UICore/_base/Control/Purifier/purifyInstance
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
