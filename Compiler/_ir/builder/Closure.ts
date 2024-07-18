/* eslint-disable @typescript-eslint/ban-ts-comment */

/**
 * @author Krylov M.A.
 *
 * Модуль создания замыканий для публичных шаблонных функций.
 *
 * Поскольку все шаблоны версионируются, из этого модуля можно управлять видом замыкания публичной шаблонной функции,
 * в зависимости от версии скомпилированного шаблона.
 */

import type { IClosure } from './Interface';
import type { IGlobal, TemplateFunction, TemplateExceptionsMode } from '../core/Interface';
import type { IRTemplateBody } from '../core/IRTemplateBody';

import { IRTemplateBodyType } from '../core/IRTemplateBody';

import Context from '../core/Context';
import Methods from '../methods/impl/Markup';
import Markup from '../generator/impl/Markup';

/**
 * Класс, реализующий метод создания замыкания - шаблонной функции,
 * которая инициализирует контекст и запускает приватную функцию построения верстки.
 *
 * @private
 */
class Closure implements IClosure {

    /**
     * Создать публичную шаблонную функцию.
     * @param {IGlobal} global Глобальный контекст шаблона.
     * @param {IRTemplateBody} body Функция-обертка над телом шаблона.
     */
    createTemplateFunction(global: IGlobal, body: IRTemplateBody): TemplateFunction {
        return function closedTemplateFunction(
            data: Record<string, unknown>,
            attr: Record<string, unknown>,
            context: unknown,
            isVdom: boolean,
            sets: unknown,
            forceCompatible: boolean,
            generatorConfig: unknown,
            templateExceptionMode: TemplateExceptionsMode = 'warn'
        ): unknown {
            const scope = new Context(global, {
                self: this,
                data,
                attr,
                context,
                isVdom,
                sets,
                forceCompatible,
                generatorConfig,
                templateExceptionMode
            });
            const methods = new Methods();

            scope.data = scope.args.data;
            scope.self = scope.args.self;

            scope.key = methods.validateNodeKey(scope.args.attr?.key as string);
            scope.templateCount = 0;
            scope.defCollection = {
                id: [],
                def: undefined
            };

            if (body.type === IRTemplateBodyType.CONTENT) {
                scope.pName = body.name;
                scope.data = methods.isolateScope(Object.create(scope.self ?? null), scope.data, body.name);
            }

            scope.viewController = methods.calcParent(scope.self, scope.pName, scope.data);
            scope.forceCompatible = scope.args.forceCompatible ?? false;
            const markupGenerator = methods.createGenerator(
                scope.args.isVdom,
                scope.forceCompatible,
                scope.args.generatorConfig
            );
            scope.funcContext = methods.getContext(scope.self);

            if (!global.isWasabyTemplate) {
                scope.funcContext = scope.data;
                scope.includedTemplates = this?.includedTemplates || { };

                for (const inlineTemplate in global.includedTemplates) {
                    if (global.includedTemplates.hasOwnProperty(inlineTemplate)) {
                        scope.includedTemplates[inlineTemplate] = function closedIncludedTemplate(
                            data2: Record<string, unknown>,
                            attr2: Record<string, unknown>,
                            context2: unknown,
                            isVdom2: boolean
                        ) {
                            return global.includedTemplates[inlineTemplate].call(
                                this,
                                data2,
                                attr2,
                                context2,
                                isVdom2,
                                sets,
                                forceCompatible,
                                generatorConfig,
                                templateExceptionMode
                            );
                        }.bind({
                            includedTemplates: scope.includedTemplates
                        });
                    }
                }
            }

            let out;
            try {
                out = markupGenerator.joinElements(
                    body.invoke(new Markup(markupGenerator), scope),
                    scope.key as string,
                    scope.defCollection
                );

                if (scope.defCollection?.def) {
                    out = markupGenerator.chain(
                        // @ts-ignore TS2345: Argument of type 'ReactNode' is not assignable to parameter of type 'string'.
                        out,
                        scope.defCollection,
                        // @ts-ignore TS2345: Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'IControl'.
                        scope.self
                    );
                    scope.defCollection = undefined;
                }
            } catch (error) {
                // В случае, если разрешается выброс исключений из шаблонной функции,
                // то выбрасывать оригинальную ошибку для последующей ее обработки в месте,
                // откуда выполняется построение шаблона
                if (templateExceptionMode === 'throw') {
                    throw error;
                }

                methods.templateError(scope.global.moduleName, error, scope.data);
            }

            // out может быть undefined: body.invoke возвращает массив с пустой строкой,
            // а joinElements удаляет пустую строку, оставляя в качестве результата undefined.
            return out || markupGenerator.createText('');
        };
    }
}

let closure: IClosure;
export default function createClosure(): IClosure {
    if (!closure) {
        closure = new Closure();
    }

    return closure;
}
