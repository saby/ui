import { Logger } from 'UICommon/Utils';

const hasProxy = typeof Proxy !== 'undefined';
const hasReflect = typeof Reflect !== 'undefined';

/**
 * Создает proxy объект для отслеживания обращения к дочерним компонентам
 */
export function getProxyChildren<T>(): T | {} {
    const moduleName = this._moduleName;
    // IE11 не поддерживает Proxy, возвращаем в таком случае простой объект
    if (!hasProxy) {
        return {};
    }
    return new Proxy(
        {},
        {
            get(target: object, prop: string, receiver: unknown): unknown {
                // prop не строка может быть только в случае Symbol, которые генерирует react devtools
                // просто инорируем их
                if (typeof prop !== 'string') {
                    return undefined;
                }
                // __transferred - помечаются дети, которые переносятся из оберток над чистым реактом
                // чтобы не замедлять проверку в рефе, выполяется обращенеи к объекту по имени
                // но это вызывает ложноположительные срабатывается вывода ошибки
                // поэтому __transferred не должен вызывать ошибку, т.к. его может не быть
                if (!(prop in target) && !prop.includes('__transferred')) {
                    let message = `Попытка обращения к дочернему контролу: "${prop.toString()}" которого не существует.`;
                    if (moduleName) {
                        message = `${message} Проверьте шаблон контрола: ${moduleName}`;
                    }
                    Logger.warn(message);
                }
                return hasReflect
                    ? Reflect.get(target, prop, receiver)
                    : target[prop];
            },
        }
    );
}
