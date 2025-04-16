/**
 * @description Module for annotation of abstract syntax tree:
 * 1) Collecting trees of internal nodes for components;
 * 2) Checking for translations.
 */

import * as Ast from './Ast';
import Scope from './Scope';
import { Container, ContainerType } from './internal/Container';
import { IProgramMeta, ProgramType } from './internal/Storage';
import { ProgramNode } from '../expressions/Nodes';
import * as Walkers from '../expressions/Walkers';

/**
 * Prefix for internal mustache expressions.
 */
const INTERNAL_PROGRAM_PREFIX = '__dirtyCheckingVars_';

/**
 * Result of annotation process.
 *
 * @private
 */
export interface IResultTree extends Array<Ast.Ast> {
    /**
     * Child names collection.
     */
    childrenStorage: string[];

    /**
     * Reactive property names collection.
     */
    reactiveProps: string[];

    /**
     * Inline template names collection.
     */
    templateNames: string[];

    /**
     * Global lexical context.
     */
    container: Container;

    /**
     * Abstract syntax tree contains translations.
     */
    hasTranslations: boolean;

    /**
     * Special flag.
     * @deprecated
     */
    __newVersion: boolean;
}

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

/**
 * Annotation counters.
 */
class Counters {
    /**
     * Counter for cycle nodes (ws:for aka for/foreach).
     * @private
     */
    private cycle: number;

    /**
     * Initialize new instance of annotation counter.
     */
    constructor() {
        this.cycle = 0;
    }

    /**
     * Allocate new cycle index.
     */
    allocateCycleIndex(): number {
        return this.cycle++;
    }
}

/**
 * Interface for annotation context.
 */
interface IContext {
    /**
     * Current processing attribute name.
     */
    attributeName?: string;

    /**
     * Collection of child names for processing abstract syntax tree.
     */
    childrenStorage: string[];

    /**
     * Actual container for internal expressions.
     */
    container: Container;

    /**
     * Scope object for processing abstract syntax tree.
     */
    scope: Scope;

    /**
     * Actual annotation counter for processing abstract syntax tree.
     */
    counters: Counters;
}

/**
 * Wrap mustache expression programs into special codegen structure and generate object with internal expressions.
 * @param programs {IProgramMeta[]} Collection of meta of mustache expression programs.
 * @returns {*} Object with internal expressions.
 */
function wrapInternalExpressions(programs: IProgramMeta[]): any {
    const internal = {};
    for (let index = 0; index < programs.length; ++index) {
        const program = programs[index];
        internal[INTERNAL_PROGRAM_PREFIX + index] = {
            data: [new Ast.ExpressionNode(program.node)],
            type: 'text',
        };
    }
    return internal;
}

/**
 * Collect name of identifiers in inline template node from options which names equal to values.
 * @param node {InlineTemplateNode} Inline template node.
 * @returns {string[]} Collection of identifiers.
 */
function collectInlineTemplateIdentifiers(node: Ast.InlineTemplateNode): string[] {
    const identifiers = [];
    // eslint-disable-next-line guard-for-in
    for (const name in node.wsEvents) {
        const event = node.wsEvents[name];
        if (event instanceof Ast.BindNode) {
            // bind:option="option" is simple alias and deep usages exist in current scope
            if (event.wsProperty !== event.wsValue.string) {
                identifiers.push(event.wsProperty);
            }
        }
    }
    // eslint-disable-next-line guard-for-in
    for (const name in node.wsOptions) {
        const option = node.wsOptions[name];
        if (
            // eslint-disable-next-line no-bitwise
            option.hasFlag(Ast.Flags.TYPE_CASTED | Ast.Flags.UNPACKED) &&
            option.wsValue instanceof Ast.ValueNode
        ) {
            const value = option.wsValue;
            const valuePart = value.wsData[0];
            if (value.wsData.length === 1 && valuePart instanceof Ast.ExpressionNode) {
                if (option.wsName === valuePart.wsProgram.string) {
                    // Skip only case option="{{ option }}"
                    continue;
                }
            }
        }
        identifiers.push(option.wsName);
    }
    return identifiers;
}

/**
 * Get processing program type that depends on type of processing abstract syntax node.
 * @param stack {AbstractNodeType[]} Stack of types of processing abstract syntax node.
 * @returns {ProgramType} Actual type of processing mustache expression.
 */
function getProgramType(stack: AbstractNodeType[]): ProgramType {
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
        } else if (isInOption) {
            return ProgramType.OPTION;
        }
    }
    return ProgramType.SIMPLE;
}

/**
 * Check if current processing is in attribute of component.
 * @param stack {AbstractNodeType[]} Stack of types of processing abstract syntax node.
 * @returns {boolean} True in case of processing attribute of component.
 */
function isInComponentAttributes(stack: AbstractNodeType[]): boolean {
    for (let index = stack.length - 1; index > -1; --index) {
        if (stack[index] === AbstractNodeType.DATA_TYPE_DIRECTIVE) {
            continue;
        }
        if (stack[index] === AbstractNodeType.COMPONENT) {
            return true;
        }
        break;
    }
    return false;
}

/**
 * Check if current processing is in data type node.
 * @param stack {AbstractNodeType[]} Stack of types of processing abstract syntax node.
 * @returns {boolean} True in case of processing data type node.
 */
function isInDataTypeDirective(stack: AbstractNodeType[]): boolean {
    for (let index = stack.length - 1; index > -1; --index) {
        if (stack[index] === AbstractNodeType.DATA_TYPE_DIRECTIVE) {
            return true;
        }
        if (
            stack[index] === AbstractNodeType.COMPONENT ||
            stack[index] === AbstractNodeType.COMPONENT_OPTION ||
            stack[index] === AbstractNodeType.ELEMENT ||
            stack[index] === AbstractNodeType.DIRECTIVE ||
            stack[index] === AbstractNodeType.ATTRIBUTE ||
            stack[index] === AbstractNodeType.OPTION ||
            stack[index] === AbstractNodeType.TEXT
        ) {
            return false;
        }
    }
    return false;
}

/**
 * Get string value from text.
 * @param value {TText[]} Collection of text nodes.
 * @return {string | null} Returns string in case of collection has single text node.
 */
function getStringValueFromText(value: Ast.TText[]): string | null {
    if (value.length !== 1) {
        return null;
    }
    const valueNode = value[0];
    if (!(valueNode instanceof Ast.TextDataNode)) {
        return null;
    }
    return valueNode.wsContent;
}

/**
 * Get element name.
 * @param element {BaseHtmlElement} Element node.
 * @return {string | null} Returns element name if it exists.
 */
function getElementName(element: Ast.BaseHtmlElement): string | null {
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
function getStringValueFromData(value: Ast.TData): string | null {
    if (value instanceof Ast.ValueNode) {
        return getStringValueFromText(value.wsData);
    }
    if (value instanceof Ast.StringNode) {
        return getStringValueFromText(value.wsData);
    }
    return null;
}

/**
 * Get component name.
 * @param component {BaseWasabyElement} Component node.
 * @return {string | null} Returns component name if it exists.
 */
function getComponentName(component: Ast.BaseWasabyElement): string | null {
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
 * Set root node flag.
 * @param nodes {Ast[]} Collection of nodes of abstract syntax tree.
 */
function setRootComponentNodeFlag(nodes: Ast.Ast[]): void {
    nodes.forEach((node) => {
        if (node instanceof Ast.IfNode) {
            setRootComponentNodeFlag(node.wsConsequent);
            return;
        }
        if (node instanceof Ast.ElseNode) {
            setRootComponentNodeFlag(node.wsConsequent);
            return;
        }
        if (node instanceof Ast.ForNode) {
            setRootComponentNodeFlag(node.wsContent);
            return;
        }
        if (node instanceof Ast.ForeachNode) {
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
function setContainerNodeFlag(nodes: Ast.Ast[]): void {
    for (const node of nodes) {
        if (node instanceof Ast.ElementNode) {
            node.wsIsContainerNode = true;
        } else if (node instanceof Ast.ComponentNode) {
            node.wsIsContainerNode = true;
        } else if (node instanceof Ast.DynamicPartialNode) {
            node.wsIsContainerNode = true;
        } else if (node instanceof Ast.StaticPartialNode) {
            node.wsIsContainerNode = true;
        } else if (node instanceof Ast.InlineTemplateNode) {
            node.wsIsContainerNode = true;
        } else if (node instanceof Ast.IfNode) {
            setContainerNodeFlag(node.wsConsequent);
        } else if (node instanceof Ast.ElseNode) {
            setContainerNodeFlag(node.wsConsequent);
        }
    }
}

/**
 * Set flags for inline template nodes to pass ref object.
 */
function setPassRefFlag(nodes: Ast.Ast[]): void {
    for (const node of nodes) {
        if (node instanceof Ast.InlineTemplateNode) {
            node.wsPassRef = true;
        } else if (node instanceof Ast.IfNode || node instanceof Ast.ElseNode) {
            setPassRefFlag(node.wsConsequent);
        } else if (node instanceof Ast.ForNode || node instanceof Ast.ForeachNode) {
            setPassRefFlag(node.wsContent);
        }
    }
}

/**
 * Check for translations in mustache expression node.
 * @param scope {Scope} Scope object for processing abstract syntax tree.
 * @param program {ProgramNode} Mustache expression node.
 */
function checkForTranslations(scope: Scope, program: ProgramNode | null): void {
    if (!program) {
        return;
    }
    if (Walkers.containsTranslationFunction(program)) {
        scope.setDetectedTranslation();
    }
}

/**
 * Abstract syntax tree annotator.
 */
class InternalVisitor implements Ast.IAstVisitor<IContext, void> {
    /**
     * Stack of processing node types.
     */
    readonly stack: AbstractNodeType[];

    /**
     * Initialize new instance of abstract syntax tree annotator.
     */
    constructor() {
        this.stack = [];
    }

    /**
     * Annotate abstract syntax tree.
     * @param nodes {Ast[]} Collection of nodes of abstract syntax tree.
     * @param scope {Scope} Scope object for processing abstract syntax tree.
     */
    process(nodes: Ast.Ast[], scope: Scope): IResultTree {
        const container = new Container(null, ContainerType.GLOBAL);
        const childrenStorage: string[] = [];
        const context: IContext = {
            childrenStorage,
            container,
            scope,
            counters: new Counters(),
        };
        setContainerNodeFlag(nodes);
        setPassRefFlag(nodes);
        this.stack.push(AbstractNodeType.ROOT);
        for (let index = 0; index < nodes.length; ++index) {
            nodes[index].accept(this, context);
            if (!nodes[index].wsContainer) {
                nodes[index].wsContainer = container;
            }
            if (!nodes[index].wsInternalTree) {
                nodes[index].wsInternalTree = nodes[index].wsContainer.getInternalStructure();
                nodes[index].wsInternal = wrapInternalExpressions(
                    nodes[index].wsInternalTree.flatten()
                );
            }
        }
        this.stack.pop();
        const result = nodes as IResultTree;
        result.childrenStorage = childrenStorage;
        result.reactiveProps = container.getOwnIdentifiers();
        result.templateNames = scope.getTemplateNames();
        result.container = container;
        result.hasTranslations = scope.hasDetectedTranslations();
        result.__newVersion = true;
        return result;
    }

    /**
     * Visit attribute node.
     * @param node {AttributeNode} Concrete attribute node.
     * @param context {IContext} Visitor context.
     */
    visitAttribute(node: Ast.AttributeNode, context: IContext): void {
        const childContext: IContext = {
            childrenStorage: context.childrenStorage,
            container: context.container,
            scope: context.scope,
            attributeName: node.wsName,
            counters: context.counters,
        };
        this.stack.push(AbstractNodeType.ATTRIBUTE);
        Ast.visitAll(this, node.wsValue, childContext);
        this.stack.pop();
    }

    /**
     * Visit option node.
     * @param node {OptionNode} Concrete option node.
     * @param context {IContext} Visitor context.
     */
    visitOption(node: Ast.OptionNode, context: IContext): void {
        const childContext: IContext = {
            childrenStorage: context.childrenStorage,
            container: context.container,
            scope: context.scope,
            attributeName: node.wsName,
            counters: context.counters,
        };
        this.stack.push(AbstractNodeType.OPTION);
        node.wsValue.accept(this, childContext);
        this.stack.pop();
    }

    /**
     * Visit content option node.
     * @param node {ContentOptionNode} Concrete content option node.
     * @param context {IContext} Visitor context.
     */
    visitContentOption(node: Ast.ContentOptionNode, context: IContext): void {
        const container = context.container.createContainer(ContainerType.CONTENT_OPTION);
        container.addIdentifier(node.wsName);
        container.desc = node.wsName;
        container.isInDataType = isInDataTypeDirective(this.stack);
        const childContext: IContext = {
            childrenStorage: context.childrenStorage,
            container,
            scope: context.scope,
            counters: context.counters,
        };
        this.stack.push(AbstractNodeType.COMPONENT_OPTION);
        Ast.visitAll(this, node.wsContent, childContext);
        setRootComponentNodeFlag(node.wsContent);
        setPassRefFlag(node.wsContent);
        this.stack.pop();

        node.wsContainer = container;
        node.wsInternalTree = container.getInternalStructure();
        node.wsInternal = wrapInternalExpressions(node.wsInternalTree.flatten());
    }

    /**
     * Visit bind node.
     * @param node {BindNode} Concrete bind node.
     * @param context {IContext} Visitor context.
     */
    visitBind(node: Ast.BindNode, context: IContext): void {
        const isInComponent = isInComponentAttributes(this.stack);
        const programName = isInComponent ? node.wsProperty : null;
        context.container.registerProgram(node.wsValue, ProgramType.BIND, programName);
        checkForTranslations(context.scope, node.wsValue);
    }

    /**
     * Visit event handler node.
     * @param node {EventNode} Concrete event handler node.
     * @param context {IContext} Visitor context.
     */
    visitEvent(node: Ast.EventNode, context: IContext): void {
        const isInComponent = isInComponentAttributes(this.stack);
        const programName = isInComponent ? node.wsEvent : null;
        context.container.registerProgram(node.wsHandler, ProgramType.EVENT, programName);
        checkForTranslations(context.scope, node.wsHandler);
    }

    /**
     * Visit element node.
     * @param node {ElementNode} Concrete element node.
     * @param context {IContext} Visitor context.
     */
    visitElement(node: Ast.ElementNode, context: IContext): void {
        const name = getElementName(node);
        if (name !== null) {
            context.childrenStorage.push(name);
        }
        this.stack.push(AbstractNodeType.ELEMENT);
        Ast.visitAll(this, node.wsContent, context);
        Ast.visitAllProperties(this, node.wsAttributes, context);
        Ast.visitAllProperties(this, node.wsEvents, context);
        this.stack.pop();
    }

    /**
     * Visit doctype node.
     * @param node {DoctypeNode} Concrete doctype node.
     * @param context {IContext} Visitor context.
     */
    visitDoctype(node: Ast.DoctypeNode, context: IContext): void {}

    /**
     * Visit CData section node.
     * @param node {CDataNode} Concrete CData section node.
     * @param context {IContext} Visitor context.
     */
    visitCData(node: Ast.CDataNode, context: IContext): void {}

    /**
     * Visit instruction node.
     * @param node {InstructionNode} Concrete instruction node.
     * @param context {IContext} Visitor context.
     */
    visitInstruction(node: Ast.InstructionNode, context: IContext): void {}

    /**
     * Visit comment node.
     * @param node {CommentNode} Concrete comment node.
     * @param context {IContext} Visitor context.
     */
    visitComment(node: Ast.CommentNode, context: IContext): void {}

    /**
     * Visit component node.
     * @param node {ComponentNode} Concrete component node.
     * @param context {IContext} Visitor context.
     */
    visitComponent(node: Ast.ComponentNode, context: IContext): void {
        const childContainer = this.processComponent(node, context);
        childContainer.desc = `<${node.wsPath.getFullPath()}>`;
        node.wsInternalTree = childContainer.getInternalStructure();
        node.wsInternal = wrapInternalExpressions(node.wsInternalTree.flatten());
    }

    /**
     * Visit inline template node.
     * @param node {InlineTemplateNode} Concrete inline template node.
     * @param context {IContext} Visitor context.
     */
    visitInlineTemplate(node: Ast.InlineTemplateNode, context: IContext): void {
        const childContainer = this.processComponent(node, context);
        if (context.scope.hasTemplate(node.wsName)) {
            const template = context.scope.getTemplate(node.wsName);
            const identifiers = collectInlineTemplateIdentifiers(node);
            childContainer.joinContainer(template.wsContainer, identifiers);
        }
        childContainer.desc = `<ws:partial> @@ inline "${node.wsName}"`;
        node.wsInternalTree = childContainer.getInternalStructure();
        node.wsInternal = wrapInternalExpressions(node.wsInternalTree.flatten());
    }

    /**
     * Visit static template node.
     * @param node {StaticPartialNode} Concrete static template node.
     * @param context {IContext} Visitor context.
     */
    visitStaticPartial(node: Ast.StaticPartialNode, context: IContext): void {
        const childContainer = this.processComponent(node, context);
        childContainer.desc = `<ws:partial> @@ static "${node.wsPath.getFullPath()}"`;
        node.wsInternalTree = childContainer.getInternalStructure();
        node.wsInternal = wrapInternalExpressions(node.wsInternalTree.flatten());
    }

    /**
     * Visit dynamic partial node.
     * @param node {DynamicPartialNode} Concrete dynamic partial node.
     * @param context {IContext} Visitor context.
     */
    visitDynamicPartial(node: Ast.DynamicPartialNode, context: IContext): void {
        const childContainer = this.processComponent(node, context);
        childContainer.registerProgram(node.wsExpression, ProgramType.OPTION, 'template');
        childContainer.desc = `<ws:partial> @@ dynamic "${node.wsExpression.string}"`;
        node.wsInternalTree = childContainer.getInternalStructure();
        node.wsInternal = wrapInternalExpressions(node.wsInternalTree.flatten());
        checkForTranslations(context.scope, node.wsExpression);
    }

    /**
     * Visit template node.
     * @param node {TemplateNode} Concrete template node.
     * @param context {IContext} Visitor context.
     */
    visitTemplate(node: Ast.TemplateNode, context: IContext): void {
        const container = context.container.createContainer(ContainerType.TEMPLATE);
        container.desc = `<ws:template> @@ "${node.wsName}"`;
        const childContext: IContext = {
            childrenStorage: context.childrenStorage,
            scope: context.scope,
            container,
            counters: context.counters,
        };
        this.stack.push(AbstractNodeType.DIRECTIVE);
        Ast.visitAll(this, node.wsContent, childContext);
        this.stack.pop();
        setRootComponentNodeFlag(node.wsContent);
        setPassRefFlag(node.wsContent);
        node.wsContainer = container;
        node.wsInternalTree = container.getInternalStructure();
        node.wsInternal = wrapInternalExpressions(node.wsInternalTree.flatten());
    }

    /**
     * Visit conditional "if" node.
     * @param node {IfNode} Concrete conditional "if" node.
     * @param context {IContext} Visitor context.
     */
    visitIf(node: Ast.IfNode, context: IContext): void {
        const container = context.container.createContainer(ContainerType.CONDITIONAL);
        container.desc = `<ws:if> "${node.wsTest.string}"`;
        container.registerTestProgram(node.wsTest);
        const childContext: IContext = {
            childrenStorage: context.childrenStorage,
            scope: context.scope,
            container,
            counters: context.counters,
        };
        this.stack.push(AbstractNodeType.DIRECTIVE);
        Ast.visitAll(this, node.wsConsequent, childContext);
        this.stack.pop();
        node.wsContainer = container;
        checkForTranslations(context.scope, node.wsTest);
    }

    /**
     * Visit conditional "else" node.
     * @param node {ElseNode} Concrete conditional "else" node.
     * @param context {IContext} Visitor context.
     */
    visitElse(node: Ast.ElseNode, context: IContext): void {
        const container = context.container.createContainer(ContainerType.CONDITIONAL);
        container.desc = '<ws:else>';
        container.isElse = true;
        if (node.wsTest !== null) {
            container.desc = `<ws:else> "${node.wsTest.string}"`;
            container.registerTestProgram(node.wsTest);
        }
        const childContext: IContext = {
            childrenStorage: context.childrenStorage,
            scope: context.scope,
            container,
            counters: context.counters,
        };
        this.stack.push(AbstractNodeType.DIRECTIVE);
        Ast.visitAll(this, node.wsConsequent, childContext);
        this.stack.pop();
        node.wsContainer = container;
        checkForTranslations(context.scope, node.wsTest);
    }

    /**
     * Visit "for" cycle node.
     * @param node {ForNode} Concrete "for" cycle node.
     * @param context {IContext} Visitor context.
     */
    visitFor(node: Ast.ForNode, context: IContext): void {
        const container = context.container.createContainer(ContainerType.CYCLE);
        container.desc = '<ws:for> aka for';
        const childContext: IContext = {
            childrenStorage: context.childrenStorage,
            scope: context.scope,
            container,
            counters: context.counters,
        };
        if (node.wsInit) {
            container.registerProgram(node.wsInit, ProgramType.FLOAT, 'data');
        }
        container.registerProgram(node.wsTest, ProgramType.FLOAT, 'data');
        if (node.wsUpdate) {
            container.registerProgram(node.wsUpdate, ProgramType.FLOAT, 'data');
        }
        this.stack.push(AbstractNodeType.DIRECTIVE);
        Ast.visitAll(this, node.wsContent, childContext);
        this.stack.pop();
        node.wsContainer = container;
        node.wsUniqueIndex = context.counters.allocateCycleIndex();
        checkForTranslations(context.scope, node.wsInit);
        checkForTranslations(context.scope, node.wsTest);
        checkForTranslations(context.scope, node.wsUpdate);
    }

    /**
     * Visit "foreach" cycle node.
     * @param node {ForeachNode} Concrete "foreach" cycle node.
     * @param context {IContext} Visitor context.
     */
    visitForeach(node: Ast.ForeachNode, context: IContext): void {
        const container = context.container.createContainer(ContainerType.CYCLE);
        container.desc = '<ws:for> aka foreach';
        const childContext: IContext = {
            childrenStorage: context.childrenStorage,
            scope: context.scope,
            container,
            counters: context.counters,
        };
        if (node.wsIndex) {
            container.addIdentifier(node.wsIndex.string);
        }
        container.addIdentifier(node.wsIterator.string);
        container.registerProgram(node.wsCollection, ProgramType.SIMPLE, 'data');
        this.stack.push(AbstractNodeType.DIRECTIVE);
        Ast.visitAll(this, node.wsContent, childContext);
        this.stack.pop();
        node.wsContainer = container;
        node.wsUniqueIndex = context.counters.allocateCycleIndex();
        checkForTranslations(context.scope, node.wsCollection);
    }

    /**
     * Visit array data node.
     * @param node {ArrayNode} Concrete array data node.
     * @param context {IContext} Visitor context.
     */
    visitArray(node: Ast.ArrayNode, context: IContext): void {
        this.stack.push(AbstractNodeType.DATA_TYPE_DIRECTIVE);
        Ast.visitAll(this, node.wsElements, context);
        this.stack.pop();
    }

    /**
     * Visit boolean data node.
     * @param node {BooleanNode} Concrete boolean data node.
     * @param context {IContext} Visitor context.
     */
    visitBoolean(node: Ast.BooleanNode, context: IContext): void {
        this.stack.push(AbstractNodeType.DATA_TYPE_DIRECTIVE);
        Ast.visitAll(this, node.wsData, context);
        this.stack.pop();
    }

    /**
     * Visit function data node.
     * @param node {FunctionNode} Concrete function data node.
     * @param context {IContext} Visitor context.
     */
    visitFunction(node: Ast.FunctionNode, context: IContext): void {
        this.stack.push(AbstractNodeType.DATA_TYPE_DIRECTIVE);
        Ast.visitAllProperties(this, node.wsOptions, context);
        Ast.visitAll(this, node.wsFunction, context);
        this.stack.pop();
    }

    /**
     * Visit number data node.
     * @param node {NumberNode} Concrete number data node.
     * @param context {IContext} Visitor context.
     */
    visitNumber(node: Ast.NumberNode, context: IContext): void {
        this.stack.push(AbstractNodeType.DATA_TYPE_DIRECTIVE);
        Ast.visitAll(this, node.wsData, context);
        this.stack.pop();
    }

    /**
     * Visit object data node.
     * @param node {ObjectNode} Concrete object data node.
     * @param context {IContext} Visitor context.
     */
    visitObject(node: Ast.ObjectNode, context: IContext): void {
        this.stack.push(AbstractNodeType.DATA_TYPE_DIRECTIVE);
        Ast.visitAllProperties(this, node.wsProperties, context);
        this.stack.pop();
    }

    /**
     * Visit string data node.
     * @param node {StringNode} Concrete string data node.
     * @param context {IContext} Visitor context.
     */
    visitString(node: Ast.StringNode, context: IContext): void {
        this.stack.push(AbstractNodeType.DATA_TYPE_DIRECTIVE);
        Ast.visitAll(this, node.wsData, context);
        this.stack.pop();
    }

    /**
     * Visit value data node.
     * @param node {ValueNode} Concrete value data node.
     * @param context {IContext} Visitor context.
     */
    visitValue(node: Ast.ValueNode, context: IContext): void {
        this.stack.push(AbstractNodeType.DATA_TYPE_DIRECTIVE);
        Ast.visitAll(this, node.wsData, context);
        this.stack.pop();
    }

    /**
     * Visit shared text node.
     * @param node {TextNode} Concrete shared text node.
     * @param context {IContext} Visitor context.
     */
    visitText(node: Ast.TextNode, context: IContext): void {
        this.stack.push(AbstractNodeType.TEXT);
        Ast.visitAll(this, node.wsContent, context);
        this.stack.pop();
    }

    /**
     * Visit text data node.
     * @param node {TextDataNode} Concrete text data node.
     * @param context {IContext} Visitor context.
     */
    visitTextData(node: Ast.TextDataNode, context: IContext): void {}

    /**
     * Visit mustache expression node.
     * @param node {ExpressionNode} Concrete mustache expression node.
     * @param context {IContext} Visitor context.
     */
    visitExpression(node: Ast.ExpressionNode, context: IContext): void {
        const programType = getProgramType(this.stack);
        const programName = programType === ProgramType.SIMPLE ? null : context.attributeName;
        context.container.registerProgram(node.wsProgram, programType, programName);
        checkForTranslations(context.scope, node.wsProgram);
    }

    /**
     * Visit translation node.
     * @param node {TranslationNode} Concrete translation node.
     * @param context {IContext} Visitor context.
     */
    visitTranslation(node: Ast.TranslationNode, context: IContext): void {
        // TODO: Collect translation keys on annotation stage.
        context.scope.setDetectedTranslation();
    }

    /**
     * Process component and ws:partial node.
     * @param node {BaseWasabyElement} Component and ws:partial node.
     * @param context {IContext} Visitor context.
     * @returns {Container} Container instance for processing node.
     * @private
     */
    private processComponent(node: Ast.BaseWasabyElement, context: IContext): Container {
        const name = getComponentName(node);
        if (name !== null) {
            context.childrenStorage.push(name);
        }
        const container = context.container.createContainer(ContainerType.COMPONENT);
        const childContext: IContext = {
            childrenStorage: context.childrenStorage,
            scope: context.scope,
            container,
            counters: context.counters,
        };
        this.stack.push(AbstractNodeType.COMPONENT);
        Ast.visitAllProperties(this, node.wsAttributes, childContext);
        Ast.visitAllProperties(this, node.wsEvents, childContext);
        Ast.visitAllProperties(this, node.wsOptions, childContext);
        Ast.visitAllProperties(this, node.wsContents, childContext);
        this.stack.pop();
        node.wsContainer = container;
        return container;
    }
}

export function process(nodes: Ast.Ast[], scope: Scope): IResultTree {
    return new InternalVisitor().process(nodes, scope);
}
