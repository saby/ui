/* eslint-disable @typescript-eslint/no-magic-numbers */
/**
 * @author Krylov M.A.
 *
 * Модуль генерации компонентов мета описания шаблона по его аннотации.
 */

import type { ProgramsContainer } from '../../core/IRInternal';
import type { IAnnotation } from '../../core/IRAnnotator';

import type {
    Ast,
    BaseWasabyElement,
    BaseHtmlElement,
    IAstVisitor,
    IProperties,
    ArrayNode,
    AttributeNode,
    BindNode,
    BooleanNode,
    CDataNode,
    CommentNode,
    ContentOptionNode,
    DoctypeNode,
    ElementNode,
    EventNode,
    ForeachNode,
    ForNode,
    FunctionNode,
    InstructionNode,
    NumberNode,
    ObjectNode,
    StringNode,
    TextDataNode,
    TextNode,
    TranslationNode
} from '../../core/Ast';

import {
    Flags,
    IfNode,
    ElseNode,
    OptionNode,
    ValueNode,
    ExpressionNode,
    ComponentNode,
    TemplateNode,
    InlineTemplateNode,
    StaticPartialNode,
    DynamicPartialNode,
    visitAll
} from '../../core/Ast';

import type {
    ProgramNode
} from '../../expressions/Nodes';

import type {
    TMustache,
    IECMAScriptGenerator,
    IMethods,
    IGenerator,
    IObjectProperty,
    IDescription,
    ITemplateBody,
    TPrimitive,
    IInjections,
    IEntryPoint,
    ISymbols,
    IFormatter
} from '../Interface';

import type {
    IFlags,
    TBindMeta,
    TEventMeta,
    TExpressionMeta,
    IMustacheMeta,
    IBindingConfiguration
} from '../Mustache';

import type { IPath } from '../../core/Resolvers';

import {
    BindGenerator,
    EventGenerator,
    ExpressionGenerator
} from '../Mustache';

import {
    wrapArray,
    wrapString,
    toSafeMultilineComment
} from '../types/String';

import Container from '../types/Container';
import Contract from './Contract';

import {
    MUSTACHE_EXPRESSION_SOURCE,
    MUSTACHE_EXPRESSION_PARAMETERS,
    TEMPLATE_FUNCTION_PARAMETERS,
    TRANSLATION_FUNCTION,
    DEFAULT_SCOPE_IDENTIFIER,
    IS_WINDOW_UNDEFINED_IDENTIFIER,
    DEFAULT_CONTEXT_GETTER_FUNCTION,
    DEBUG_FUNCTION
} from '../Constants';

interface IEventHandlers {
    handlers: Record<string, string[]>;
    meta: string | undefined;
}

// TODO: extend from mustache
interface IContextConfig {
    shouldEscape?: boolean;
    shouldSanitize?: boolean;
    shouldWrapUndefined?: boolean;
    shouldUnescape?: boolean;

    alwaysTableFunction?: boolean;
    defaultAlternateValue?: string;
    allowBindings?: boolean;

    attributeName?: string;
    propertyPath?: string[];
    isControl?: boolean;
    children?: string[];

    attributes?: Record<string, TPrimitive>;
    events?: IEventHandlers;
    options?: Record<string, TPrimitive>;
    bindings?: IBindingConfiguration[];
}

export interface IContext extends IContextConfig {
    spawn(context?: IContextConfig): IContext;
}

interface IMustacheInfo {
    body?: string;
    program?: string,
    referenceId?: TMustache;
    shouldEscape?: boolean;
}

interface IInternalsMeta {
    id: number;
    programs: ProgramNode[];
}

const WRAPPED_EMPTY_STRING = wrapString('');

class Context implements IContext {
    shouldEscape: boolean;
    shouldSanitize: boolean;
    shouldWrapUndefined: boolean;
    shouldUnescape: boolean;

    alwaysTableFunction: boolean;
    defaultAlternateValue: string;
    allowBindings: boolean;

    attributeName: string;
    propertyPath: string[];
    isControl: boolean;
    children: string[];

    attributes: Record<string, TPrimitive>;
    events: IEventHandlers;
    options: Record<string, TPrimitive>;
    bindings: IBindingConfiguration[];

    constructor(parent?: IContextConfig) {
        this.shouldEscape = parent?.shouldEscape ?? true;
        this.shouldSanitize = parent?.shouldSanitize ?? false;
        this.shouldWrapUndefined = parent?.shouldWrapUndefined ?? false;
        this.shouldUnescape = parent?.shouldUnescape ?? false;

        this.alwaysTableFunction = parent?.alwaysTableFunction ?? false;
        this.defaultAlternateValue = parent?.defaultAlternateValue ?? 'undefined';
        this.allowBindings = parent?.allowBindings ?? false;

        this.attributeName = parent?.attributeName ?? undefined;
        this.propertyPath = parent?.propertyPath ?? [];
        this.isControl = parent?.isControl ?? false;
        this.children = parent?.children ?? [];

        this.attributes = parent?.attributes;
        this.events = parent?.events;
        this.options = parent?.options;
        this.bindings = parent?.bindings;
    }

    spawn(config?: IContextConfig) {
        return new Context({
            ...this,
            ...config
        });
    }
}

/**
 * Convert value to expected boolean type.
 * @param {string} value String representation of boolean content.
 */
function toSafeBoolean(value: string): string {
    if (value === undefined) {
        // Boolean() === false and Boolean(undefined) === false
        // Use this construction only in case of no data.
        return 'false';
    }

    // Контент текстового узла приходит сюда в кавычках, а mustache-выражения -- без.
    const cleanValue = value.replace(/^"|"$/g, '');
    if (cleanValue === 'true' || cleanValue === 'false') {
        return cleanValue;
    }

    return `Boolean(${value})`;
}

/**
 * Convert value to expected number type.
 * @param {string} value String representation of number content.
 */
function toSafeNumber(value: string): string {
    if (value === undefined) {
        // Number() === 0 but Number(undefined) === NaN
        // Use this construction only in case of no data.
        return '0';
    }

    // Контент текстового узла приходит сюда в кавычках, а mustache-выражения -- без.
    const cleanValue = value.replace(/^"|"$/g, '');
    if (!Number.isNaN(Number.parseFloat(cleanValue))) {
        return cleanValue;
    }

    return `Number(${value})`;
}

/**
 * Convert value to expected string type.
 * @param {string} value String representation of string content.
 */
function toSafeString(value: string): string {
    if (value === undefined) {
        // String() === "" but String(undefined) === "undefined"
        // Use this construction only in case of no data.
        return WRAPPED_EMPTY_STRING;
    }

    if (!value.startsWith('"')) {
        // Здесь может быть последовательность Mustache выражений, для которой явно задан тип String.
        // Необходимо привести всё выражение к строке.
        return `${WRAPPED_EMPTY_STRING} + ${value}`;
    }

    return `${value}`;
}

function toStringConcatenation(value: string[]): string {
    if (value.length === 0) {
        return undefined;
    }

    const strValue = value.join(' + ');
    if (value.length > 1 && !strValue.startsWith('"')) {
        // Здесь может быть последовательность Mustache выражений.
        // Необходимо привести всё выражение к строке.
        return `${WRAPPED_EMPTY_STRING} + ${strValue}`;
    }

    return strValue;
}

function isTemplate(fullPath: string): boolean {
    // FIXME: какой-то ужасный ужас. Трогать это сейчас не хочется
    const hasTemplatePlugin = (
        /^wml!/gi.test(fullPath) ||
        /^(optional!)?tmpl!/gi.test(fullPath) ||
        /^html!/gi.test(fullPath)
    );

    const hasSlashes = fullPath.indexOf('/') > -1;
    const hasOptionalPlugin = /^optional!/gi.test(fullPath);

    return (
        hasTemplatePlugin || (
            !hasSlashes && !hasTemplatePlugin && hasOptionalPlugin
        )
    );
}

function isControlNode(node: BaseWasabyElement): boolean {
    // FIXME: какой-то ужасный ужас. Трогать это сейчас не хочется
    if (node instanceof StaticPartialNode) {
        return !(isTemplate(node.wsPath.getFullPath()) || node.wsPath.hasLogicalPath());
    }

    if (node instanceof ComponentNode) {
        return !node.wsPath.hasLogicalPath();
    }

    if (node instanceof DynamicPartialNode) {
        return false;
    }

    return false;
}

/**
 * Get dynamic component option names.
 * @param {BaseWasabyElement} component Component node.
 * @returns {string[]} Array of dynamic component option names.
 */
function getBlockOptionNames(component: BaseWasabyElement): string[] {
    const names = [];
    for (const name in component.wsOptions) {
        if (component.wsOptions.hasOwnProperty(name)) {
            const option = component.wsOptions[name];
            if (option.hasFlag(Flags.UNPACKED)) {
                // Игнорируем опции, которые были заданы на атрибуте тега компонента
                continue;
            }
            names.push(name);
        }
    }
    return names;
}

function getComponentMergeType(component: BaseWasabyElement): string {
    if (component instanceof DynamicPartialNode) {
        if (component.wsIsRootElementNode) {
            return 'attribute';
        }

        return 'none';
    }

    if (component.wsIsRootElementNode) {
        return 'attribute';
    }

    return 'context';
}

function getProgramBody(node: Ast): string {
    const hasOnlyProgram = (
        node instanceof OptionNode &&
        node.wsValue instanceof ValueNode &&
        node.wsValue.wsData.length === 1 &&
        node.wsValue.wsData[0] instanceof ExpressionNode
    );

    if (hasOnlyProgram) {
        return (((node as OptionNode).wsValue as ValueNode).wsData[0] as ExpressionNode).wsProgram.string;
    }

    return undefined;
}

function toReferenceId(referenceId: number | undefined, program: string): string {
    if (typeof referenceId === 'number') {
        return `${toSafeMultilineComment(program)} ${referenceId}`;
    }

    return undefined;
}

const serviceExpressionContext = {
    shouldEscape: false,
    shouldSanitize: false,
    shouldWrapUndefined: false,
    alwaysTableFunction: true,
    defaultAlternateValue: 'undefined'
};

const ROOT_TEMPLATE_FUNCTION_OFFSET = 2;

declare type TExpressionsRange = [number, number] | [number];

function createRanges(sequence: number[]): TExpressionsRange[] {
    const ranges: TExpressionsRange[] = [];

    let start = -1;
    let end = -1;

    sequence.sort((a, b) => a - b);

    sequence.forEach((element) => {
        if (start === -1) {
            start = element;
            end = element;

            return;
        }

        if (end + 1 === element) {
            end = element;

            return;
        }

        const range: TExpressionsRange = [start];
        if (start !== end) {
            range.push(end);
        }

        ranges.push(range);

        start = element;
        end = element;
    });

    if (start !== -1) {
        const range: TExpressionsRange = [start];
        if (start !== end) {
            range.push(end);
        }

        ranges.push(range);
    }

    return ranges;
}

export default class MarkupGenerator implements IAstVisitor<IContext, string> {

//# region Class properties

    private readonly ecmaScriptGenerator: IECMAScriptGenerator;
    private readonly methodsGenerator: IMethods<string>;
    private readonly generator: IGenerator<TPrimitive, string, string>;
    private readonly entryPointGenerator: IEntryPoint<string, string>;
    private readonly symbolsGenerator: ISymbols;
    private readonly formatter: IFormatter;
    private readonly isWmlMode: boolean;

    private readonly bindGenerator: BindGenerator;
    private readonly eventGenerator: EventGenerator;
    private readonly expressionGenerator: ExpressionGenerator;

    private readonly injections: IInjections;
    private readonly templatesMap: Map<string, number>;
    private readonly templates: ITemplateBody<string>[];
    private readonly expressions: Container<number, string>;
    private readonly internalPrograms: Map<string, IInternalsMeta>;

//# endregion

    /**
     * Initialize new instance of IR template description code generator.
     * @param {IFormatter} formatter Output source code formatter.
     * @param {IECMAScriptGenerator} ecmaScript ECMAScript code generator.
     * @param {IMethods<string>} methods Mustache expression public methods generator.
     * @param {IGenerator<TPrimitive, string, string>} generator Markup nodes public generator.
     * @param {IEntryPoint<string, string>} entryPoint Entry point generator which wraps all parts of template.
     * @param {ISymbols} symbols In-module string literals accessor generator.
     * @param {boolean} isWmlMode Option for compilation of wml template.
     */
    constructor(
        formatter: IFormatter,
        ecmaScript: IECMAScriptGenerator,
        methods: IMethods<string>,
        generator: IGenerator<TPrimitive, string, string>,
        entryPoint: IEntryPoint<string, string>,
        symbols: ISymbols,
        isWmlMode: boolean = true
    ) {
        this.formatter = formatter;
        this.ecmaScriptGenerator = ecmaScript;
        this.methodsGenerator = methods;
        this.generator = generator;
        this.entryPointGenerator = entryPoint;
        this.symbolsGenerator = symbols;
        this.isWmlMode = isWmlMode;

        this.bindGenerator = new BindGenerator(methods, ecmaScript, symbols, MUSTACHE_EXPRESSION_SOURCE);
        this.eventGenerator = new EventGenerator(methods, ecmaScript, symbols, MUSTACHE_EXPRESSION_SOURCE);
        this.expressionGenerator = new ExpressionGenerator(methods, ecmaScript, symbols, MUSTACHE_EXPRESSION_SOURCE);

        this.templatesMap = new Map<string, number>();
        this.injections = { };
        this.templates = [];
        this.expressions = new Container<number, string>();
        this.internalPrograms = new Map<string, IInternalsMeta>();
    }

    /**
     * Generate JavaScript code by template annotation.
     * @param {IAnnotation} annotation Template annotation.
     * @returns {IDescription} Description of future module.
     */
    generate(annotation: IAnnotation): IDescription {
        this.symbolsGenerator.putReactiveProperties(annotation.reactiveProperties);

        const context = new Context({
            children: annotation.children
        });

        annotation.templates.forEach(node => node.accept(this, context));

        this.formatter.enter(ROOT_TEMPLATE_FUNCTION_OFFSET);
        const contents = visitAll(this, annotation.root, context);

        this.templates.push({
            type: 'root',
            contents
        });
        this.templates.forEach((template) => {
            template.body = this.generateTemplateBody(template.contents);
        });
        this.formatter.leave(ROOT_TEMPLATE_FUNCTION_OFFSET);

        this.injections.varStrings = this.symbolsGenerator.toStringsTableDefinition();

        return {
            moduleName: annotation.moduleName,
            injections: this.injections,
            dependencies: annotation.dependencies,
            exports: this.generateExports(annotation, context)
        };
    }

    /**
     * Generate exported fragment of code, where template initializes.
     * @param {IAnnotation} annotation Template annotation.
     * @param {IContext} context Current processing context.
     */
    generateExports(annotation: IAnnotation, context: IContext): string {
        const internalsMeta = this.createInternalsMeta(context);

        return this.entryPointGenerator.generate({
            moduleName: annotation.moduleName,
            dependencies: annotation.dependencies,
            dependenciesStartIndex: this.injections.varTranslate ? 2 : 1,
            templates: this.templates,
            reactiveProperties: this.symbolsGenerator.toReactiveProperties(),
            expressions: this.expressions.values(),
            names: this.generateDescriptionNames(),
            internalsMeta,
        });
    }

//# region Attribute visitors

    /**
     * Visit attribute node.
     * @param {AttributeNode} node Current attribute node.
     * @param {IContext} context Current processing context.
     */
    visitAttribute(node: AttributeNode, context: IContext): string {
        const value = this.visitAll(node.wsValue, context.spawn({
            attributeName: node.wsName,
            defaultAlternateValue: WRAPPED_EMPTY_STRING,
            shouldUnescape: true
        }));

        context.attributes[node.wsName] = value.join(' + ');

        return undefined;
    }

    /**
     * Visit option node.
     * @param {OptionNode} node Current option node.
     * @param {IContext} context Current processing context.
     */
    visitOption(node: OptionNode, context: IContext): string {
        context.options[node.wsName] = node.wsValue.accept(this, context.spawn({
            attributeName: node.wsName,
            defaultAlternateValue: context.isControl ? 'undefined' : WRAPPED_EMPTY_STRING,
            shouldUnescape: true
        }));

        return undefined;
    }

    /**
     * Visit content option node.
     * @param {ContentOptionNode} node Current content option node.
     * @param {IContext} context Current processing context.
     */
    visitContentOption(node: ContentOptionNode, context: IContext): string {
        const offset = this.formatter.offset;
        this.formatter.offset = this.formatter.initialOffset;
        this.formatter.enter(ROOT_TEMPLATE_FUNCTION_OFFSET);

        const contents = visitAll(this, node.wsContent, context.spawn({
            shouldUnescape: false,
            isControl: false
        }));

        const referenceId = this.templates.length;
        this.templates.push({
            type: 'content',
            name: node.wsName,
            contents
        });

        if (node.wsIsStringType) {
            context.options[node.wsName] = this.generator.evalContentOption(referenceId);
        } else {
            const internalsMetaId = this.allocateInternalsMeta(node, context);

            context.options[node.wsName] = this.generator.createContentOption(referenceId, internalsMetaId);
        }

        this.formatter.leave(ROOT_TEMPLATE_FUNCTION_OFFSET);
        this.formatter.offset = offset;

        return undefined;
    }

    /**
     * Visit bind node.
     * @param {BindNode} node Current bind node.
     * @param {IContext} context Current processing context.
     */
    visitBind(node: BindNode, context: IContext): string {
        const name = `${node.wsProperty}Changed`;

        // TODO: от такого попросили избавиться. Пока оставим, не всё сразу.
        const eventName = `on:${name.toLowerCase()}`;

        const meta = this.bindGenerator.generate(node.wsValue, {
            attributeName: node.wsProperty,
            dataSource: MUSTACHE_EXPRESSION_SOURCE.data,

            // Обработчики событий замыкаем и отдаем во внешнее пользование
            allowReducingFunctionParameters: false,
            setterValue: 'value',
            extraParameters: ['value'],

            alwaysTableFunction: context.alwaysTableFunction,

            shouldEscape: context.shouldEscape,
            shouldSanitize: context.shouldSanitize,
            shouldWrapUndefined: context.shouldWrapUndefined,
            allowAllocatingLiterals: true,
            shouldUnescape: true
        });

        if (meta.bindings.length > 0 && typeof context.bindings === 'undefined') {
            throw new Error('внутренняя ошибка генерации кода: bindings не ожилался в узле типа bind');
        }

        if (!context.events.handlers.hasOwnProperty(eventName)) {
            context.events.handlers[eventName] = [];
        }

        // Critical! Контракт: обработчики событий помещаются в начало коллекции!
        context.events.handlers[eventName].unshift(
            this.generateBindHandlerConfiguration(node, meta, context)
        );

        if (typeof context.events.meta === 'undefined') {
            this.putEventHandlerMeta(context);
        }

        const valueMeta = this.compileExpression(node.wsValue, context.spawn({
            attributeName: node.wsProperty,
            defaultAlternateValue: 'undefined',
            shouldUnescape: true
        }));

        if (typeof valueMeta.referenceId === 'number') {
            context.options[node.wsProperty] = this.generator.evalExpression(valueMeta.referenceId, valueMeta.program);

            return undefined;
        }

        context.options[node.wsProperty] = valueMeta.body;

        return undefined;
    }

    /**
     * Visit event handler node.
     * @param {EventNode} node Current event handler node.
     * @param {IContext} context Current processing context.
     */
    visitEvent(node: EventNode, context: IContext): string {
        // TODO: от такого попросили избавиться. Пока оставим, не всё сразу.
        const eventName = `on:${node.wsEvent.toLowerCase()}`;

        const meta = this.eventGenerator.generate(node.wsHandler, {
            attributeName: node.wsEvent,
            dataSource: MUSTACHE_EXPRESSION_SOURCE.self,

            checkChildren: true,
            children: context.children,

            allowComputedObjectProperty: false,
            allowAllocatingLiterals: true,
            shouldUnescape: true
        });

        if (meta.bindings.length > 0 && typeof context.bindings === 'undefined') {
            throw new Error('внутренняя ошибка генерации кода: bindings не ожилался в узле типа event');
        }

        if (!context.events.handlers.hasOwnProperty(eventName)) {
            context.events.handlers[eventName] = [];
        }

        // Critical! Контракт: обработчики событий помещаются в конец коллекции!
        context.events.handlers[eventName].push(
            this.generateEventHandlerConfiguration(node, meta)
        );

        if (typeof context.events.meta === 'undefined') {
            this.putEventHandlerMeta(context);
        }

        return undefined;
    }

//# endregion

//# region HTML visitors

    /**
     * Visit element node.
     * @param {ElementNode} node Current element node.
     * @param {IContext} context Current processing context.
     */
    visitElement(node: ElementNode, context: IContext): string {
        // Необходимо соблюдать структуру интерфейса IElementOptions
        try {
            this.formatter.enter(2);
            const configuration = this.generateElementConfiguration(node, context);
            const children = visitAll(this, node.wsContent, context);
            this.formatter.leave(1);

            return this.generator.createTag(
                node.wsName,
                configuration,
                children
            );
        } catch (error) {
            throw error;
        } finally {
            this.formatter.leave(1);
        }
    }

    /**
     * Visit doctype node.
     * @param {DoctypeNode} node Current doctype node.
     * @param {IContext} _context Current processing context.
     */
    visitDoctype(node: DoctypeNode, _context: IContext): string {
        try {
            this.formatter.enter();

            return this.generator.createDirective(node.wsData);
        } catch (error) {
            throw error;
        } finally {
            this.formatter.leave();
        }
    }

    /**
     * Visit CData section node.
     * @param {CDataNode} node Current CData section node.
     * @param {IContext} _context Current processing context.
     */
    visitCData(node: CDataNode, _context: IContext): string {
        try {
            this.formatter.enter();

            return this.generator.createDirective(node.wsData);
        } catch (error) {
            throw error;
        } finally {
            this.formatter.leave();
        }
    }

    /**
     * Visit instruction node.
     * @param {InstructionNode} node Current instruction node.
     * @param {IContext} _context Current processing context.
     */
    visitInstruction(node: InstructionNode, _context: IContext): string {
        try {
            this.formatter.enter();

            return this.generator.createDirective(node.wsData);
        } catch (error) {
            throw error;
        } finally {
            this.formatter.leave();
        }
    }

    /**
     * Visit comment node.
     * @param {CommentNode} _node Current comment node.
     * @param {IContext} _context Current processing context.
     */
    visitComment(_node: CommentNode, _context: IContext): string {
        return undefined;
    }

//# endregion

//# region Extended component visitors

    /**
     * Visit component node.
     * @param {ComponentNode} node Current component node.
     * @param {IContext} context Current processing context.
     */
    visitComponent(node: ComponentNode, context: IContext): string {
        try {
            const childrenContext = context.spawn({
                isControl: isControlNode(node)
            });

            this.formatter.enter(2);
            const configuration = this.generateComponentConfiguration(node, childrenContext);
            this.formatter.leave(1);

            const method = this.generateComponentMethod(node.wsPath);

            return this.generator.createControl(
                method,
                configuration
            );
        } catch (error) {
            throw error;
        } finally {
            this.formatter.leave(1);
        }
    }

    /**
     * Visit inline template node.
     * @param {InlineTemplateNode} node Current inline template node.
     * @param {IContext} context Current processing context.
     */
    visitInlineTemplate(node: InlineTemplateNode, context: IContext): string {
        try {
            const childrenContext = context.spawn({
                isControl: isControlNode(node)
            });

            this.formatter.enter(2);
            const configuration = this.generateComponentConfiguration(node, childrenContext);
            this.formatter.leave(1);

            return this.generator.createInline(
                this.templatesMap.get(node.wsName),
                node.wsName,
                configuration
            );
        } catch (error) {
            throw error;
        } finally {
            this.formatter.leave(1);
        }
    }

    /**
     * Visit static template node.
     * @param {StaticPartialNode} node Current static template node.
     * @param {IContext} context Current processing context.
     */
    visitStaticPartial(node: StaticPartialNode, context: IContext): string {
        try {
            const childrenContext = context.spawn({
                isControl: isControlNode(node)
            });

            this.formatter.enter(2);
            const configuration = this.generateComponentConfiguration(node, childrenContext);
            this.formatter.leave(1);

            const fullPath = node.wsPath.getFullPath();
            if (isTemplate(fullPath)) {
                // <ws:partial template="wml!A/b/c" />
                // <ws:partial template="tmpl!A/b/c" />
                // <ws:partial template="html!A/b/c" />
                // <ws:partial template="optional!tmpl!A/b/c" />
                return this.generator.createTemplate(
                    wrapString(fullPath),
                    configuration
                );
            }

            if (node.wsPath.hasLogicalPath()) {
                // <ws:partial template="A/B:c.d" />
                return this.generator.createPartial(
                    this.generateComponentMethod(node.wsPath),
                    configuration
                );
            }

            // <ws:partial template="js!A/b/c" />
            // <ws:partial template="A/b/c" />
            // <ws:partial template="optional!wml!A/b/c" />
            // <ws:partial template="optional!html!A/b/c" />
            // <ws:partial template="optional!js!A/b/c" />
            // <ws:partial template="optional!A/b/c" />
            return this.generator.createControl(
                wrapString(`ws:${fullPath.replace(/^js!/, '')}`),
                configuration
            );
        } catch (error) {
            throw error;
        } finally {
            this.formatter.leave(1);
        }
    }

    /**
     * Visit dynamic partial node.
     * @param {DynamicPartialNode} node Current dynamic partial node.
     * @param {IContext} context Current processing context.
     */
    visitDynamicPartial(node: DynamicPartialNode, context: IContext): string {
        try {
            const method = this.compileExpression(node.wsExpression, context.spawn(serviceExpressionContext));
            const childrenContext = context.spawn({
                isControl: isControlNode(node)
            });

            this.formatter.enter(2);
            const configuration = this.generateComponentConfiguration(node, childrenContext);
            this.formatter.leave(1);

            if (typeof method.referenceId === 'number') {
                return this.generator.createPartial(
                    this.generator.evalExpression(method.referenceId, method.program),
                    configuration
                );
            }

            return this.generator.createPartial(
                method.body,
                configuration
            );
        } catch (error) {
            throw error;
        } finally {
            this.formatter.leave(1);
        }
    }

    /**
     * Visit template node.
     * @param {TemplateNode} node Current template node.
     * @param {IContext} context Current processing context.
     */
    visitTemplate(node: TemplateNode, context: IContext): string {
        const offset = this.formatter.offset;
        this.formatter.offset = this.formatter.initialOffset;
        this.formatter.enter(ROOT_TEMPLATE_FUNCTION_OFFSET);

        const contents = visitAll(this, node.wsContent, context);

        const referenceId = this.templates.length;
        this.templates.push({
            type: 'template',
            name: node.wsName,
            contents
        });

        this.templatesMap.set(node.wsName, referenceId);

        this.formatter.leave(ROOT_TEMPLATE_FUNCTION_OFFSET);
        this.formatter.offset = offset;

        return undefined;
    }

//# endregion

//# region Code flow visitors

    /**
     * Visit conditional "if" node.
     * @param {IfNode} node Current conditional "if" node.
     * @param {IContext} context Current processing context.
     */
    visitIf(node: IfNode, context: IContext): string {
        this.formatter.enter(2);
        const contents = this.generateChain(node, context);
        this.formatter.leave(2);

        return contents;
    }

    /**
     * Visit conditional "else" node.
     * @param {ElseNode} node Current conditional "else" node.
     * @param {IContext} context Current processing context.
     */
    visitElse(node: ElseNode, context: IContext): string {
        this.formatter.enter(1);
        const contents = this.generateChain(node, context);
        this.formatter.leave(1);

        return contents;
    }

    /**
     * Visit "for" cycle node.
     * @param {ForNode} node Current "for" cycle node.
     * @param {IContext} context Current processing context.
     */
    visitFor(node: ForNode, context: IContext): string {
        const expressionContext = context.spawn(serviceExpressionContext);
        const init = this.compileExpression(node.wsInit, expressionContext);
        const test = this.compileExpression(node.wsTest, expressionContext);
        const update = this.compileExpression(node.wsUpdate, expressionContext);

        this.formatter.enter();
        const content = visitAll(this, node.wsContent, context);

        const body = this.generateTemplateBody(content);
        this.formatter.leave();

        return this.generator.for(
            node.wsUniqueIndex,
            toReferenceId(init?.referenceId, init?.program),
            toReferenceId(test.referenceId, test.program),
            toReferenceId(update?.referenceId, update?.program),
            body
        );
    }

    /**
     * Visit "foreach" cycle node.
     * @param {ForeachNode} node Current "foreach" cycle node.
     * @param {IContext} context Current processing context.
     */
    visitForeach(node: ForeachNode, context: IContext): string {
        const index = node.wsIndex?.string;
        const iterator = node.wsIterator.string;
        const collection = this.compileExpression(node.wsCollection, context.spawn(serviceExpressionContext));

        this.formatter.enter();
        const content = visitAll(this, node.wsContent, context);

        const body = this.generateTemplateBody(content);
        this.formatter.leave();

        return this.generator.foreach(
            node.wsUniqueIndex,
            [iterator, index],
            toReferenceId(collection.referenceId, collection.program),
            body
        );
    }

//# endregion

//# region Data type visitors

    /**
     * Visit array data node.
     * @param {ArrayNode} node Current array data node.
     * @param {IContext} context Current processing context.
     */
    visitArray(node: ArrayNode, context: IContext): string {
        try {
            this.formatter.enter();
            const elements = this.visitAll(node.wsElements, context);

            return this.formatter.formatArray(elements, 1);
        } catch (error) {
            throw error;
        } finally {
            this.formatter.leave();
        }
    }

    /**
     * Visit boolean data node.
     * @param {BooleanNode} node Current boolean data node.
     * @param {IContext} context Current processing context.
     */
    visitBoolean(node: BooleanNode, context: IContext): string {
        const content = visitAll(this, node.wsData, context.spawn({
            defaultAlternateValue: 'undefined'
        }));

        // Контракт: имеем строго 1 узел
        return toSafeBoolean(content[0]);
    }

    /**
     * Visit function data node.
     * @param {FunctionNode} node Current function data node.
     * @param {IContext} context Current processing context.
     */
    visitFunction(node: FunctionNode, context: IContext): string {
        const name = visitAll(this, node.wsFunction, context.spawn({
            shouldWrapUndefined: true,
            defaultAlternateValue: 'undefined'
        }));
        const options = this.generateObject(node.wsOptions, context.spawn({
            allowBindings: false,
            defaultAlternateValue: 'undefined',
            shouldUnescape: true
        }));

        return this.generator.createFunction(name.join(' + '), options);
    }

    /**
     * Visit number data node.
     * @param {NumberNode} node Current number data node.
     * @param {IContext} context Current processing context.
     */
    visitNumber(node: NumberNode, context: IContext): string {
        const content = visitAll(this, node.wsData, context.spawn({
            defaultAlternateValue: 'undefined'
        }));

        // Контракт: имеем строго 1 узел
        return toSafeNumber(content[0]);
    }

    /**
     * Visit object data node.
     * @param {ObjectNode} node Current object data node.
     * @param {IContext} context Current processing context.
     */
    visitObject(node: ObjectNode, context: IContext): string {
        return this.generateObject(node.wsProperties, context.spawn({
            defaultAlternateValue: 'undefined'
        }));
    }

    /**
     * Visit string data node.
     * @param {StringNode} node Current string data node.
     * @param {IContext} context Current processing context.
     */
    visitString(node: StringNode, context: IContext): string {
        const content = visitAll(this, node.wsData, context.spawn({
            defaultAlternateValue: WRAPPED_EMPTY_STRING
        }));

        return toSafeString(toStringConcatenation(content));
    }

    /**
     * Visit value data node.
     * @param {ValueNode} node Current value data node.
     * @param {IContext} context Current processing context.
     */
    visitValue(node: ValueNode, context: IContext): string {
        const defaultAlternateValue = node.wsData.length > 1 ? WRAPPED_EMPTY_STRING : context.defaultAlternateValue;

        const content = visitAll(this, node.wsData, context.spawn({
            defaultAlternateValue
        }));

        return toStringConcatenation(content);
    }

//# endregion

//# region Extended text visitors

    /**
     * Visit shared text node.
     * @param {TextNode} node Current shared text node.
     * @param {IContext} context Current processing context.
     */
    visitText(node: TextNode, context: IContext): string {
        try {
            this.formatter.enter();

            const content = visitAll(this, node.wsContent, context.spawn({
                defaultAlternateValue: WRAPPED_EMPTY_STRING,

                shouldWrapUndefined: true,
                shouldSanitize: false,
                shouldEscape: true
            }));

            return this.generator.createText(
                content.join(' + '),
                wrapString(node.irKey)
            );
        } catch (error) {
            throw error;
        } finally {
            this.formatter.leave();
        }
    }

    /**
     * Visit text data node.
     * @param {TextDataNode} node Current text data node.
     * @param {IContext} _context Current processing context.
     */
    visitTextData(node: TextDataNode, _context: IContext): string {
        return wrapString(node.wsContent);
    }

    /**
     * Visit mustache expression node.
     * @param {ExpressionNode} node Current mustache expression node.
     * @param {IContext} context Current processing context.
     */
    visitExpression(node: ExpressionNode, context: IContext): string {
        const meta = this.compileExpression(node.wsProgram, context);

        if (typeof meta.body === 'string') {
            return meta.body;
        }

        if (typeof meta.referenceId === 'number') {
            const value = context.shouldWrapUndefined
                ? this.generator.evalExpression2(meta.referenceId, meta.program)
                : this.generator.evalExpression(meta.referenceId, meta.program);

            if (meta.shouldEscape === true) {
                return this.generator.escape(value);
            }

            return value;
        }

        return meta.body;
    }

    /**
     * Visit translation node.
     * @param {TranslationNode} node Current translation node.
     * @param {IContext} _context Current processing context.
     */
    visitTranslation(node: TranslationNode, _context: IContext): string {
        this.injections.varTranslate = true;

        if (node.wsContext) {
            return `${TRANSLATION_FUNCTION}(${wrapString(node.wsText)}, ${wrapString(node.wsContext)})`;
        }

        return `${TRANSLATION_FUNCTION}(${wrapString(node.wsText)})`;
    }

//# endregion

//# region Private methods

    /**
     * Visit collection of properties with generation propertyPath context option.
     * @param {IProperties} properties Collection of properties.
     * @param {IContext} context Current processing context.
     * @private
     */
    private visitAllProperties(properties: IProperties, context: IContext): void {
        for (const name in properties) {
            if (properties.hasOwnProperty(name)) {
                properties[name].accept(this, context.spawn(context.spawn({
                    propertyPath: [...context.propertyPath, name]
                })));
            }
        }
    }

    /**
     * Visit collection of nodes with generation propertyPath context option.
     * @param {Ast[]} nodes Collection of nodes.
     * @param {IContext} context Current processing context.
     * @returns {string[]} Filtered collection of generated code.
     * @private
     */
    private visitAll(nodes: Ast[], context: IContext): string[] {
        return nodes
            .map((node, index) => node.accept(this, context.spawn({
                propertyPath: [...context.propertyPath, `${index}`]
            })))
            .filter(value => value !== undefined);
    }

    /**
     * Generate JavaScript object.
     * @param {IProperties} properties Properties collection of object.
     * @param {IContext} context Current processing context.
     * @private
     */
    private generateObject(properties: IProperties, context: IContext): string {
        try {
            const objectContext = context.spawn({
                options: { }
            });

            this.formatter.enter();
            this.visitAllProperties(properties, objectContext);

            return this.formatter.formatObject(objectContext.options, 1);
        } catch (error) {
            throw error;
        } finally {
            this.formatter.leave();
        }
    }

    /**
     * Generate conditional chain.
     * @param {IfNode | ElseNode} node Conditional if or else node.
     * @param {IContext} context Current processing context.
     * @private
     */
    private generateChain(node: IfNode | ElseNode, context: IContext): string {
        try {
            const meta = this.compileExpression(node.wsTest, context.spawn(serviceExpressionContext));
            const test = typeof meta.referenceId === 'number'
                ? this.generator.evalExpression(meta.referenceId, node.wsTest.string)
                : meta.body;

            const consequent = this.formatter.formatArray(visitAll(this, node.wsConsequent, context), 1);
            const defaultAlternate = this.generator.createText();
            this.formatter.leave();
            const alternate = node.wsAlternate?.accept(this, context) ?? defaultAlternate;
            this.formatter.enter();

            if (node instanceof IfNode) {
                return (
                    test +
                    this.formatter.formatLine(`? ${consequent}`, true) +
                    this.formatter.formatLine(`: ${alternate}`, true)
                );
            }

            if (typeof meta.referenceId === 'number') {
                return (
                    test +
                    this.formatter.formatLine(`? ${consequent}`, true) +
                    this.formatter.formatLine(`: ${alternate}`, true)
                );
            }

            return consequent;
        } catch (error) {
            throw error;
        } finally {
            this.formatter.leave(0);
        }

    }

    /**
     * Compile mustache expression and allocate it in table of expressions.
     * @param {ProgramNode} node Node.
     * @param {IContext} context Current processing context.
     * @private
     */
    private compileExpression(node: ProgramNode, context: IContext): IMustacheInfo {
        if (!node) {
            return { };
        }

        const meta: TExpressionMeta = this.expressionGenerator.generate(node, {
            dataSource: MUSTACHE_EXPRESSION_SOURCE.data,
            allowReducingFunctionParameters: true,
            attributeName: context.propertyPath.join('/'),

            shouldEscape: context.shouldEscape,
            shouldSanitize: context.shouldSanitize,
            shouldWrapUndefined: context.shouldWrapUndefined,
            defaultAlternateValue: context.defaultAlternateValue,

            alwaysTableFunction: context.alwaysTableFunction,
            shouldUnescape: context.shouldUnescape,
            allowAllocatingLiterals: true
        });

        this.updateInjections(meta.flags);

        if (meta.bindings.length > 0) {
            if (typeof context.bindings === 'undefined') {
                throw new Error('внутренняя ошибка генерации кода: bindings не ожидался в узле типа expression');
            }

            context.bindings.push(...meta.bindings);
        }

        if (meta.isTableFunction) {
            node.referenceId = this.allocateExpression(meta.body);

            return {
                referenceId: node.referenceId,
                program: meta.program,
                shouldEscape: meta.shouldEscape
            };
        }

        return {
            body: meta.body,
            program: meta.program,
            shouldEscape: meta.shouldEscape
        };
    }

    /**
     * Generate evaluation of stored mustache expression by its meta information.
     * @param {IMustacheMeta<string>} expression Mustache expression meta information.
     * @returns {string} Generated code of mustache expression evaluation or its body literal.
     * @private
     */
    private generatePartialExpression(expression: IMustacheMeta<string>): string {
        if (expression.isTableFunction) {
            this.updateInjections(expression.flags);

            const referenceId = this.allocateExpression(expression.body);

            return this.generator.evalExpression(referenceId, expression.program);
        }

        return expression.body;
    }

    /**
     * Generate bindings configurations of bind and mutable decorators.
     * @param {IBindingConfiguration[]} bindings Collection of prepared configurations.
     * @returns {string} Generated code.
     * @private
     */
    private generateBindings(bindings: IBindingConfiguration[]): string {
        return this.formatter.formatArray(bindings.map(binding => this.formatter.formatObject([
            {
                name: 'fieldName',
                value: toSafeString(this.generatePartialExpression(binding.fieldName))
            },
            {
                name: 'propName',
                value: wrapString(binding.propName)
            },
            {
                name: 'propPath',
                value: wrapArray(binding.propPath.map(wrapString))
            },
            {
                name: 'fullPropName',
                value: wrapString(binding.fullPropName)
            },
            {
                name: 'propPathStr',
                value: wrapString(binding.propPathStr)
            },
            {
                name: 'oneWay',
                value: binding.oneWay
            },
            {
                name: 'direction',
                value: binding.direction?.isTableFunction
                    ? this.generatePartialExpression(binding.direction)
                    : binding.direction.body
            },
            {
                name: 'bindNonExistent',
                value: binding.bindNonExistent
            }], 4)
        ), 3);
    }

    /**
     * Allocate expression in table if the same does not exist.
     * @param {string} value Generated code of mustache expression.
     * @returns {number} Returns unique number of allocated mustache expression.
     * @private
     */
    private allocateExpression(value: string): number {
        if (this.expressions.hasValue(value)) {
            // Переиспользуем существующие функции, экономим место в таблице выражений.
            return this.expressions.getByValue(value).key;
        }

        const key = this.expressions.size;

        this.expressions.add({ key, value });

        return key;
    }

    /**
     * Generate code of event handlers of element or component node.
     * @param {IEventHandlers} events Collection of event handlers.
     * @private
     */
    private generateEventHandlers(events: IEventHandlers): string {
        if (typeof events.meta === 'string') {
            return this.formatter.formatObject({
                ...events.handlers,

                // Договоренность: объект meta помещаем в самый конец объекта
                meta: events.meta
            }, 2);
        }

        return this.formatter.formatObject(events.handlers, 2);
    }

    /**
     * Generate meta information object for events.
     * @param {IContext} context Current processing context which has events.
     * @private
     */
    private putEventHandlerMeta(context: IContext): void {
        if (typeof this.injections.funcDefaultContextGetter !== 'string') {
            this.injections.funcDefaultContextGetter = this.ecmaScriptGenerator.toFunction(
                'return this;',
                DEFAULT_CONTEXT_GETTER_FUNCTION
            );
        }

        const defaultEventHandlerGetter = this.ecmaScriptGenerator.toAnonymousFunction(
            `return ${this.methodsGenerator.getter('this', ['handlerName'])};`,
            [...MUSTACHE_EXPRESSION_PARAMETERS, 'handlerName']
        );

        const handlerId = this.allocateExpression(defaultEventHandlerGetter);

        context.events.meta = this.formatter.formatObject([
            {
                name: 'isControl',
                value: context.isControl
            },
            {
                name: 'context',
                value: DEFAULT_CONTEXT_GETTER_FUNCTION
            },
            {
                name: 'handler',
                value: this.generator.closeExpression(handlerId, 'defaultEventHandlerGetter')
            }
        ], 3);
    }

    /**
     * Generate event handler for binding.
     * @param {BindNode} node Current bind attribute node.
     * @param {TBindMeta} meta Event handler meta information.
     * @param {IContext} context Current processing context.
     * @private
     */
    private generateBindHandlerConfiguration(node: BindNode, meta: TBindMeta, context: IContext): string {
        this.updateInjections(meta.flags);

        const handlerId = this.allocateExpression(meta.body);

        const configuration = [
            {
                name: 'value',
                value: wrapString(`${node.wsProperty}Changed`)
            },
            {
                name: 'originalName',
                value: wrapString(`bind:${node.wsProperty}`)
            },
            {
                name: 'viewController',
                value: `context.${Contract.Context.viewController}`
            },
            {
                name: 'data',
                value: `context.${Contract.Context.data}`
            },
            {
                name: 'handler',
                // Critical!
                //   Обработчик вызывается с параметрами (data, value)
                value: this.generator.closeBindExpression(handlerId, meta.program)
            },
            {
                name: 'isControl',
                value: context.isControl
            },
            {
                name: 'bindValue',
                value: wrapString(node.wsValue.string)
            }
        ];

        return this.formatter.formatObject(configuration, 3);
    }

    /**
     * Generate event handler.
     * @param {EventNode} node Current event attribute node.
     * @param {TEventMeta} meta Event handler meta information.
     * @private
     */
    private generateEventHandlerConfiguration(node: EventNode, meta: TEventMeta): string {
        this.updateInjections(meta.flags);

        const configuration = [
            {
                name: 'value',
                value: this.symbolsGenerator.access(meta.handlerName)
            },
            {
                name: 'originalName',
                value: this.symbolsGenerator.access(node.wsEvent)
            },
            {
                name: 'viewController',
                value: `context.${Contract.Context.viewController}`
            }
        ];

        if (meta.args.length > 0) {
            configuration.push({
                name: 'args',
                value: wrapArray(meta.args.map((arg) => {
                    this.updateInjections(arg.flags);

                    if (arg.isTableFunction) {
                        const referenceId = this.allocateExpression(arg.body);

                        return this.generator.evalExpression(referenceId, arg.program);
                    }

                    return arg.body;
                }))
            });
        }

        if (meta.contextContent !== 'this') {
            const contextId = this.allocateExpression(meta.context);
            const bodyId = this.allocateExpression(meta.body);

            configuration.push(
                {
                    name: 'context',
                    value: this.generator.closeExpression(contextId)
                },
                {
                    name: 'handler',
                    value: this.generator.closeExpression(bodyId)
                }
            );
        }

        return this.formatter.formatObject(configuration, 3);
    }

    /**
     * Generate attributes and event handlers for base node.
     * @param {BaseHtmlElement} node Current processing base node.
     * @param {IContext} context Current processing context.
     * @private
     */
    private generateBaseConfiguration(node: BaseHtmlElement, context: IContext): IObjectProperty[] {
        const configuration: IObjectProperty[] = [];

        this.visitAllProperties(node.wsAttributes, context);
        this.visitAllProperties(node.wsEvents, context);

        configuration.push({
            name: Contract.ElementConfiguration.key,
            comment: 'key',
            value: wrapString(node.irKey)
        });

        return configuration;
    }

    /**
     * Generate attributes collection for element or component node.
     * @param {IContext} context Current processing context.
     * @private
     */
    private generateAttributes(context: IContext): IObjectProperty {
        const attributes = this.formatter.formatObject(context.attributes, 2);

        if (attributes !== '{ }') {
            return {
                name: Contract.ElementConfiguration.attributes,
                comment: 'attributes',
                value: attributes
            };
        }

        return undefined;
    }

    /**
     * Generate event handlers collection for element or component node.
     * @param {IContext} context Current processing context.
     * @param {boolean} wrapWithWindowUndefined Should calculate event handlers only on client size.
     * @private
     */
    private generateEvents(context: IContext, wrapWithWindowUndefined: boolean): IObjectProperty {
        const events = this.generateEventHandlers(context.events);

        if (events !== '{ }') {
            return {
                name: Contract.ElementConfiguration.events,
                comment: 'events',

                value: (
                    wrapWithWindowUndefined
                        ? this.generateWithWindowUndefined('{ }', events)
                        : events
                )
            };
        }

        return undefined;
    }

    /**
     * Generate element options for creating element node.
     * @param {ElementNode} node Processing element node.
     * @param {IContext} context Current processing context.
     * @returns {string} Object with attributes, event handlers and configuration for element node.
     * @private
     */
    private generateElementConfiguration(node: ElementNode, context: IContext): string {
        const elementContext = context.spawn({
            attributes: { },
            events: {
                handlers: { },
                meta: undefined
            }
        });
        const configuration = this.generateBaseConfiguration(node, elementContext.spawn({
            shouldWrapUndefined: true,
            shouldEscape: true
        }));

        const attributes = this.generateAttributes(elementContext);
        if (attributes) {
            configuration.push(attributes);
        }

        // Формируем набор обработчиков событий, но вычисляем эти данные только на клиенте
        const events = this.generateEvents(elementContext, true);
        if (events) {
            configuration.push(events);
        }

        if (node.wsIsRootElementNode) {
            configuration.push({
                name: Contract.ElementConfiguration.isRootElementNode,
                comment: 'isRootElementNode',
                value: true
            });
        }

        if (node.wsIsContainerNode) {
            configuration.push({
                name: Contract.ElementConfiguration.isContainerNode,
                comment: 'isContainerNode',
                value: true
            });
        }

        return this.formatter.formatObject(configuration, 1);
    }

    /**
     * Generate component options for creating component node.
     * @param {BaseWasabyElement} node Processing component node.
     * @param {IContext} context Current processing context.
     * @returns {string} Object with attributes, event handlers, options and configuration for component node.
     * @private
     */
    private generateComponentConfiguration(node: BaseWasabyElement, context: IContext): string {
        const componentContext = context.spawn({
            propertyPath: [],
            attributes: { },
            events: {
                handlers: { },
                meta: undefined
            },
            options: { },
            bindings: []
        });

        const configuration = this.generateBaseConfiguration(node, componentContext.spawn({
            shouldWrapUndefined: false,
            shouldEscape: true
        }));

        this.formatter.enter();
        this.visitAllProperties(node.wsOptions, componentContext.spawn({
            allowBindings: true,

            shouldEscape: false,
            shouldSanitize: false,
            shouldWrapUndefined: false
        }));
        this.visitAllProperties(node.wsContents, componentContext);
        this.formatter.leave();

        const blockOptionNames = getBlockOptionNames(node);

        let compositeAttributes;
        if (componentContext.options.hasOwnProperty('attributes')) {
            compositeAttributes = componentContext.options.attributes;

            delete componentContext.options.attributes;
        }

        const attributes = this.generateAttributes(componentContext);
        if (attributes) {
            configuration.push(attributes);
        }

        // Формируем набор обработчиков событий, вычисляем эти данные всегда, кроме inline шаблонов
        const wrapWithWindowUndefined = node instanceof InlineTemplateNode;
        const events = this.generateEvents(componentContext, wrapWithWindowUndefined);
        if (events) {
            configuration.push(events);
        }

        const escape = (blockOptionNames.length > 0 || Object.keys(node.wsContents).length > 0);
        const options = this.generateOptions(node, componentContext, escape);
        if (options) {
            configuration.push(options);
        }

        if (compositeAttributes) {
            configuration.push({
                name: Contract.ComponentConfiguration.compositeAttributes,
                comment: 'compositeAttributes',
                value: compositeAttributes
            });
        }

        if (node.wsIsRootComponentNode) {
            configuration.push({
                name: Contract.ComponentConfiguration.isRootComponentNode,
                comment: 'isRootTag',
                value: true
            });
        }

        if (node instanceof InlineTemplateNode) {
            if (node.wsIsRootElementNode) {
                configuration.push({
                    name: Contract.ComponentConfiguration.isRootElementNode,
                    comment: 'isRootElementNode',
                    value: true
                });
            }
        }

        const mergeType = getComponentMergeType(node);
        if (mergeType !== Contract.mergeTypeDefaultValue) {
            configuration.push({
                name: Contract.ComponentConfiguration.mergeType,
                comment: 'mergeType',
                value: wrapString(mergeType)
            });
        }

        if (blockOptionNames.length > 0) {
            configuration.push({
                name: Contract.ComponentConfiguration.blockOptionNames,
                comment: 'blockOptionNames',
                value: wrapArray(blockOptionNames.map(wrapString))
            });
        }

        if (node instanceof InlineTemplateNode) {
            if (node.wsPassRef) {
                configuration.push({
                    name: Contract.ComponentConfiguration.refForContainer,
                    comment: 'refForContainer',
                    value: true
                });
            }
        }

        if (node.wsIsContainerNode) {
            configuration.push({
                name: Contract.ComponentConfiguration.isContainerNode,
                comment: 'isContainerNode',
                value: true
            });
        }

        const internalsMetaId = this.allocateInternalsMeta(node, componentContext);
        if (typeof internalsMetaId === 'number') {
            configuration.push({
                name: Contract.ComponentConfiguration.internalsMetaId,
                comment: 'internalsMetaId',
                value: internalsMetaId
            });
        }

        return this.formatter.formatObject(configuration, 1);
    }

    /**
     * Generate options collection for component node.
     * @param {BaseWasabyElement} node Processing component node.
     * @param {IContext} context Current processing context.
     * @param {boolean} escape Should append option 'esc' to collection.
     * @private
     */
    private generateOptions(node: BaseWasabyElement, context: IContext, escape: boolean): IObjectProperty {
        let optionScope;
        let optionScopeValue;
        if (context.options.hasOwnProperty('scope') && node.wsOptions.scope.hasFlag(Flags.UNPACKED)) {
            optionScopeValue = getProgramBody(node.wsOptions.scope);

            // FIXME: такого быть не должно. Нужно в traverse валидировать опцию и ругаться
            //  Это означает, что в опцию передали литерал, который отбрасывался
            if (typeof optionScopeValue !== 'boolean' && typeof optionScopeValue !== 'number') {
                // Обрабатываем выражение, null и undefined
                optionScope = context.options.scope;
            }

            delete context.options.scope;
        }

        const options = Object.keys(context.options).map((name) => ({
            name,
            value: context.options[name]
        }));

        if (context.bindings.length > 0) {
            // Договоренность: объект bindings помещаем в самое начало объекта
            options.unshift({
                name: 'bindings',
                value: this.generateBindings(context.bindings)
            });
        }

        if (escape) {
            // FIXME: выглядит как ненужная опция (использований не увидел).
            //  Истинно, только если опции заданы через теги.
            //  Уточнить и в случае ненадобности удалить.
            if (!context.options.hasOwnProperty('esc')) {
                options.unshift({
                    name: 'esc',
                    value: false
                });
            }
        }

        if (options.length > 0 || typeof optionScope !== 'undefined') {
            let optionsObject = this.formatter.formatObject(options, 2);

            if (typeof optionScope !== 'undefined') {
                if (optionScopeValue === DEFAULT_SCOPE_IDENTIFIER) {
                    optionsObject = this.generator.evalDefaultScope(optionsObject);
                } else if (optionScopeValue === '_options') {
                    optionsObject = this.generator.evalOptionsScope(optionsObject, optionScope);
                } else {
                    optionsObject = this.generator.evalScope(optionsObject, optionScope);
                }
            }

            return {
                name: Contract.ComponentConfiguration.options,
                comment: 'options',
                value: optionsObject
            };
        }

        return undefined;
    }

    /**
     * Generate template body function with its markup body.
     * @param {string} body Markup body.
     */
    private generateTemplateBody(body: string[]): string {
        return this.ecmaScriptGenerator.toArrowExpression(
            this.formatter.formatArray(body, 1),
            TEMPLATE_FUNCTION_PARAMETERS
        );
    }

    /**
     * Generate method name of component node.
     * @param {IPath} path Path representation of component name.
     * @private
     */
    private generateComponentMethod(path: IPath): string {
        if (path.hasLogicalPath()) {
            // <Library:Module[.Module]*>

            return this.formatter.formatObject([
                {
                    name: 'library',
                    value: wrapString(path.getFullPhysicalPath())
                },
                {
                    name: 'module',
                    value: wrapArray(path.getLogicalPath().map(wrapString))
                }
            ], 2);
        }

        // <Module.Component[.Component]*>
        return wrapString(`ws:${path.getFullPath()}`);
    }

    /**
     * Update injections meta information.
     * @param {IFlags} flags Description of processed mustache expression.
     * @private
     */
    private updateInjections(flags: IFlags): void {
        this.injections.funcDebug = this.injections.funcDebug || flags.hasDebugReference;
        this.injections.varTranslate = this.injections.varTranslate || flags.hasTranslationReference;
    }

    /**
     * Generate construction like typeof window === "undefined" ? (consequent) : (alternate).
     * @param {string} consequent Expression to calculate on server side.
     * @param {string} alternate Expression to calculate on client side.
     * @returns {string} Generated code of construction with isWindowUndefined variable.
     * @private
     */
    private generateWithWindowUndefined(consequent: string, alternate: string): string {
        if (this.isWmlMode) {
            this.injections.varIsWindowUndefined = true;

            return `${IS_WINDOW_UNDEFINED_IDENTIFIER} ? ${consequent} : ${alternate}`;
        }

        return `typeof window === "undefined" ? ${consequent} : ${alternate}`;
    }

    /**
     * Allocate internals meta in table.
     * @param {Ast} node Node with container.
     * @param {IContext} context Current processing context.
     * @private
     */
    private allocateInternalsMeta(node: Ast, context: IContext): number {
        const programs = (node.wsContainer as ProgramsContainer).getInternalsMeta();

        if (programs.length === 0) {
            return undefined;
        }

        const hash = wrapArray(Array.from(new Set(programs.map((program) => {
            if (program.referenceId !== -1) {
                return program.referenceId;
            }

            return program.string;
        }))));

        // Структура дерева может быть задана в такой конфигурации,
        // что записи в таблице могут быть идентичными.
        // Генерируем только уникальные записи.
        if (this.internalPrograms.has(hash)) {
            return this.internalPrograms.get(hash).id;
        }

        const id = this.internalPrograms.size;

        this.internalPrograms.set(hash, {
            programs,
            id
        });

        return id;
    }

    /**
     * Generate table of internal expressions.
     * @param {IContext} context Current processing context.
     * @private
     */
    private createInternalsMeta(context: IContext): string[] {
        const internalsMeta: string[] = [];

        this.internalPrograms.forEach(({ programs }) => {
            const sequence = new Set<number>();

            programs.forEach((program) => {
                if (program.referenceId !== -1) {
                    sequence.add(program.referenceId);

                    return;
                }

                const mustacheInfo = this.compileExpression(program, context.spawn({
                    alwaysTableFunction: true
                }));

                sequence.add(mustacheInfo.referenceId);
            });

            internalsMeta.push(
                wrapArray(createRanges(Array.from(sequence)).map(range => wrapArray(range)))
            );
        });

        return internalsMeta;
    }

    /**
     * Generate internal names for tmpl serialization purposes.
     * @private
     */
    private generateDescriptionNames(): string {
        const names = [];

        if (this.isWmlMode) {
            return undefined;
        }

        if (this.injections.funcDefaultContextGetter) {
            names.push({
                name: DEFAULT_CONTEXT_GETTER_FUNCTION,
                value: `${DEFAULT_CONTEXT_GETTER_FUNCTION}.name`
            });
        }

        if (this.injections.varTranslate) {
            names.push({
                name: TRANSLATION_FUNCTION,
                value: `${TRANSLATION_FUNCTION}.name`
            });
        }

        if (this.injections.funcDebug) {
            names.push({
                name: DEBUG_FUNCTION,
                value: `${DEBUG_FUNCTION}.name`
            });
        }

        if (names.length > 0) {
            return this.formatter.formatObject(names, 2);
        }

        return undefined;
    }
//# endregion
}
