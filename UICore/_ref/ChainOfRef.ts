/**
 * @kaizen_zone ce2d78ce-ad75-44f2-a211-06e89b0e061a
 */
import { IResponsibility, IResponsibilityHandler, ORIGIN_HANDLER_TYPE } from './Responsibility';
import { Ref } from 'react';
import { CreateOriginRef } from './CreateOriginRef';

type TResponsibilityHandler = IResponsibilityHandler & {
    clear?: Function;
};

interface IChainRefResponsibility {
    add(responsibility: IResponsibility): ChainOfRef;
    execute(): TResponsibilityHandler;
}

/**
 * Создает и вызывает исполнение цепочки рефов
 * @private
 */
export class ChainOfRef implements IChainRefResponsibility {
    private handlers: IResponsibility[];

    constructor() {
        this.handlers = [];
    }
    isEmpty(): boolean {
        return !this.handlers.length;
    }

    /**
     * Добавление обязанности в цепочку
     * add(IResponsibility)
     * @param responsibility
     * @return ChainOfRef
     */
    add(responsibility: IResponsibility): ChainOfRef {
        this.handlers.push(responsibility);
        return this;
    }

    /**
     * Запуск цепочки обязанностей
     * execute()(node)
     * @return TResponsibilityHandler
     */
    execute(): TResponsibilityHandler {
        const execute: TResponsibilityHandler =
            this.handlers.length === 1
                ? this.handlers[0].getHandler()
                : (node: HTMLElement) => {
                      return this.handlers.forEach((handler) => {
                          return handler.getHandler()(node);
                      });
                  };
        // Запуск очистку цепочки обязанностей, вызывает clearHandler() у каждой обязанности, если он объявлен
        execute.clear = (type: string, forClear?: unknown): void => {
            this.handlers.forEach((handler) => {
                if (handler.type === ORIGIN_HANDLER_TYPE || handler.type !== type) {
                    return;
                }
                return handler.clearHandler && handler.clearHandler(forClear);
            });
        };

        return execute;
    }
    static both(ref1?: Ref<unknown>, ref2?: Ref<unknown>) {
        if (!ref1) {
            return ref2;
        }
        if (!ref2) {
            return ref1;
        }

        const chainOfRef = new ChainOfRef();
        chainOfRef.add(new CreateOriginRef(ref1));
        chainOfRef.add(new CreateOriginRef(ref2));
        return chainOfRef.execute();
    }
}
