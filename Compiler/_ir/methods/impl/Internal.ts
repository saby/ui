/**
 * @author Krylov M.A.
 */

import Markup from './Markup';
import { extractValue, implantValue } from '../utils/Object';
import MustacheExpressionError from '../utils/Error';
import { object } from 'Types/util';

/**
 * @private
 */
export default class Internal extends Markup {
    getter(dataSource: unknown, path: string[]): unknown {
        try {
            return extractValue(dataSource, path);
        } catch (error) {
            throw new MustacheExpressionError(
                MustacheExpressionError.ERROR_INVALID_INTERNAL_CONTEXT,
                error.message
            );
        }
    }

    setter(dataSource: unknown, path: string[], value: unknown): unknown {
        try {
            // @ts-ignore
            if (path[0] === 'record' && dataSource?.props?.record?.has(path[1])) {
                // todo костыль,
                //  есть конкретная ситуация, когда в wml-шаблон вставляемый через partial передают record
                //  и в шаблоне делают bind:selectedKey="record.SalaryTypeExtended"
                //  бинды применяются на реф. то есть когда элемент создается. но если в шаблон передадут новый
                //  record, в который нужно будет записывать измененные внутри данные, а элемент при этом
                //  останется прежним, реф не стрельнет, и бинд не узнает про новый record, будет писать в старый.
                //  в бинде причем есть попытка сначала записать в родительский контрол viewController, а если
                //  не получилось, тогда уж записывать в объект скоупа который сформирован для шаблона.
                //  В ошибке в родительском контроле мы не находим record, данные записывюатся в скоуп, где старый record.
                //  Поэтому, поищем еще в пропах родительского контрола, там то новый рекорд как раз найдется.
                // @ts-ignore
                return object.implantValue(dataSource.props, path, value);
            }
            return implantValue(dataSource, path, value);
        } catch (error) {
            throw new MustacheExpressionError(
                MustacheExpressionError.ERROR_INVALID_INTERNAL_CONTEXT,
                error.message
            );
        }
    }

    call(funcContext: unknown, dataSource: unknown, path: string[], args: unknown[] = []): unknown {
        // Эта проверка используется для проброса переменных из замыкания(dirtyCheckingVars)
        // Значения переменных из замыкания вычисляются в момент создания контентной опции
        // и пробрасываются через все контролы, оборачивающие контент.
        // Если в замыкании используется функция, в какой-то момент этой функции может не оказаться,
        // мы попытаемся ее вызвать и упадем с TypeError
        // Поэтому нужно проверить ее наличие. Кроме того, нужно проверить, что аргументы этой функции,
        // если такие есть, тоже не равны undefined, иначе может случиться TypeError внутри функции
        // Изначально здесь была проверка без !== undefined. Но такая проверка некорректно работала
        // в случае, если одно из проверяемых значения было рано 0, например.
        // Вообще этой проверки быть не должно. От нее можно избавиться,
        // если не пробрасывать dirtyCheckingVars там, где это не нужно.

        const fn = this.getter(dataSource, path);
        if (typeof fn !== 'function') {
            throw new MustacheExpressionError(
                MustacheExpressionError.ERROR_INVALID_INTERNAL_CONTEXT,
                `${path.slice(-1)} is not a function`
            );
        }

        if (args.some((arg) => typeof arg === 'undefined')) {
            // Мы не вызываем функцию, потому что получили невалидный аргумент, а значит
            // вычисление происходит в неверном контексте. Необходимо проставить флаг,
            // чтобы перерисовка происходила принудительно.
            throw new MustacheExpressionError(
                MustacheExpressionError.ERROR_INVALID_INTERNAL_CONTEXT,
                'Received undefined in arguments'
            );
        }

        return fn.apply(funcContext, args);
    }

    call2(dataSource: unknown, path: string[], args: unknown[] = []): unknown {
        const context = this.getter(dataSource, path.slice(0, -1));
        if (context === undefined || context === null) {
            throw new MustacheExpressionError(
                MustacheExpressionError.ERROR_INVALID_INTERNAL_CONTEXT,
                `Cannot read properties of ${context} (reading '${path.slice(-1)}')`
            );
        }

        return this.call(context, context, path.slice(-1), args);
    }
}
