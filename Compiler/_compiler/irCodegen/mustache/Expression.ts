/**
 * @author Krylov M.A.
 *
 * Модуль обработки основных mustache выражений.
 */

import type { IBindingConfiguration } from './Decorators';
import type { IMustacheOptions, IMustacheMeta } from './Interface';

import type {
    Node,
    CallExpressionNode,
    DecoratorCallNode,
    DecoratorChainCallNode,
    DecoratorChainContext,
} from '../../expressions/Nodes';

import { Generator } from './Base';

import {
    IdentifierNode,
    MemberExpressionNode
} from '../../expressions/Nodes';

import {
    MUSTACHE_EXPRESSION_CONTEXT_PARAMETER,
    TRANSLATION_FUNCTION,
    DEBUG_FUNCTION,
    SET_HTML_UNSAFE_FUNCTION,
    DEFAULT_SCOPE_IDENTIFIER
} from '../Constants';

import {
    shouldSkipDecoratorEscape,
    createBinding
} from './Decorators';

/**
 * Interface for resolved member property.
 *
 * @private
 */
interface IMemberMeta {

    /**
     * Member property path.
     */
    path: string[];

    /**
     * Member property data source.
     */
    dataSource: string;
}

/**
 * Current processing context.
 *
 * @private
 */
interface IContext extends IExpressionOptions {

    /**
     * Decorator sub-expression which is used for generating bind and mutable decorators.
     */
    decorator?: IMustacheMeta<string>;
}

/**
 * Processing options.
 * Warning! Options mustn't be re-created during generate process.
 *
 * @private
 */
export interface IExpressionOptions extends IMustacheOptions {

    /**
     * Current data source for methods instance.
     */
    dataSource: string;

    /**
     * Should check children name when resolve identifiers.
     * Default value is false.
     */
    checkChildren?: boolean;

    /**
     * Collection of child names.
     */
    children?: string[];

    /**
     * Allow binding decorator in mustache expression.
     * Default value is true.
     */
    allowBindings?: boolean;

    /**
     * Attribute name which value is processing.
     */
    attributeName?: string;
}

/**
 * Interface of generation result.
 *
 * @private
 */
export interface IExpressionMeta<TFunction> extends IMustacheMeta<TFunction> {

    /**
     * Collection of binding configurations.
     * Relevant for only bind and mutable decorators.
     */
    bindings?: IBindingConfiguration[];
}

function generateSetHTMLUnsafe(args: string[], context: IContext): string {
    context.shouldEscape = false;
    context.shouldSanitize = false;

    if (args.length > 0) {
        return args[0];
    }

    return '';
}

export default class ExpressionGenerator extends Generator<IContext> {
    private bindings: IBindingConfiguration[];

    generate(node: Node, options: IExpressionOptions): IExpressionMeta<string> {
        this.bindings = [];

        const meta = super.generate(node, options) as IExpressionMeta<string>;

        meta.bindings = this.bindings;

        return meta;
    }

    visitCallExpressionNode(node: CallExpressionNode, context: IContext): string {
        const args = node.arguments.map(arg => arg.accept(this, context));

        if (node.callee instanceof IdentifierNode) {
            if (node.callee.name === SET_HTML_UNSAFE_FUNCTION) {
                return generateSetHTMLUnsafe(args, context);
            }

            if (node.callee.name === TRANSLATION_FUNCTION) {
                this.flags.hasTranslationReference = true;

                return `${node.callee.name}(${args.join(', ')})`;
            }

            if (node.callee.name === DEBUG_FUNCTION) {
                this.flags.hasDebugReference = true;

                return `${node.callee.name}(${args.join(', ')})`;
            }

            if (node.callee.name === 'getResourceUrl') {
                this.flags.hasMethodsReference = true;

                return this.methods.getResourceURL(args);
            }
        }

        const { dataSource, path } = this.resolveMemberProperty(node.callee, context);

        this.flags.hasMethodsReference = true;

        // Critical!
        //   Call, заданное через Identifier, вызывается с контекстом funcContext, а не dataSource.
        //   Call, заданное через Member, вызывается с контекстом path[0:-1].
        if (dataSource === context.dataSource && path.length === 1) {
            this.updateFunctionParameters(this.source.funcContext, context);

            // Используем этот метод только для невычисляемых контекстов,
            // когда функции лежат прямо в текущем контексте.
            return this.methods.call(this.source.funcContext, dataSource, path, args);
        }

        this.updateFunctionParameters(dataSource, context);

        return this.methods.call2(dataSource, path, args);
    }

    visitMemberExpressionNode(node: MemberExpressionNode, context: IContext): string {
        const { dataSource, path } = this.resolveMemberProperty(node, context);

        this.flags.hasMethodsReference = true;

        this.updateFunctionParameters(dataSource, context);

        return this.methods.getter(dataSource, path);
    }

    visitDecoratorCallNode(node: DecoratorCallNode, context: IContext): string {
        if (node.caller) {
            if (context.decorator) {
                this.flags.merge(context.decorator.flags, true);
            }

            context.decorator = this.generateMustacheMeta(node.caller, context);
        }

        return node.decorator.accept(this, context);
    }

    visitDecoratorChainContext(node: DecoratorChainContext, context: IContext): string {
        if (node.entity) {
            if (context.decorator) {
                this.flags.merge(context.decorator.flags, true);
            }

            context.decorator = this.generateMustacheMeta(node.entity, context);
        }

        return node.fn.accept(this, context);
    }

    visitDecoratorChainCallNode(node: DecoratorChainCallNode, context: IContext): string {
        if (shouldSkipDecoratorEscape(node.identifier)) {
            context.shouldEscape = false;
            // Очень запутанная схема с sanitize, escape
            context.shouldSanitize = true;
        }

        // Обработать как обычный декоратор
        if (['bind', 'mutable'].indexOf(node.identifier) === -1) {
            const decoratorArgs = node.argumentsDecorator.map(arg => arg.accept(this, context));

            // Используем неоформленное тело mustache выражения или литерал -- мы будем внутри функции
            decoratorArgs.unshift(context.decorator.body);

            this.flags.hasMethodsReference = true;
            this.flags.merge(context.decorator.flags, true);

            return this.methods.decorate(node.identifier, decoratorArgs);
        }

        if (context.allowBindings === false) {
            throw new Error('bind и mutable декораторы запрещено использовать в данном контексте');
        }

        if (typeof context.attributeName === 'undefined') {
            throw new Error('внутренняя ошибка: не задан attributeName для binding expression');
        }

        // Обработать как связывающий декоратор
        const [initValue, direction] = node.argumentsDecorator.map(arg => this.generateMustacheMeta(arg, context));

        // Эти значения гарантированно используются вне mustache выражения.
        // Необходимо их обернуть в функцию, если они являются функцией.
        this.wrapIntoFunction(context?.decorator, context);
        this.wrapIntoFunction(direction, context);

        const binding = createBinding(
            node.identifier,
            context.decorator,
            context.attributeName,
            initValue !== undefined,
            direction
        );

        this.bindings.push(binding);

        if (initValue?.isTableFunction) {
            // Этот фрагмент считается частью генерируемого выражения.
            // Необходимо объединить всего его флаги с текущим контекстом.
            this.flags.merge(initValue.flags, true);

            // Значение по умолчанию должно приводиться к строке
            return this.methods.wrapString(initValue.body);
        }

        return initValue?.body;
    }

    visitIdentifierNode(node: IdentifierNode, context: IContext): string {
        const resolved = this.resolveIdentifier(node, context);

        if (resolved !== null) {
            return resolved;
        }

        this.flags.hasMethodsReference = true;

        this.updateFunctionParameters(context.dataSource, context);

        return this.methods.getter(context.dataSource, [this.symbols.access(node.name)]);
    }

    /**
     * Resolve identifier.
     * @param {IdentifierNode} node Processing node.
     * @param {IContext} context Current processing context.
     * @protected
     */
    protected resolveIdentifier(node: IdentifierNode, context: IContext): string | null {
        if ([TRANSLATION_FUNCTION, DEBUG_FUNCTION, SET_HTML_UNSAFE_FUNCTION].indexOf(node.name) > -1) {
            context.shouldSanitize = false;

            return node.name;
        }

        if (node.name === DEFAULT_SCOPE_IDENTIFIER) {
            this.flags.hasMethodsReference = true;

            return this.methods.dots(context.dataSource);
        }

        return null;
    }

    /**
     * Resolve identifier or member expression.
     * @param {IdentifierNode | MemberExpressionNode} node Processing node.
     * @param {IContext} context Current processing context.
     * @protected
     */
    protected resolveMemberProperty(node: IdentifierNode | MemberExpressionNode, context: IContext): IMemberMeta {
        const path = [];
        let object: Node = node;
        let dataSource = context.dataSource;

        while (object instanceof MemberExpressionNode) {
            if (object.computed) {
                if (context.allowComputedObjectProperty === false) {
                    throw new Error('вычисляемые member-выражения запрещены');
                }

                path.unshift(object.property.accept(this, context));
            } else if (object.property instanceof IdentifierNode) {
                path.unshift(this.symbols.access(object.property.name));
            } else {
                throw new Error(`получен неизвестный тип "${object.property.type}" property при вычислении member expression`);
            }

            object = object.object;
        }

        if (object instanceof IdentifierNode) {
            if (object.name === MUSTACHE_EXPRESSION_CONTEXT_PARAMETER) {
                // context может перекрываться в scope, поэтому вставляем проверку, так ли это
                // Если он перекрыт, возвращаем перекрытое поле, иначе сам контекст
                // может быть заменить getter на data.context? значительное сокращение
                this.flags.hasMethodsReference = true;
                this.flags.hasContextReference = true;

                const contextGetter = this.methods.getter(context.dataSource, [this.symbols.access(object.name)]);

                dataSource = `(!${contextGetter} ? ${this.source.context} : ${contextGetter})`;
            } else {
                if (context.checkChildren && context.children?.indexOf(object.name) > -1) {
                    dataSource = this.source.children;
                }

                path.unshift(this.symbols.access(object.name));
            }
        } else {
            // Если источник данных - сложное выражение, его нужно будет вычислять
            dataSource = object.accept(this, context);
        }

        return {
            path,
            dataSource
        };
    }

    /**
     * Update current flags to generate good mustache expression function.
     * @param {string} dataSource Current data source.
     * @param {IContext} context Current processing context.
     * @protected
     */
    protected updateFunctionParameters(dataSource: string, context: IContext): void {
        if (dataSource === this.source.context) {
            this.flags.hasContextReference = true;
        } else if (dataSource === this.source.children) {
            this.flags.hasChildrenReference = true;
        } else if (dataSource === this.source.self) {
            this.flags.hasSelfReference = true;
        } else if (dataSource === this.source.funcContext) {
            this.flags.hasFuncContextReference = true;
        }
    }

    /**
     * Wrap mustache expression body into function.
     * Every function which avoids entry function .generate() must be wrapped.
     * @param {IMustacheMeta} meta Fragment of mustache expression.
     * @param {IContext} context Current processing context.
     * @protected
     */
    protected wrapIntoFunction(meta: IMustacheMeta<string>, context: IContext): void {
        if (meta?.isTableFunction) {
            meta.body = this.generateFunction(
                meta.body,
                meta.flags,
                context
            );
        }
    }
}
