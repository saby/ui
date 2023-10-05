/**
 * @author Krylov M.A.
 *
 * Базовый класс обработчиков mustache выражений.
 * Реализует основные операции над узлами.
 */

import type {
    Node,
    IExpressionVisitor,
    ArrayExpressionNode,
    BinaryExpressionNode,
    CallExpressionNode,
    ConditionalExpressionNode,
    DecoratorCallNode,
    DecoratorChainCallNode,
    DecoratorChainContext,
    EmptyStatementNode,
    ExpressionBrace,
    ExpressionStatementNode,
    IdentifierNode,
    LogicalExpressionNode,
    MemberExpressionNode,
    ObjectExpressionNode,
    ProgramNode,
    SequenceExpressionNode,
    ThisExpressionNode,
    UnaryExpressionNode,
    IObjectProperty
} from '../../expressions/Nodes';

import type {
    IMethods,
    IECMAScriptGenerator,
    ISymbols
} from '../Interface';

import type {
    IFlags,
    ISource,
    IMustacheMeta,
    IMustacheGenerator,
    IMustacheOptions
} from './Interface';

import {
    LiteralNode
} from '../../expressions/Nodes';

import Flags from './Flags';

import {
    wrapSequence,
    wrapArray,
    wrapString
} from '../types/String';

import { MUSTACHE_EXPRESSION_PARAMETERS } from '../Constants';

const WRAPPED_EMPTY_STRING = wrapString('');

/**
 * Create function parameters for function that represents mustache expression.
 * @param {Flags} flags Content dependent flags for mustache expression.
 */
function getFunctionParams(flags: IFlags): string[] {
    const params = [...MUSTACHE_EXPRESSION_PARAMETERS];

    if (flags.hasChildrenReference) {
        return params;
    }

    // no children variable usage. remove it from parameters
    params.pop();
    if (flags.hasContextReference) {
        return params;
    }

    // no context variable usage. remove it from parameters
    params.pop();
    if (flags.hasFuncContextReference) {
        return params;
    }

    // no funcContext variable usage. remove it from parameters
    params.pop();
    if (flags.hasMethodsReference) {
        return params;
    }

    // perhaps, function uses rk function or this variable
    return [];
}

export abstract class Generator<TContext extends IMustacheOptions>
    implements IExpressionVisitor<TContext, string>, IMustacheGenerator<string>
{
    protected readonly methods: IMethods<string>;
    protected readonly generator: IECMAScriptGenerator;
    protected readonly symbols: ISymbols;
    protected readonly source: ISource;

    protected flags: Flags;
    protected prevFlags: Flags[];

    /**
     * Initialize new instance of mustache expression generator.
     * @param {IMethods<string>} methods Methods generator.
     * @param {IECMAScriptGenerator} generator ECMAScript generator.
     * @param {ISymbols} symbols In-module string literals accessor generator.
     * @param {ISource} source Source identifiers allowed to use inside mustache expression.
     * @protected
     */
    constructor(
        methods: IMethods<string>,
        generator: IECMAScriptGenerator,
        symbols: ISymbols,
        source: ISource
    ) {
        this.methods = methods;
        this.generator = generator;
        this.symbols = symbols;
        this.source = source;

        this.flags = new Flags();
        this.prevFlags = [];
    }

    abstract visitDecoratorChainCallNode(node: DecoratorChainCallNode, context: TContext): string;

    abstract visitDecoratorChainContext(node: DecoratorChainContext, context: TContext): string;

    abstract visitDecoratorCallNode(node: DecoratorCallNode, context: TContext): string;

    /**
     * Generate meta information for mustache expression.
     * @param {Node} node Node instance.
     * @param {<TContext>} options Code generation options.
     */
    generate(node: Node, options: TContext): IMustacheMeta<string> {
        this.flags.reset();

        if (options.alwaysTableFunction) {
            this.flags.alwaysTableFunction = true;
        }

        options.extraParameters = options.extraParameters ?? [];

        const body = node.accept(this, options);
        const isTableFunction = this.flags.isTableFunction();

        return {
            isTableFunction,
            flags: this.flags,
            body: isTableFunction ? this.generateFunction(body, this.flags, options) : body,
            program: node.string,
            shouldEscape: options.shouldEscape
        };
    }

    visitProgramNode(node: ProgramNode, context: TContext): string {
        // Не поддерживается наличие в body более чем 1 выражения. Нужен вывод предупреждения?
        // Больше одного выражения - это когда они разделены ';'.
        const body = node.body[0].accept(this, context);

        return this.wrapProgramBody(body, node, context);
    }

    visitEmptyStatementNode(node: EmptyStatementNode, context: TContext): string {
        return '';
    }

    visitExpressionStatementNode(node: ExpressionStatementNode, context: TContext): string {
        return node.expression.accept(this, context);
    }

    visitThisExpressionNode(node: ThisExpressionNode, context: TContext): string {
        this.flags.hasSelfReference = true;

        return 'this';
    }

    visitArrayExpressionNode(node: ArrayExpressionNode, context: TContext): string {
        const elements = node.elements.map((element: Node) => element.accept(this, context));

        return wrapArray(elements);
    }

    visitObjectExpressionNode(node: ObjectExpressionNode, context: TContext): string {
        const pairs = [];

        // eslint-disable-next-line guard-for-in
        for (const property in node.properties) {
            const key = this.visitObjectPropertyName(node.properties[property].key, context);

            if (key) {
                const value = node.properties[property].value.accept(this, context);

                if (context.generateObjectPropertyAsIdentifier !== false) {
                    if (key === value) {
                        pairs.push(` ${key}`);
                        continue;
                    }
                }

                pairs.push(` ${key}: ${value}`);
            }
        }

        return `{${wrapSequence(pairs, ',')} }`;
    }

    visitSequenceExpressionNode(node: SequenceExpressionNode, context: TContext): string {
        return wrapSequence(
            node.expressions
                .map((expression: Node) => expression.accept(this, context))
        );
    }

    visitUnaryExpressionNode(node: UnaryExpressionNode, context: TContext): string {
        return node.operator + node.argument.accept(this, context);
    }

    visitBinaryExpressionNode(node: BinaryExpressionNode, context: TContext): string {
        let operandsContext = context;

        if (node.operator === '+') {
            // Принудительно приводим потенциально отсутствующий alternate при конкатенации
            operandsContext = {
                ...context,
                defaultAlternateValue: WRAPPED_EMPTY_STRING
            };
        }

        const left = node.left.accept(this, operandsContext);
        const right = node.right.accept(this, operandsContext);

        return `${left} ${node.operator} ${right}`;
    }

    visitLogicalExpressionNode(node: LogicalExpressionNode, context: TContext): string {
        const left = node.left.accept(this, context);
        const right = node.right.accept(this, context);

        return `${left} ${node.operator} ${right}`;
    }

    visitConditionalExpressionNode(node: ConditionalExpressionNode, context: TContext): string {
        const test = node.test.accept(this, context);
        const consequent = node.consequent.accept(this, context);

        if (typeof node.alternate !== 'undefined') {
            const alternate = node.alternate.accept(this, context);

            return `(${test} ? ${consequent} : ${alternate})`;
        }

        return `(${test} ? ${consequent} : ${context.defaultAlternateValue})`;
    }

    visitCallExpressionNode(node: CallExpressionNode, context: TContext): string {
        const callee = node.callee.accept(this, context);
        const args = node.arguments.map(arg => arg.accept(this, context));

        return `${callee}(${wrapSequence(args)})`;
    }

    visitMemberExpressionNode(node: MemberExpressionNode, context: TContext): string {
        const object = node.object.accept(this, context);
        const property = node.property.accept(this, context);

        if (node.computed) {
            return `${object}[${property}]`;
        }

        return `${object}.${property}`;
    }

    visitIdentifierNode(node: IdentifierNode, context: TContext): string {
        return node.name;
    }

    visitExpressionBrace(node: ExpressionBrace, context: TContext): string {
        return `(${node.name.accept(this, context)})`;
    }

    visitLiteralNode(node: LiteralNode, context: TContext): string {
        if (typeof node.value === 'string') {
            const uLiteral = context.shouldUnescape ? unescape(node.value) : node.value;

            if (context.allowAllocatingLiterals) {
                return this.symbols.access(uLiteral);
            }

            return wrapString(uLiteral);
        }

        return `${node.value}`;
    }

    protected visitObjectPropertyName(key: IObjectProperty['key'], context: TContext): string {
        if (key instanceof LiteralNode) {
            return key.accept(this, {
                ...context,
                allowAllocatingLiterals: false
            });
        }

        if (context.generateObjectPropertyAsIdentifier !== false) {
            return key.name;
        }

        return this.symbols.access(key.name);
    }

    /**
     * Wrap mustache expression body with required function provided with context.
     * @param {string} body Mustache expression body.
     * @param {ProgramNode} node Program node of mustache expression.
     * @param {<TContext>} context Current generating context.
     * @protected
     */
    protected wrapProgramBody(body: string, node: ProgramNode, context: TContext): string {
        let result = body;

        if (context.shouldWrapUndefined === true) {
            this.flags.hasMethodsReference = true;

            result = this.methods.wrapUndefined(body);
        }

        if (context.shouldSanitize === true) {
            this.flags.hasMethodsReference = true;

            return this.methods.sanitize(result);
        }

        return result;
    }

    /**
     * Generate function for mustache expression.
     * @param {Flags} flags Content dependent flags.
     * @param {string} body Expression content.
     * @param {<TContext>} context Current generating context.
     * @protected
     */
    protected generateFunction(body: string, flags: IFlags, context: TContext): string {
        if (context.allowReducingFunctionParameters !== false && context.extraParameters?.length > 0) {
            throw new Error(
                'внутренняя ошибка генерации кода: extraParameters запрещено использовать вместе с allowReducingFunctionParameters'
            );
        }

        const params = context.allowReducingFunctionParameters !== false
            ? getFunctionParams(flags)
            : [...MUSTACHE_EXPRESSION_PARAMETERS, ...context.extraParameters];

        if (flags.hasSelfReference) {
            // Function contains usage of this variable. Arrow functions are forbidden!

            return this.generator.toAnonymousFunction(`return ${body};`, params);
        }

        return this.generator.toArrowExpression(body, params);
    }

    /**
     * Generate mustache expression meta information of particular sub node.
     * @param {Node} node Particular node of expression.
     * @param {<TContext>} context Current generating context.
     * @protected
     */
    protected generateMustacheMeta(node: Node, context: TContext): IMustacheMeta<string> {
        this.enterExpression(new Flags());
        const body = node.accept(this, context);
        const flags = this.leaveExpression();

        return {
            body,
            flags,
            program: node.string,
            isTableFunction: flags.isTableFunction(),
            shouldEscape: context.shouldEscape === true
        };
    }

    /**
     * Start processing sub expression which is expected to exported avoiding entry function
     * and switch processing context.
     * @param {Flags} flags Sub-expression flags.
     * @protected
     */
    protected enterExpression(flags: Flags): void {
        this.prevFlags.push(this.flags);

        this.flags = flags;
    }

    /**
     * Finish processing sub expression end restore processing context to its previous state.
     * @protected
     */
    protected leaveExpression(): Flags {
        const prev = this.flags;

        this.flags = this.prevFlags.pop();
        this.flags.merge(prev);

        return prev;
    }
}
