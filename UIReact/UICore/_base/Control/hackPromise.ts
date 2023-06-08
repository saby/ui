import { isUnitTestMode } from 'UICommon/Utils';

const global = (function () {
    // eslint-disable-next-line no-sequences, no-eval
    return this || (0, eval)('this');
})();
const PrivatePromise = global.Promise;
// если загружен полифил Promise и нет поддержки Symbol.hasInstance нужно выставить прототипы вручную,
// чтобы работала проверка object instanceof Promise. такая ситуация возможна в ie11
const needSetPrototype =
    PrivatePromise.prototype._moduleName &&
    (typeof Symbol !== 'function' ||
        (typeof Symbol === 'function' && !Symbol.hasInstance));

/**
 * Тип, описывающий функцию-обработчик Promise
 * Поле noWatch проставляется в true только на СП из полифила Promise, в методах Promise.resolve и Promise.reject
 * для того, чтобы не добавлять watcher Promise
 */
type TPromiseExecutor = Function & { noWatch?: boolean };

export function hackPromise(): void {
    if (global.Promise !== PrivatePromise) {
        // уже применили
        return;
    }
    if (isUnitTestMode()) {
        // в юнитах не используем эту оптимизацию, потому что там мокнутый setTimeout который отстреливает синхронно,
        // промисы в beforeMount становятся зарезолвленные, а тесты ожидают, что они будут незарезолвленные
        return;
    }

    _hackPromise();
}

/**
 * приватная часть метода хака Promise.
 * Необходимо для unit-тестирования
 */
export function _hackPromise(): void {
    const PromiseWasabyVar = function PromiseWasaby(
        executor: TPromiseExecutor
    ): Promise<unknown> {
        const resolvedObj = {
            state: 'pending',
        };
        const resolver = (resolve, reject) => {
            try {
                executor(
                    (result: Promise<unknown> | unknown) => {
                        try {
                            if (
                                !(result && (result as Promise<unknown>).then)
                            ) {
                                resolvedObj.state = 'fulfilled';
                            }
                            resolve(result);
                        } catch (err) {
                            resolvedObj.state = 'rejected';
                            reject(err);
                        }
                    },
                    (error: Error) => {
                        resolvedObj.state = 'rejected';
                        reject(error);
                    }
                );
            } catch (error) {
                resolvedObj.state = 'rejected';
                reject(error);
            }
        };
        if (executor.noWatch) {
            resolver.noWatch = true;
        }
        const _super = new PrivatePromise(resolver);
        // @ts-ignore добавляем для проверки в BeforeMountDecorator
        _super.resolvedObj = resolvedObj;

        if (needSetPrototype) {
            // явно указывам прототип для Promise, это нужно для работы проверки instanceof Promise,
            // т.к. Promise являеться экземпляром PromiseWasaby, а созданный объект PrivatePromise
            Object.setPrototypeOf(_super, PromiseWasaby.prototype);
        }

        return _super;
    };
    if (needSetPrototype) {
        // так же нужно явно указать прототип для PromiseWasaby,
        // чтобы цепочка прототипов для проверки instanceof Promise была правильной
        Object.setPrototypeOf(
            PromiseWasabyVar.prototype,
            PrivatePromise.prototype
        );
    } else {
        Object.defineProperty(PromiseWasabyVar, Symbol.hasInstance, {
            value(inst) {
                return inst instanceof PrivatePromise;
            },
        });
    }
    PromiseWasabyVar.all = PrivatePromise.all;
    PromiseWasabyVar.resolve = PrivatePromise.resolve;
    PromiseWasabyVar.allSettled = PrivatePromise.allSettled;
    PromiseWasabyVar.any = PrivatePromise.any;
    PromiseWasabyVar.race = PrivatePromise.race;
    PromiseWasabyVar.reject = PrivatePromise.reject;
    global.Promise = PromiseWasabyVar;
}
