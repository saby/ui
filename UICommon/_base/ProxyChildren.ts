import { Logger } from 'UICommon/Utils';

const hasProxy = typeof Proxy !== 'undefined';
const hasReflect = typeof Reflect !== 'undefined';
const proxyChildrenFlagName = '__isProxyChildren';

/**
 * Создает proxy объект для отслеживания обращения к дочерним компонентам
 */
export function getProxyChildren<T>(moduleName?: string): T | {} {
    // IE11 не поддерживает Proxy, возвращаем в таком случае простой объект
    if (!hasProxy) {
        return {};
    }
    return new Proxy(
        {},
        {
            get(target: Record<string, unknown>, prop: string, receiver: unknown): unknown {
                // prop не строка может быть только в случае Symbol, которые генерирует react devtools
                // просто инорируем их
                if (typeof prop !== 'string') {
                    return undefined;
                }
                // Этот объект могут передать пропсом вниз. Сомнительно, но не запрещено.
                // Нужно уметь его определять, чтобы не сорить зря варнингами например в getChangedOptions.
                if (prop === proxyChildrenFlagName) {
                    return true;
                }

                // value всё равно надо получить. И нет смысла тратить время на оператор in, если он не undefined.
                const value = hasReflect ? Reflect.get(target, prop, receiver) : target[prop];
                // __transferred - помечаются дети, которые переносятся из оберток над чистым реактом
                // чтобы не замедлять проверку в рефе, выполяется обращенеи к объекту по имени
                // но это вызывает ложноположительные срабатывается вывода ошибки
                // поэтому __transferred не должен вызывать ошибку, т.к. его может не быть
                if (value === undefined && !prop.includes('__transferred') && !(prop in target)) {
                    let message =
                        `Попытка обращения к дочернему контролу: "${prop.toString()}" которого не существует. ` +
                        'Если это проверка наличия дочерного контрола, рекомендуется использовать оператор in.';
                    if (moduleName) {
                        message = `${message} Проверьте шаблон контрола: ${moduleName}`;
                    }
                    Logger.warn(message);
                }
                return value;
            },
        }
    );
}

interface IProxyChildren {
    [proxyChildrenFlagName]: boolean;
}

export function isProxyChildren(obj: unknown): boolean {
    return !!obj && (obj as IProxyChildren)[proxyChildrenFlagName];
}
