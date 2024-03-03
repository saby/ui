/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * @author Krylov M.A.
 *
 * Модуль аннотации типизированного AST дерева шаблона.
 * На данном этапе компиляции необходимо снабдить узлы дополнительной информацией,
 * скорректировав структуру самого дерева.
 */

import type {
    ArrayNode,
    Ast,
    AttributeNode,
    BaseHtmlElement,
    BaseWasabyElement,
    BooleanNode,
    CDataNode,
    CommentNode,
    ContentOptionNode,
    DoctypeNode,
    EventNode,
    FunctionNode,
    IAstVisitor,
    IAttributes,
    IContents,
    IEvents,
    InstructionNode,
    IObjectProperties,
    IOptions,
    NumberNode,
    ObjectNode,
    OptionNode,
    TContent,
    TData,
    TemplateNode,
    TextNode,
    TranslationNode,
    TText,
} from './Ast';

import type { IErrorHandler } from '../utils/ErrorHandler';

import {
    BindNode,
    ComponentNode,
    DynamicPartialNode,
    ElementNode,
    ElseNode,
    ExpressionNode,
    Flags,
    ForeachNode,
    ForNode,
    IfNode,
    INavigationContext,
    InlineTemplateNode,
    StaticPartialNode,
    StringNode,
    TextDataNode,
    ValueNode,
    visitAllProperties,
    navigateAll,
    navigateAllProperties
} from './Ast';

import { ContainerType, ProgramsContainer, ProgramType } from './IRInternal';

/**
 * Abstract node types.
 */
enum AbstractNodeType {
    /**
     * Flag for root node which can be node of any type.
     */
    ROOT,

    /**
     * Flag for component, ws:template, ws:partial nodes.
     */
    COMPONENT,

    /**
     * Flag for content option nodes.
     */
    COMPONENT_OPTION,

    /**
     * Flag for element nodes.
     */
    ELEMENT,

    /**
     * Flag for data type nodes.
     */
    DATA_TYPE_DIRECTIVE,

    /**
     * Flag for directive nodes.
     */
    DIRECTIVE,

    /**
     * Flag for attribute nodes.
     */
    ATTRIBUTE,

    /**
     * Flag for option nodes.
     */
    OPTION,

    /**
     * Flag for text nodes.
     */
    TEXT,
}

function getInstanceClassName(instance: unknown): string {
    return instance?.constructor?.name ?? 'unknown';
}

/**
 * Set root element node flag.
 * @param {Ast[]} nodes Collection of nodes of abstract syntax tree.
 */
function setRootElementNodeFlag(nodes: Ast[]): void {
    nodes.forEach((node) => {
        if (node instanceof IfNode || node instanceof ElseNode) {
            setRootElementNodeFlag(node.wsConsequent);

            if (node.wsAlternate) {
                setRootElementNodeFlag([
                    node.wsAlternate
                ]);
            }

            return;
        }

        node.wsIsRootElementNode = true;
    });
}

/**
 * Set root component node flag.
 * @param {Ast[]} nodes Collection of nodes of abstract syntax tree.
 */
function setRootComponentNodeFlag(nodes: Ast[]): void {
    nodes.forEach((node) => {
        if (node instanceof IfNode || node instanceof ElseNode) {
            setRootComponentNodeFlag(node.wsConsequent);

            if (node.wsAlternate) {
                setRootComponentNodeFlag([
                    node.wsAlternate
                ]);
            }

            return;
        }

        if (node instanceof ForNode || node instanceof ForeachNode) {
            setRootComponentNodeFlag(node.wsContent);

            return;
        }

        node.wsIsRootComponentNode = true;
    });
}

/**
 * Set flags for all root element nodes of component.
 * @param nodes {Ast[]} Collection of nodes of abstract syntax tree.
 */
function setContainerNodeFlag(nodes: Ast[]): void {
    nodes.forEach((node) => {
        const isContainerNode = (
            node instanceof ElementNode ||
            node instanceof ComponentNode ||
            node instanceof DynamicPartialNode ||
            node instanceof StaticPartialNode ||
            node instanceof InlineTemplateNode
        );

        if (isContainerNode) {
            node.wsIsContainerNode = true;

            return;
        }

        if (node instanceof IfNode || node instanceof ElseNode) {
            setContainerNodeFlag(node.wsConsequent);

            if (node.wsAlternate) {
                setContainerNodeFlag([node.wsAlternate]);
            }
        }
    });
}

/**
 * Set flags for inline template nodes to pass ref object.
 */
function setPassRefFlag(nodes: Ast[]): void {
    nodes.forEach((node) => {
        if (node instanceof InlineTemplateNode) {
            node.wsPassRef = true;

            return;
        }

        if (node instanceof IfNode || node instanceof ElseNode) {
            setPassRefFlag(node.wsConsequent);

            if (node.wsAlternate) {
                setPassRefFlag([node.wsAlternate]);
            }

            return;
        }

        if (node instanceof ForNode || node instanceof ForeachNode) {
            setPassRefFlag(node.wsContent);
        }
    });
}

/**
 * Get string value from text.
 * @param value {TText[]} Collection of text nodes.
 * @return {string | null} Returns string in case of collection has single text node.
 */
function getStringValueFromText(value: TText[]): string | null {
    if (value.length !== 1) {
        return null;
    }

    const valueNode = value[0];
    if (!(valueNode instanceof TextDataNode)) {
        return null;
    }

    return valueNode.wsContent;
}

/**
 * Get element name.
 * @param element {BaseHtmlElement} Element node.
 * @return {string | null} Returns element name if it exists.
 */
function getElementName(element: BaseHtmlElement): string | null {
    if (element.wsAttributes.hasOwnProperty('attr:name')) {
        return getStringValueFromText(element.wsAttributes['attr:name'].wsValue);
    }

    if (element.wsAttributes.hasOwnProperty('name')) {
        return getStringValueFromText(element.wsAttributes.name.wsValue);
    }

    return null;
}

/**
 * Get string value from string or value node.
 * @param value {TData} Data node.
 * @return {string | null} Returns string value for string or value node.
 */
function getStringValueFromData(value: TData): string | null {
    if (value instanceof ValueNode) {
        return getStringValueFromText(value.wsData);
    }

    if (value instanceof StringNode) {
        return getStringValueFromText(value.wsData);
    }

    return null;
}

/**
 * Get component name.
 * @param component {BaseWasabyElement} Component node.
 * @return {string | null} Returns component name if it exists.
 */
function getComponentName(component: BaseWasabyElement): string | null {
    const elementName = getElementName(component);

    if (elementName !== null) {
        return elementName;
    }

    if (component.wsOptions.hasOwnProperty('attr:name')) {
        return getStringValueFromData(component.wsOptions['attr:name'].wsValue);
    }

    if (component.wsOptions.hasOwnProperty('name')) {
        return getStringValueFromData(component.wsOptions.name.wsValue);
    }

    return null;
}

/**
 * Get processing program type that depends on type of processing abstract syntax node.
 * @param {AbstractNodeType[]} stack Stack of types of processing abstract syntax node.
 * @param {string} attributeName Processing attribute name.
 * @returns {ProgramType} Actual type of processing mustache expression.
 */
function getProgramType(stack: AbstractNodeType[], attributeName: string): ProgramType {
    let isInComponent = false;
    let isInAttribute = false;
    let isInOption = false;

    for (let index = stack.length - 1; index > -1; --index) {
        if (stack[index] === AbstractNodeType.DATA_TYPE_DIRECTIVE) {
            continue;
        } else if (stack[index] === AbstractNodeType.COMPONENT) {
            isInComponent = true;
        } else if (stack[index] === AbstractNodeType.ATTRIBUTE) {
            isInAttribute = true;
            continue;
        } else if (stack[index] === AbstractNodeType.OPTION) {
            isInOption = true;
            continue;
        }

        break;
    }

    if (isInComponent) {
        if (isInAttribute) {
            return ProgramType.ATTRIBUTE;
        }

        if (isInOption) {
            if (attributeName === 'scope') {
                return ProgramType.SCOPE;
            }

            return ProgramType.OPTION;
        }
    }

    return ProgramType.REGULAR;
}

/**
 * Collect name of identifiers in inline template node from options which names equal to values.
 * @param node {InlineTemplateNode} Inline template node.
 * @returns {string[]} Collection of identifiers.
 */
function collectInlineTemplateIdentifiers(node: InlineTemplateNode): string[] {
    const identifiers = [];
    for (const name in node.wsEvents) {
        if (node.wsEvents.hasOwnProperty(name)) {
            const event = node.wsEvents[name];
            if (event instanceof BindNode) {
                // bind:option="option" is simple alias and deep usages exist in current scope
                if (event.wsProperty !== event.wsValue.string) {
                    identifiers.push(event.wsProperty);
                }
            }
        }
    }

    for (const name in node.wsOptions) {
        if (node.wsOptions.hasOwnProperty(name)) {
            const option = node.wsOptions[name];
            if (
                // eslint-disable-next-line no-bitwise
                option.hasFlag(Flags.TYPE_CASTED | Flags.UNPACKED) &&
                option.wsValue instanceof ValueNode
            ) {
                const value = option.wsValue;
                const valuePart = value.wsData[0];
                if (value.wsData.length === 1 && valuePart instanceof ExpressionNode) {
                    if (option.wsName === valuePart.wsProgram.string) {
                        // Skip only case option="{{ option }}"
                        continue;
                    }
                }
            }

            identifiers.push(option.wsName);
        }
    }

    return identifiers;
}

interface IContext extends INavigationContext {
    attributeName?: string;
    container: ProgramsContainer;
}

export interface IAnnotation {
    moduleName: string;
    root: Ast[];
    children: string[];
    dependencies: string[];
    container: ProgramsContainer;
    reactiveProperties: string[];
    templates: TemplateNode[];
}

function validateScopeOption(node: OptionNode): void {
    if (node.wsValue instanceof ValueNode) {
        // FIXME: Так было в старой кодогенерации. Это ошибка!
        //  Необходимо поправить ошибки в шаблонах и включить проверку на этапе traverse.
        node.wsValue.wsData = [node.wsValue.wsData[0]];
    }
}

function validateAttributesOption(node: OptionNode): void {
    if (node.wsValue instanceof ValueNode) {
        // FIXME: Так было в старой кодогенерации. Это ошибка!
        //  Необходимо поправить ошибки в шаблонах и включить проверку на этапе traverse.
        node.wsValue.wsData = [node.wsValue.wsData[0]];
    }
}

function validateBinds(component: BaseWasabyElement): void {
    // FIXME: В старой кодогенерации при наличии bind:option и option одновременно на узле
    //  приоритет отдавался узлу bind. Нужно писать предупреждение!
    //  Удалим узел option из коллекции, потому что это приведет к ошибке неразмещения выражения
    //  при формировании internal.
    Object.values(component.wsEvents).forEach((node) => {
        if (!(node instanceof BindNode)) {
            return;
        }

        if (component.wsOptions.hasOwnProperty(node.wsProperty)) {
            delete component.wsOptions[node.wsProperty];
        }
    });
}

class IRAnnotator implements IAstVisitor<IContext, Ast> {

    /**
     * Error handler.
     */
    // @ts-ignore
    private readonly errorHandler: IErrorHandler;

    /**
     * Stack of visiting nodes for determining the context.
     * @private
     */
    private readonly stack: AbstractNodeType[];

    private children: string[];
    private templateDefinitions: Record<string, TemplateNode>;
    private inlineTemplates: InlineTemplateNode[];
    private dependencies: string[];

    private cycleCounter: number;

    constructor(errorHandler: IErrorHandler) {
        this.errorHandler = errorHandler;
        this.stack = [];
    }

    /**
     * Process nodes and generate IR table for code generation.
     * @param {Ast[]} nodes Collection of nodes.
     * @param {string} moduleName Template module name.
     */
    generate(nodes: Ast[], moduleName: string): IAnnotation {
        const container = new ProgramsContainer(ContainerType.GLOBAL);

        this.children = [];
        this.templateDefinitions = { };
        this.inlineTemplates = [];
        this.dependencies = [];

        this.cycleCounter = 0;

        // Critical! При аннотации узлы могут перемещаться или вовсе выноситься из дерева.
        //  Необходимо флаги проставить до начала их обработки.
        setContainerNodeFlag(nodes);
        setRootElementNodeFlag(nodes);
        setPassRefFlag(nodes);

        this.stack.push(AbstractNodeType.ROOT);
        const root = navigateAll<IContext, Ast>(this, nodes, {
            container,
            key: ''
        });
        this.stack.pop();



        if (this.stack.length !== 0) {
            throw new Error('внутренняя ошибка аннотации: процесс завершился не в терминальном состоянии');
        }

        return {
            moduleName,
            root,
            container,
            dependencies: this.dependencies,
            children: this.children,
            reactiveProperties: container.getReactiveIdentifiers(),
            templates: this.getTemplates()
        };
    }

    /**
     * Visit attribute node.
     * @param node {AttributeNode} Concrete attribute node.
     * @param context {IContext} Concrete visitor context.
     */
    visitAttribute(node: AttributeNode, context: IContext): Ast {
        const childContext: IContext = {
            ...context,
            attributeName: node.wsName
        };

        this.stack.push(AbstractNodeType.ATTRIBUTE);
        node.wsValue = navigateAll<IContext, Ast>(this, node.wsValue, childContext) as TText[];
        this.stack.pop();

        return node;
    }

    /**
     * Visit option node.
     * @param node {OptionNode} Concrete option node.
     * @param context {IContext} Concrete visitor context.
     */
    visitOption(node: OptionNode, context: IContext): Ast {
        const childContext: IContext = {
            ...context,
            attributeName: node.wsName
        };

        this.stack.push(AbstractNodeType.OPTION);
        // Сделано для генерации совместимых ключей
        if (node.hasFlag(Flags.TYPE_CASTED)) {
            node.wsValue = node.wsValue.accept(this, childContext) as TData;
        } else {
            node.wsValue = navigateAll<IContext, Ast>(this, [node.wsValue], childContext)[0] as TData;
        }
        this.stack.pop();

        node.irKey = context.key;

        return node;
    }

    /**
     * Visit content option node.
     * @param node {ContentOptionNode} Concrete content option node.
     * @param context {IContext} Concrete visitor context.
     */
    visitContentOption(node: ContentOptionNode, context: IContext): Ast {
        const container = context.container.spawn(ContainerType.CONTENT_OPTION);
        const childContext: IContext = {
            ...context,
            container
        };

        container.registerIdentifier(node.wsName);

        // Critical! При аннотации узлы могут перемещаться или вовсе выноситься из дерева.
        //  Необходимо флаги проставить до начала их обработки.
        setRootComponentNodeFlag(node.wsContent);
        setRootElementNodeFlag(node.wsContent);
        setPassRefFlag(node.wsContent);

        this.stack.push(AbstractNodeType.COMPONENT_OPTION);
        node.wsContent = navigateAll<IContext, Ast>(this, node.wsContent, childContext) as TContent[];
        this.stack.pop();

        node.irKey = context.key;
        node.wsContainer = container;

        return node;
    }

    /**
     * Visit bind node.
     * @param node {BindNode} Concrete bind node.
     * @param context {IContext} Concrete visitor context.
     */
    visitBind(node: BindNode, context: IContext): Ast {
        context.container.registerProgram(node.wsValue, ProgramType.BIND);

        return node;
    }

    /**
     * Visit event handler node.
     * @param node {EventNode} Concrete event handler node.
     * @param context {IContext} Concrete visitor context.
     */
    visitEvent(node: EventNode, context: IContext): Ast {
        context.container.registerProgram(node.wsHandler, ProgramType.EVENT);

        return node;
    }

    /**
     * Visit element node.
     * @param node {ElementNode} Concrete element node.
     * @param context {IContext} Concrete visitor context.
     */
    visitElement(node: ElementNode, context: IContext): Ast {
        const name = getElementName(node);
        if (name !== null) {
            this.children.push(name);
        }

        this.stack.push(AbstractNodeType.ELEMENT);
        node.wsContent = navigateAll<IContext, Ast>(this, node.wsContent, context) as TContent[];
        node.wsAttributes = visitAllProperties<IContext, Ast>(this, node.wsAttributes, context) as IAttributes;
        node.wsEvents = visitAllProperties<IContext, Ast>(this, node.wsEvents, context) as IEvents;
        this.stack.pop();

        node.irKey = context.key;

        return node;
    }

    /**
     * Visit doctype node.
     * @param node {DoctypeNode} Concrete doctype node.
     * @param context {IContext} Concrete visitor context.
     */
    visitDoctype(node: DoctypeNode, context: IContext): Ast {
        return node;
    }

    /**
     * Visit CData section node.
     * @param node {CDataNode} Concrete CData section node.
     * @param context {IContext} Concrete visitor context.
     */
    visitCData(node: CDataNode, context: IContext): Ast {
        return node;
    }

    /**
     * Visit instruction node.
     * @param node {InstructionNode} Concrete instruction node.
     * @param context {IContext} Concrete visitor context.
     */
    visitInstruction(node: InstructionNode, context: IContext): Ast {
        return node;
    }

    /**
     * Visit comment node.
     * @param node {CommentNode} Concrete comment node.
     * @param context {IContext} Concrete visitor context.
     */
    visitComment(node: CommentNode, context: IContext): Ast {
        return undefined;
    }

    /**
     * Visit component node.
     * @param node {ComponentNode} Concrete component node.
     * @param context {IContext} Concrete visitor context.
     */
    visitComponent(node: ComponentNode, context: IContext): Ast {
        this.registerDependency(node.wsPath.getFullPhysicalPath());
        this.processComponent(node, context);

        return node;
    }

    /**
     * Visit inline template node.
     * @param node {InlineTemplateNode} Concrete inline template node.
     * @param context {IContext} Concrete visitor context.
     */
    visitInlineTemplate(node: InlineTemplateNode, context: IContext): Ast {
        this.processComponent(node, {
            ...context,
            key: ''
        });

        node.irKey = context.key;

        // Critical! Порядок важен. Добавляем сначала внутренние шаблоны, если они есть
        this.inlineTemplates.push(node);

        return node;
    }

    /**
     * Visit static template node.
     * @param node {StaticPartialNode} Concrete static template node.
     * @param context {IContext} Concrete visitor context.
     */
    visitStaticPartial(node: StaticPartialNode, context: IContext): Ast {
        this.registerDependency(node.wsPath.getFullPhysicalPath());
        this.processComponent(node, {
            ...context,
            key: ''
        });

        node.irKey = context.key;

        return node;
    }

    /**
     * Visit dynamic partial node.
     * @param node {DynamicPartialNode} Concrete dynamic partial node.
     * @param context {IContext} Concrete visitor context.
     */
    visitDynamicPartial(node: DynamicPartialNode, context: IContext): Ast {
        const container = this.processComponent(node, {
            ...context,
            key: ''
        });

        node.irKey = context.key;

        container.registerProgram(node.wsExpression, ProgramType.OPTION);

        return node;
    }

    /**
     * Visit template node.
     * @param node {TemplateNode} Concrete template node.
     * @param context {IContext} Concrete visitor context.
     */
    visitTemplate(node: TemplateNode, context: IContext): Ast {
        const container = context.container.spawn(ContainerType.TEMPLATE);
        const childContext: IContext = {
            ...context,
            container
        };

        this.templateDefinitions[node.wsName] = node;

        // Critical! При аннотации узлы могут перемещаться или вовсе выноситься из дерева.
        //  Необходимо флаги проставить до начала их обработки.
        setRootComponentNodeFlag(node.wsContent);
        setRootElementNodeFlag(node.wsContent);
        setPassRefFlag(node.wsContent);

        this.stack.push(AbstractNodeType.DIRECTIVE);
        node.wsContent = navigateAll<IContext, Ast>(this, node.wsContent, childContext) as TContent[];
        this.stack.pop();

        node.irKey = context.key;
        node.wsContainer = container;

        // Inline-шаблоны исключаем из ast.
        // При генерации кода они обрабатываются первыми.
        return undefined;
    }

    /**
     * Visit conditional "if" node.
     * @param node {IfNode} Concrete conditional "if" node.
     * @param context {IContext} Concrete visitor context.
     */
    visitIf(node: IfNode, context: IContext): Ast {
        context.container.registerProgram(node.wsTest, ProgramType.REGULAR);

        this.stack.push(AbstractNodeType.DIRECTIVE);
        node.wsConsequent = navigateAll<IContext, Ast>(this, node.wsConsequent, context) as TContent[];
        this.stack.pop();

        node.irKey = context.key;

        return node;
    }

    /**
     * Visit conditional "else" node.
     * @param node {ElseNode} Concrete conditional "else" node.
     * @param context {IContext} Concrete visitor context.
     */
    visitElse(node: ElseNode, context: IContext): Ast {
        if (node.wsTest !== null) {
            context.container.registerProgram(node.wsTest, ProgramType.REGULAR);
        }

        this.stack.push(AbstractNodeType.DIRECTIVE);
        node.wsConsequent = navigateAll<IContext, Ast>(this, node.wsConsequent, context) as TContent[];
        this.stack.pop();

        node.irKey = context.key;

        if (context.prev instanceof IfNode || context.prev instanceof ElseNode) {
            context.prev.wsAlternate = node;

            return undefined;
        }

        throw new Error(
            `внутренняя ошибка аннотации: узел типа ${getInstanceClassName(context.prev)} не ожидался при построении условной цепочки`
        );
    }

    /**
     * Visit "for" cycle node.
     * @param node {ForNode} Concrete "for" cycle node.
     * @param context {IContext} Concrete visitor context.
     */
    visitFor(node: ForNode, context: IContext): Ast {
        const container = context.container.spawn(ContainerType.ITERATOR);
        const childContext: IContext = {
            ...context,
            container,
            key: ''
        };

        if (node.wsInit) {
            container.registerProgram(node.wsInit, ProgramType.ITERATOR);
        }

        container.registerProgram(node.wsTest, ProgramType.ITERATOR);

        if (node.wsUpdate) {
            container.registerProgram(node.wsUpdate, ProgramType.ITERATOR);
        }

        this.stack.push(AbstractNodeType.DIRECTIVE);
        node.wsContent = navigateAll<IContext, Ast>(this, node.wsContent, childContext) as TContent[];
        this.stack.pop();

        node.irKey = context.key;
        node.wsContainer = container;
        node.wsUniqueIndex = this.cycleCounter++;

        return node;
    }

    /**
     * Visit "foreach" cycle node.
     * @param node {ForeachNode} Concrete "foreach" cycle node.
     * @param context {IContext} Concrete visitor context.
     */
    visitForeach(node: ForeachNode, context: IContext): Ast {
        const container = context.container.spawn(ContainerType.ITERATOR);
        const childContext: IContext = {
            ...context,
            container,
            key: ''
        };

        if (node.wsIndex) {
            container.registerIdentifier(node.wsIndex.string);
        }
        container.registerIdentifier(node.wsIterator.string);
        container.registerProgram(node.wsCollection, ProgramType.REGULAR);

        this.stack.push(AbstractNodeType.DIRECTIVE);
        node.wsContent = navigateAll<IContext, Ast>(this, node.wsContent, childContext) as TContent[];
        this.stack.pop();

        node.irKey = context.key;
        node.wsContainer = container;
        node.wsUniqueIndex = this.cycleCounter++;

        return node;
    }

    /**
     * Visit array data node.
     * @param node {ArrayNode} Concrete array data node.
     * @param context {IContext} Concrete visitor context.
     */
    visitArray(node: ArrayNode, context: IContext): Ast {
        this.stack.push(AbstractNodeType.DATA_TYPE_DIRECTIVE);
        node.wsElements = navigateAll<IContext, Ast>(this, node.wsElements, context) as TData[];
        this.stack.pop();

        node.irKey = context.key;

        return node;
    }

    /**
     * Visit boolean data node.
     * @param node {BooleanNode} Concrete boolean data node.
     * @param context {IContext} Concrete visitor context.
     */
    visitBoolean(node: BooleanNode, context: IContext): Ast {
        this.stack.push(AbstractNodeType.DATA_TYPE_DIRECTIVE);
        node.wsData = navigateAll<IContext, Ast>(this, node.wsData, context) as TText[];
        this.stack.pop();

        node.irKey = context.key;

        return node;
    }

    /**
     * Visit function data node.
     * @param node {FunctionNode} Concrete function data node.
     * @param context {IContext} Concrete visitor context.
     */
    visitFunction(node: FunctionNode, context: IContext): Ast {
        this.stack.push(AbstractNodeType.DATA_TYPE_DIRECTIVE);
        node.wsOptions = visitAllProperties<IContext, Ast>(this, node.wsOptions, context) as IOptions;
        node.wsFunction = navigateAll<IContext, Ast>(this, node.wsFunction, context) as TText[];
        this.stack.pop();

        node.irKey = context.key;

        return node;
    }

    /**
     * Visit number data node.
     * @param node {NumberNode} Concrete number data node.
     * @param context {IContext} Concrete visitor context.
     */
    visitNumber(node: NumberNode, context: IContext): Ast {
        this.stack.push(AbstractNodeType.DATA_TYPE_DIRECTIVE);
        node.wsData = navigateAll<IContext, Ast>(this, node.wsData, context) as TText[];
        this.stack.pop();

        node.irKey = context.key;

        return node;
    }

    /**
     * Visit object data node.
     * @param node {ObjectNode} Concrete object data node.
     * @param context {IContext} Concrete visitor context.
     */
    visitObject(node: ObjectNode, context: IContext): Ast {
        this.stack.push(AbstractNodeType.DATA_TYPE_DIRECTIVE);
        node.wsProperties = navigateAllProperties<IContext, Ast>(this, node.wsProperties, context) as IObjectProperties;
        this.stack.pop();

        node.irKey = context.key;

        return node;
    }

    /**
     * Visit string data node.
     * @param node {StringNode} Concrete string data node.
     * @param context {IContext} Concrete visitor context.
     */
    visitString(node: StringNode, context: IContext): Ast {
        this.stack.push(AbstractNodeType.DATA_TYPE_DIRECTIVE);
        node.wsData = navigateAll<IContext, Ast>(this, node.wsData, context) as TText[];
        this.stack.pop();

        node.irKey = context.key;

        return node;
    }

    /**
     * Visit value data node.
     * @param node {ValueNode} Concrete value data node.
     * @param context {IContext} Concrete visitor context.
     */
    visitValue(node: ValueNode, context: IContext): Ast {
        this.stack.push(AbstractNodeType.DATA_TYPE_DIRECTIVE);
        node.wsData = navigateAll<IContext, Ast>(this, node.wsData, context) as TText[];
        this.stack.pop();

        node.irKey = context.key;

        return node;
    }

    /**
     * Visit shared text node.
     * @param node {TextNode} Concrete shared text node.
     * @param context {IContext} Concrete visitor context.
     */
    visitText(node: TextNode, context: IContext): Ast {
        this.stack.push(AbstractNodeType.TEXT);
        node.wsContent = navigateAll<IContext, Ast>(this, node.wsContent, context) as TText[];
        this.stack.pop();

        node.irKey = context.key;

        return node;
    }

    /**
     * Visit text data node.
     * @param node {TextDataNode} Concrete text data node.
     * @param context {IContext} Concrete visitor context.
     */
    visitTextData(node: TextDataNode, context: IContext): Ast {
        return node;
    }

    /**
     * Visit mustache expression node.
     * @param node {ExpressionNode} Concrete mustache expression node.
     * @param context {IContext} Concrete visitor context.
     */
    visitExpression(node: ExpressionNode, context: IContext): Ast {
        const programType = getProgramType(this.stack, context.attributeName);
        context.container.registerProgram(node.wsProgram, programType);

        return node;
    }

    /**
     * Visit translation node.
     * @param node {TranslationNode} Concrete translation node.
     * @param context {IContext} Concrete visitor context.
     */
    visitTranslation(node: TranslationNode, context: IContext): Ast {
        return node;
    }

    /**
     * Process component and ws:partial node.
     * @param node {BaseWasabyElement} Component and ws:partial node.
     * @param context {IContext} Visitor context.
     * @private
     */
    private processComponent(node: BaseWasabyElement, context: IContext): ProgramsContainer {
        const name = getComponentName(node);
        if (name !== null) {
            this.children.push(name);
        }

        const container = context.container.spawn(ContainerType.COMPONENT);
        const childContext: IContext = {
            ...context,
            container
        };

        if (node.wsOptions.hasOwnProperty('scope')) {
            validateScopeOption(node.wsOptions.scope);
        }

        if (node.wsOptions.hasOwnProperty('attributes')) {
            validateAttributesOption(node.wsOptions.attributes);
        }

        validateBinds(node);

        this.stack.push(AbstractNodeType.COMPONENT);
        node.wsAttributes = visitAllProperties<IContext, Ast>(this, node.wsAttributes, childContext) as IAttributes;
        node.wsEvents = visitAllProperties<IContext, Ast>(this, node.wsEvents, childContext) as IEvents;
        node.wsOptions = navigateAllProperties<IContext, Ast>(this, node.wsOptions, childContext) as IOptions;
        node.wsContents = navigateAllProperties<IContext, Ast>(this, node.wsContents, childContext) as IContents;
        this.stack.pop();

        node.irKey = context.key;
        node.wsContainer = container;

        return container;
    }

    /**
     * Register dependency physical path.
     * @param {string} physicalPath Module name of dependency.
     * @private
     */
    private registerDependency(physicalPath: string): void {
        if (this.dependencies.indexOf(physicalPath) === -1) {
            this.dependencies.push(physicalPath);
        }
    }

    /**
     * Get collection of template nodes which were removed from ast.
     * @private
     */
    private getTemplates(): TemplateNode[] {
        const templates = [];

        this.inlineTemplates.forEach((inlineTemplate) => {
            const template = this.templateDefinitions[inlineTemplate.wsName];

            if (!template) {
                // Шаблон может отсутствовать, если компиляция была задана с внешним связыванием.
                return;
            }

            // В коллекцию сначала добавляются внутренние узлы (при наличии вложенности),
            // чтобы при кодогенерации все внутренние выражения были размещены в таблице
            // в момент обработки самого узла.
            if (templates.indexOf(template) === -1) {
                templates.push(template);
            }

            // Установка статической связи
            inlineTemplate.wsContainer.attach(
                template.wsContainer,
                collectInlineTemplateIdentifiers(inlineTemplate)
            );
        });

        // Добавляем недостающие динамически связываемые шаблоны
        Object.values(this.templateDefinitions).forEach((template) => {
            if (templates.indexOf(template) === -1) {
                templates.push(template);
            }
        });

        return templates;
    }
}

export function annotate(errorHandler: IErrorHandler, nodes: Ast[], moduleName: string): IAnnotation {
    return new IRAnnotator(errorHandler).generate(nodes, moduleName);
}
