/* eslint-disable max-classes-per-file, no-bitwise */
/**
 * @description Represents abstract syntax tree node classes.
 */

import { ProgramNode } from '../_expressions/Nodes';
import { IPath } from './Resolvers';
import { unescape } from '../_modules/utils/common';

/**
 * Visitor interface for abstract syntax nodes tree.
 */
export interface IAstVisitor {
    /**
     * Visit attribute node.
     * @param node {AttributeNode} Concrete attribute node.
     * @param context {*} Concrete visitor context.
     */
    visitAttribute(node: AttributeNode, context: any): any;

    /**
     * Visit option node.
     * @param node {OptionNode} Concrete option node.
     * @param context {*} Concrete visitor context.
     */
    visitOption(node: OptionNode, context: any): any;

    /**
     * Visit content option node.
     * @param node {ContentOptionNode} Concrete content option node.
     * @param context {*} Concrete visitor context.
     */
    visitContentOption(node: ContentOptionNode, context: any): any;

    /**
     * Visit bind node.
     * @param node {BindNode} Concrete bind node.
     * @param context {*} Concrete visitor context.
     */
    visitBind(node: BindNode, context: any): any;

    /**
     * Visit event handler node.
     * @param node {EventNode} Concrete event handler node.
     * @param context {*} Concrete visitor context.
     */
    visitEvent(node: EventNode, context: any): any;

    /**
     * Visit element node.
     * @param node {ElementNode} Concrete element node.
     * @param context {*} Concrete visitor context.
     */
    visitElement(node: ElementNode, context: any): any;

    /**
     * Visit doctype node.
     * @param node {DoctypeNode} Concrete doctype node.
     * @param context {*} Concrete visitor context.
     */
    visitDoctype(node: DoctypeNode, context: any): any;

    /**
     * Visit CData section node.
     * @param node {CDataNode} Concrete CData section node.
     * @param context {*} Concrete visitor context.
     */
    visitCData(node: CDataNode, context: any): any;

    /**
     * Visit instruction node.
     * @param node {InstructionNode} Concrete instruction node.
     * @param context {*} Concrete visitor context.
     */
    visitInstruction(node: InstructionNode, context: any): any;

    /**
     * Visit comment node.
     * @param node {CommentNode} Concrete comment node.
     * @param context {*} Concrete visitor context.
     */
    visitComment(node: CommentNode, context: any): any;

    /**
     * Visit component node.
     * @param node {ComponentNode} Concrete component node.
     * @param context {*} Concrete visitor context.
     */
    visitComponent(node: ComponentNode, context: any): any;

    /**
     * Visit inline template node.
     * @param node {InlineTemplateNode} Concrete inline template node.
     * @param context {*} Concrete visitor context.
     */
    visitInlineTemplate(node: InlineTemplateNode, context: any): any;

    /**
     * Visit static template node.
     * @param node {StaticPartialNode} Concrete static template node.
     * @param context {*} Concrete visitor context.
     */
    visitStaticPartial(node: StaticPartialNode, context: any): any;

    /**
     * Visit dynamic partial node.
     * @param node {DynamicPartialNode} Concrete dynamic partial node.
     * @param context {*} Concrete visitor context.
     */
    visitDynamicPartial(node: DynamicPartialNode, context: any): any;

    /**
     * Visit template node.
     * @param node {TemplateNode} Concrete template node.
     * @param context {*} Concrete visitor context.
     */
    visitTemplate(node: TemplateNode, context: any): any;

    /**
     * Visit conditional "if" node.
     * @param node {IfNode} Concrete conditional "if" node.
     * @param context {*} Concrete visitor context.
     */
    visitIf(node: IfNode, context: any): any;

    /**
     * Visit conditional "else" node.
     * @param node {ElseNode} Concrete conditional "else" node.
     * @param context {*} Concrete visitor context.
     */
    visitElse(node: ElseNode, context: any): any;

    /**
     * Visit "for" cycle node.
     * @param node {ForNode} Concrete "for" cycle node.
     * @param context {*} Concrete visitor context.
     */
    visitFor(node: ForNode, context: any): any;

    /**
     * Visit "foreach" cycle node.
     * @param node {ForeachNode} Concrete "foreach" cycle node.
     * @param context {*} Concrete visitor context.
     */
    visitForeach(node: ForeachNode, context: any): any;

    /**
     * Visit array data node.
     * @param node {ArrayNode} Concrete array data node.
     * @param context {*} Concrete visitor context.
     */
    visitArray(node: ArrayNode, context: any): any;

    /**
     * Visit boolean data node.
     * @param node {BooleanNode} Concrete boolean data node.
     * @param context {*} Concrete visitor context.
     */
    visitBoolean(node: BooleanNode, context: any): any;

    /**
     * Visit function data node.
     * @param node {FunctionNode} Concrete function data node.
     * @param context {*} Concrete visitor context.
     */
    visitFunction(node: FunctionNode, context: any): any;

    /**
     * Visit number data node.
     * @param node {NumberNode} Concrete number data node.
     * @param context {*} Concrete visitor context.
     */
    visitNumber(node: NumberNode, context: any): any;

    /**
     * Visit object data node.
     * @param node {ObjectNode} Concrete object data node.
     * @param context {*} Concrete visitor context.
     */
    visitObject(node: ObjectNode, context: any): any;

    /**
     * Visit string data node.
     * @param node {StringNode} Concrete string data node.
     * @param context {*} Concrete visitor context.
     */
    visitString(node: StringNode, context: any): any;

    /**
     * Visit value data node.
     * @param node {ValueNode} Concrete value data node.
     * @param context {*} Concrete visitor context.
     */
    visitValue(node: ValueNode, context: any): any;

    /**
     * Visit shared text node.
     * @param node {TextNode} Concrete shared text node.
     * @param context {*} Concrete visitor context.
     */
    visitText(node: TextNode, context: any): any;

    /**
     * Visit text data node.
     * @param node {TextDataNode} Concrete text data node.
     * @param context {*} Concrete visitor context.
     */
    visitTextData(node: TextDataNode, context: any): any;

    /**
     * Visit mustache expression node.
     * @param node {ExpressionNode} Concrete mustache expression node.
     * @param context {*} Concrete visitor context.
     */
    visitExpression(node: ExpressionNode, context: any): any;

    /**
     * Visit translation node.
     * @param node {TranslationNode} Concrete translation node.
     * @param context {*} Concrete visitor context.
     */
    visitTranslation(node: TranslationNode, context: any): any;
}

// <editor-fold desc="Wasaby tree types">

/**
 * Wasaby text representation type.
 */
export declare type TText = ExpressionNode | TextDataNode | TranslationNode;

/**
 * Check if node is type of Wasaby text types.
 * @param node {Ast} Wasaby abstract syntax node.
 */
export function isTypeofText(node: Ast): boolean {
    return (
        node instanceof ExpressionNode ||
        node instanceof TextDataNode ||
        node instanceof TranslationNode
    );
}

/**
 * Wasaby directives type.
 */
export declare type TWasaby =
    | TemplateNode
    | InlineTemplateNode
    | StaticPartialNode
    | DynamicPartialNode
    | ComponentNode
    | IfNode
    | ElseNode
    | ForNode
    | ForeachNode;

/**
 * Check if node is type of Wasaby directive types.
 * @param node {Ast} Wasaby abstract syntax node.
 */
export function isTypeofWasaby(node: Ast): boolean {
    return (
        node instanceof TemplateNode ||
        node instanceof InlineTemplateNode ||
        node instanceof StaticPartialNode ||
        node instanceof DynamicPartialNode ||
        node instanceof ComponentNode ||
        node instanceof IfNode ||
        node instanceof ElseNode ||
        node instanceof ForNode ||
        node instanceof ForeachNode
    );
}

/**
 * Html node type.
 */
export declare type THtml =
    | ElementNode
    | DoctypeNode
    | CDataNode
    | InstructionNode
    | CommentNode
    | TextNode;

/**
 * Check if node is type of HTML.
 * @param node {Ast} Wasaby abstract syntax node.
 */
export function isTypeofHtml(node: Ast): boolean {
    return (
        node instanceof ElementNode ||
        node instanceof DoctypeNode ||
        node instanceof CDataNode ||
        node instanceof InstructionNode ||
        node instanceof CommentNode ||
        node instanceof TextNode
    );
}

/**
 * Content representation type.
 */
export declare type TContent = TWasaby | THtml;

/**
 * Check if node is type of content.
 * @param node {Ast} Wasaby abstract syntax node.
 */
export function isTypeofContent(node: Ast): boolean {
    return isTypeofWasaby(node) || isTypeofHtml(node);
}

/**
 * Wasaby data representation type.
 */
export declare type TData =
    | ArrayNode
    | BooleanNode
    | FunctionNode
    | NumberNode
    | ObjectNode
    | StringNode
    | ValueNode;

/**
 * Check if node is type of Wasaby data type.
 * @param node {Ast} Wasaby abstract syntax node.
 */
export function isTypeofData(node: Ast): boolean {
    return (
        node instanceof ArrayNode ||
        node instanceof BooleanNode ||
        node instanceof FunctionNode ||
        node instanceof NumberNode ||
        node instanceof ObjectNode ||
        node instanceof StringNode ||
        node instanceof ValueNode
    );
}

// </editor-fold>

// <editor-fold desc="Base interfaces and classes">

/**
 * Ast node flags.
 */
export enum Flags {
    /**
     * Flag for node that has been validated.
     */
    VALIDATED = 0,

    /**
     * Flag for broken node that should be ignored.
     */
    BROKEN = 1,

    /**
     * Flag for unknown node that have not been typed.
     */
    UNKNOWN = 2,

    /**
     * Flag for unpacked node that has been changed its view:
     * Processing attribute node have been wrapped into another node and changed its location.
     */
    UNPACKED = 4,

    /**
     * Flag for type casted node that has been changed its view:
     * Processing node have been wrapped into another data type node.
     */
    TYPE_CASTED = 8,

    /**
     * Flag for context casted node that has been changed its view:
     * Processing node have been wrapped into another node.
     */
    NEST_CASTED = 16,

    /**
     * Flag for node that must be ignored in next processing.
     * It used for comment node, broken or unknown node.
     */
    IGNORABLE = 32,

    /**
     * Data node type has explicit name.
     */
    TARGET_TYPE_CASTED = 64,

    /**
     * Flag for type casted node that has been changed its view:
     * Processing node have been wrapped into another data type node.
     * Data node type has explicit name.
     */
    OBVIOUSLY_TYPE_CASTED = TARGET_TYPE_CASTED | TYPE_CASTED,
}

/**
 * Collection of internal expressions.
 * @todo Refactor it
 */
export interface IInternal {
    [name: string]: {
        /**
         * Internal expression.
         */
        data: ExpressionNode[];

        /**
         * Internal expression type. Always constant.
         * @todo Refactor it
         */
        type: 'text';
    };
}

/**
 * Declares abstract class for node of abstract syntax tree.
 */
export abstract class Ast {
    /**
     * Abstract syntax node key in the abstract syntax tree.
     */
    wsKey: number;

    /**
     * Processing flags.
     */
    wsFlags: Flags;
    wsIsRootNode: boolean;
    wsInternal: IInternal | null;
    wsInternalTree: any | null;
    wsContainer: any | null;
    wsUniqueIndex: number | null;

    /**
     * Flag for node that is container for component.
     */
    wsIsContainerNode: boolean;

    /**
     * Initialize new instance of abstract syntax node.
     * @param flags {Flags} Node flags.
     */
    protected constructor(flags: Flags = Flags.VALIDATED) {
        this.wsKey = 0;
        this.wsFlags = flags;
        this.wsIsRootNode = false;
        this.wsInternal = null;
        this.wsInternalTree = null;
        this.wsContainer = null;
        this.wsUniqueIndex = null;
        this.wsIsContainerNode = false;
    }

    /**
     * Check if abstract syntax node has processing flag.
     * @param flag {Flags} Concrete processing flag.
     */
    hasFlag(flag: Flags): boolean {
        return (this.wsFlags & flag) !== 0;
    }

    /**
     * Set processing flag.
     * @param flag {Flags} Concrete processing flag.
     */
    setFlag(flag: Flags): void {
        this.wsFlags = this.wsFlags | flag;
    }

    /**
     * Get internal node key.
     */
    getKey(): number {
        return this.wsKey;
    }

    /**
     * Set internal node key.
     * @param key {string} Key value.
     */
    setKey(key: number): void {
        this.wsKey = key;
    }

    /**
     * Accept visitor for abstract syntax node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    abstract accept(visitor: IAstVisitor, context: any): any;
}

/**
 * Abstract class for node of abstract syntax tree that
 * contains attributes and event handlers.
 */
export abstract class BaseHtmlElement extends Ast {
    /**
     * Collection of abstract syntax node attributes.
     */
    wsAttributes: IAttributes;

    /**
     * Collection of abstract syntax node event handlers.
     */
    wsEvents: IEvents;

    /**
     * Initialize new instance of abstract syntax node.
     * @param attributes {IAttributes} Collection of abstract syntax node attributes.
     * @param events {IEvents} Collection of abstract syntax node event handlers.
     */
    protected constructor(attributes: IAttributes, events: IEvents) {
        super();
        this.wsAttributes = attributes;
        this.wsEvents = events;
    }
}

/**
 * Abstract class for node of abstract syntax tree that
 * contains options and contents.
 */
export abstract class BaseWasabyElement extends BaseHtmlElement {
    /**
     * Collection of abstract syntax node options.
     */
    wsOptions: IOptions;

    /**
     * Collection of abstract syntax node contents.
     */
    wsContents: IContents;

    /**
     * Initialize new instance of abstract syntax node.
     * @param attributes {IAttributes} Collection of abstract syntax node attributes.
     * @param events {IEvents} Collection of abstract syntax node event handlers.
     * @param options {IOptions} Collection of abstract syntax node options.
     * @param contents {IContents} Collection of abstract syntax node contents.
     */
    protected constructor(
        attributes: IAttributes,
        events: IEvents,
        options: IOptions,
        contents: IContents
    ) {
        super(attributes, events);
        this.wsOptions = options;
        this.wsContents = contents;
    }

    /**
     * Set option or content option on component.
     * @param option {OptionNode | ContentOptionNode} Option or content option node.
     */
    setOption(option: OptionNode | ContentOptionNode): void {
        const name = option.wsName;
        if (this.hasOption(name)) {
            throw new Error(`Опция "${name}" уже определена на компоненте`);
        }
        if (option instanceof OptionNode) {
            this.wsOptions[name] = option;
            return;
        }
        if (option instanceof ContentOptionNode) {
            this.wsContents[name] = option;
            return;
        }
        throw new Error(
            `Произведена попытка установки опции ${name} недопустимого типа ${
                (<Ast>option).constructor.name
            }`
        );
    }

    /**
     * Check if component already has option or component option.
     * @param name {string} Option or component option name.
     */
    hasOption(name: string): boolean {
        return (
            this.wsOptions.hasOwnProperty(name) ||
            this.wsContents.hasOwnProperty(name)
        );
    }
}

// </editor-fold>

// <editor-fold desc="Attributes">

/**
 * Represents abstract syntax node for attribute.
 *
 * ```
 *    ...
 *    <htmlElement
 *       attribute="value" >
 *       ...
 *    <htmlElement>
 *    ...
 *    ...
 *    <component
 *       attr:attribute="value" >
 *       ...
 *    <component>
 *    ...
 * ```
 */
export class AttributeNode extends Ast {
    /**
     * Attribute name.
     */
    wsName: string;

    /**
     * Origin attribute name has attr prefix.
     * @deprecated
     */
    wsHasAttributePrefix: boolean;

    /**
     * Attribute value.
     */
    wsValue: TText[];

    /**
     * Initialize new instance of attribute node.
     * @param name {string} Attribute name.
     * @param value {TText[]} Attribute value.
     * @param hasAttributePrefix {boolean} Origin attribute name has attr prefix.
     */
    constructor(
        name: string,
        value: TText[],
        hasAttributePrefix: boolean = false
    ) {
        super();
        this.wsName = name;
        this.wsValue = value;
        this.wsHasAttributePrefix = hasAttributePrefix;
    }

    /**
     * Accept visitor for attribute node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitAttribute(this, context);
    }
}

/**
 * Represents node for simple option.
 *
 * ```
 *    ...
 *    <component
 *       option="value" >
 *       ...
 *    <component>
 *    ...
 *    <component>
 *       <ws:option>
 *          value
 *       </ws:option>
 *    <component>
 *    ...
 * ```
 */
export class OptionNode extends Ast {
    /**
     * Option name.
     */
    wsName: string;

    /**
     * Option value.
     */
    wsValue: TData;

    /**
     * Initialize new instance of option node.
     * @param name {string} Option name.
     * @param value {TData} Option value.
     */
    constructor(name: string, value: TData) {
        super();
        this.wsName = name;
        this.wsValue = value;
    }

    /**
     * Accept visitor for option node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitOption(this, context);
    }
}

/**
 * Represents abstract syntax node for content node option or root content of ws:partial or Component.
 *
 * ```
 *    ...
 *    <component>
 *       content
 *    <component>
 *    ...
 *    <component>
 *       <ws:content>
 *          content
 *       </ws:content>
 *    <component>
 *    ...
 *    <component>
 *       <ws:contentOption>
 *          content
 *       </ws:contentOption>
 *    <component>
 *    ...
 * ```
 */
export class ContentOptionNode extends Ast {
    /**
     * Content option name.
     */
    wsName: string;

    /**
     * Collection of content nodes.
     */
    wsContent: TContent[];

    /**
     * FIXME: for content option with type="string". Output is markup string.
     */
    wsIsStringType: boolean;

    /**
     * Initialize new instance of content option node.
     * @param name {string} Content option name.
     * @param content {TContent} Collection of content nodes.
     * @param isStringType {boolean} For content option with type="string". Output is markup string.
     */
    constructor(
        name: string,
        content: TContent[],
        isStringType: boolean = false
    ) {
        super();
        this.wsName = name;
        this.wsContent = content;
        this.wsIsStringType = isStringType;
    }

    /**
     * Accept visitor for content option node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitContentOption(this, context);
    }

    /**
     * Append content node.
     * @param ast {TContent} content node.
     */
    push(ast: TContent): void {
        this.wsContent.push(ast);
    }
}

/**
 * Represents node for binding expression.
 *
 * ```
 *    ...
 *    bind:option="otherOption"
 *    ...
 * ```
 */
export class BindNode extends Ast {
    /**
     * Binding property name.
     */
    wsProperty: string;

    /**
     * Target property name or expression.
     */
    wsValue: ProgramNode;

    /**
     * Initialize new instance of binding expression node.
     * @param property {string} Binding property name.
     * @param value {ProgramNode} Target property name or expression.
     */
    constructor(property: string, value: ProgramNode) {
        super();
        this.wsProperty = property;
        this.wsValue = value;
    }

    /**
     * Accept visitor for binding expression node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitBind(this, context);
    }
}

/**
 * Represents node for event handlers.
 *
 * ```
 *    ...
 *    on:eventName="handler(...arguments)"
 *    ...
 * ```
 */
export class EventNode extends Ast {
    /**
     * Event name.
     */
    wsEvent: string;

    /**
     * Event handler.
     */
    wsHandler: ProgramNode;

    /**
     * Initialize new instance of event handler node.
     * @param event {string} Event name.
     * @param handler {ProgramNode} Event handler.
     */
    constructor(event: string, handler: ProgramNode) {
        super();
        this.wsEvent = event;
        this.wsHandler = handler;
    }

    /**
     * Accept visitor for event handler node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitEvent(this, context);
    }
}

/**
 * Interface for attributes collection.
 */
export interface IAttributes {
    [attribute: string]: AttributeNode;
}

/**
 * Interface for options collection.
 */
export interface IOptions {
    [attribute: string]: OptionNode;
}

/**
 * Interface for content options collection.
 */
export interface IContents {
    [attribute: string]: ContentOptionNode;
}

/**
 * Interface for event handlers collection.
 */
export interface IEvents {
    [attribute: string]: EventNode | BindNode;
}

// </editor-fold>

// <editor-fold desc="Native HTML nodes">

/**
 * Represents node for element tag.
 *
 * ```
 *    <element attribute="value" on:event="handler">
 *       content
 *    </element>
 * ```
 */
export class ElementNode extends BaseHtmlElement {
    /**
     * Element name.
     */
    wsName: string;

    /**
     * Element content.
     */
    wsContent: TContent[];

    /**
     * Initialize new instance of element node.
     * @param name {string} Element name.
     * @param attributes {IAttributes} Collection of abstract syntax node attributes.
     * @param events {IEvents} Collection of abstract syntax node event handlers.
     * @param content {TContent[]} Element content.
     */
    constructor(
        name: string,
        attributes: IAttributes,
        events: IEvents,
        content: TContent[]
    ) {
        super(attributes, events);
        this.wsName = name;
        this.wsContent = content;
    }

    /**
     * Accept visitor for element node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitElement(this, context);
    }
}

/**
 * Represents node for doctype declaration.
 *
 * ```
 *    <!DOCTYPE content>
 * ```
 */
export class DoctypeNode extends Ast {
    /**
     * Doctype declaration text.
     */
    wsData: string;

    /**
     * Initialize new instance of doctype declaration node.
     * @param data {string} Doctype declaration text.
     */
    constructor(data: string) {
        super();
        this.wsData = data;
    }

    /**
     * Accept visitor for doctype declaration node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitDoctype(this, context);
    }
}

/**
 * Represents node for CData declaration.
 *
 * ```
 *    <![CDATA[ data ]]>
 * ```
 */
export class CDataNode extends Ast {
    /**
     * CData declaration data.
     */
    wsData: string;

    /**
     * Initialize new instance of CData declaration node.
     * @param data {string} CData declaration data.
     */
    constructor(data: string) {
        super();
        this.wsData = data;
    }

    /**
     * Accept visitor for CData declaration node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitCData(this, context);
    }
}

/**
 * Represents node for instruction.
 *
 * ```
 *    <? data ?>
 * ```
 */
export class InstructionNode extends Ast {
    /**
     * Instruction data.
     */
    wsData: string;

    /**
     * Initialize new instance of instruction node.
     * @param data {string} Instruction data.
     */
    constructor(data: string) {
        super();
        this.wsData = data;
    }

    /**
     * Accept visitor for instruction node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitInstruction(this, context);
    }
}

/**
 * Represents node for comment.
 *
 * ```
 *    <!-- data -->
 * ```
 */
export class CommentNode extends Ast {
    /**
     * Comment data.
     */
    wsData: string;

    /**
     * Initialize new instance of comment node.
     * @param data {string} Comment data.
     */
    constructor(data: string) {
        super(Flags.IGNORABLE);
        this.wsData = data;
    }

    /**
     * Accept visitor for comment node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitComment(this, context);
    }
}

// </editor-fold>

// <editor-fold desc="Wasaby directives">

/**
 * Represents node for component tag.
 *
 * ```
 *    <componentName attr:name="value" on:event="handler" option="value">
 *       content
 *    </componentName>
 * ```
 */
export class ComponentNode extends BaseWasabyElement {
    /**
     * Path to component.
     */
    wsPath: IPath;

    /**
     * Initialize new instance of component node.
     * @param path {IPath} Path to component.
     * @param attributes {IAttributes} Collection of abstract syntax node attributes.
     * @param events {IEvents} Collection of abstract syntax node event handlers.
     * @param options {IOptions} Collection of abstract syntax node options.
     * @param contents {IContents} Collection of abstract syntax node contents.
     */
    constructor(
        path: IPath,
        attributes: IAttributes,
        events: IEvents,
        options: IOptions,
        contents: IContents = {}
    ) {
        super(attributes, events, options, contents);
        this.wsPath = path;
    }

    /**
     * Accept visitor for component node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitComponent(this, context);
    }
}

/**
 * Represents node for ws:partial tag.
 * Used for resolving inline templates created with ws:template.
 *
 * ```
 *    <ws:partial template="name">
 *       content
 *    </ws:partial>
 * ```
 */
export class InlineTemplateNode extends BaseWasabyElement {
    /**
     * Inline template name.
     */
    wsName: string;

    /**
     * Need pass React Ref in an inline template method.
     */
    wsPassRef: boolean;

    /**
     * Initialize new instance of inline template node.
     * @param name {string} Partial template name or expression.
     * @param attributes {IAttributes} Collection of abstract syntax node attributes.
     * @param events {IEvents} Collection of abstract syntax node event handlers.
     * @param options {IOptions} Collection of abstract syntax node options.
     * @param contents {IContents} Collection of abstract syntax node contents.
     */
    constructor(
        name: string,
        attributes: IAttributes,
        events: IEvents,
        options: IOptions,
        contents: IContents = {}
    ) {
        super(attributes, events, options, contents);
        this.wsName = name;
        this.wsPassRef = false;
    }

    /**
     * Accept visitor for inline template node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitInlineTemplate(this, context);
    }
}

/**
 * Represents node for ws:partial tag.
 * Used for resolving physical templates.
 *
 * ```
 *    <ws:partial template="plugin!physical-path">
 *       content
 *    </ws:partial>
 * ```
 */
export class StaticPartialNode extends BaseWasabyElement {
    /**
     * Path to template file.
     */
    wsPath: IPath;

    /**
     * Initialize new instance of static partial node.
     * @param path {IPath} Path to template file.
     * @param attributes {IAttributes} Collection of abstract syntax node attributes.
     * @param events {IEvents} Collection of abstract syntax node event handlers.
     * @param options {IOptions} Collection of abstract syntax node options.
     * @param contents {IContents} Collection of abstract syntax node contents.
     */
    constructor(
        path: IPath,
        attributes: IAttributes,
        events: IEvents,
        options: IOptions,
        contents: IContents = {}
    ) {
        super(attributes, events, options, contents);
        this.wsPath = path;
    }

    /**
     * Accept visitor for static partial node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitStaticPartial(this, context);
    }
}

/**
 * Represents node for ws:partial tag.
 * Used for resolving template function from expression.
 *
 * ```
 *    <ws:partial template="{{ templateFunction }}">
 *       content
 *    </ws:partial>
 * ```
 */
export class DynamicPartialNode extends BaseWasabyElement {
    /**
     * Template function expression.
     */
    wsExpression: ProgramNode;

    /**
     * Initialize new instance of partial node.
     * @param expression {ProgramNode} Template function expression.
     * @param attributes {IAttributes} Collection of abstract syntax node attributes.
     * @param events {IEvents} Collection of abstract syntax node event handlers.
     * @param options {IOptions} Collection of abstract syntax node options.
     * @param contents {IContents} Collection of abstract syntax node contents.
     */
    constructor(
        expression: ProgramNode,
        attributes: IAttributes,
        events: IEvents,
        options: IOptions,
        contents: IContents = {}
    ) {
        super(attributes, events, options, contents);
        this.wsExpression = expression;
    }

    /**
     * Accept visitor for partial node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitDynamicPartial(this, context);
    }
}

/**
 * Represents node for ws:template tag.
 *
 * ```
 *    <ws:template name="templateName">
 *       content
 *    </ws:template>
 * ```
 */
export class TemplateNode extends Ast {
    /**
     * Template name.
     */
    wsName: string;

    /**
     * Template content.
     */
    wsContent: TContent[];

    /**
     * Initialize new instance of template node.
     * @param name {string} Template name.
     * @param content {TContent[]} Template content.
     */
    constructor(name: string, content: TContent[] = []) {
        super();
        this.wsName = name;
        this.wsContent = content;
    }

    /**
     * Accept visitor for template node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitTemplate(this, context);
    }
}

/**
 * Represents node for conditional ws:if tag.
 *
 * ```
 *    <ws:if data="{{ expression }}">
 *       content
 *    </ws:if>
 * ```
 */
export class IfNode extends Ast {
    /**
     * Test expression.
     */
    wsTest: ProgramNode;

    /**
     * Consequent content nodes.
     */
    wsConsequent: TContent[];

    /**
     * Alternate conditional node.
     */
    wsAlternate: ElseNode | null;

    /**
     * Initialize new instance of conditional node.
     */
    constructor() {
        super();
        this.wsTest = null;
        this.wsConsequent = null;
        this.wsAlternate = null;
    }

    setTest(test: ProgramNode): void {
        this.wsTest = test;
    }

    setConsequent(consequent: TContent[]): void {
        this.wsConsequent = consequent;
    }

    /**
     * Accept visitor for conditional node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitIf(this, context);
    }
}

/**
 * Represents node for conditional ws:else tag.
 *
 * ```
 *    <ws:else data="expression">
 *       content
 *    </ws:else>
 * ```
 */
export class ElseNode extends Ast {
    /**
     *
     */
    wsIsElseIf: boolean;

    /**
     * Consequent content nodes.
     */
    wsConsequent: TContent[];

    /**
     * Test expression. If not empty then node equals to "else if".
     */
    wsTest: ProgramNode | null;

    /**
     * Alternate conditional node.
     */
    wsAlternate: ElseNode | null;

    /**
     * Initialize new instance of conditional node.
     * @param isElseIf {boolean} If node represents "else if" notation.
     */
    constructor(isElseIf: boolean) {
        super();
        this.wsIsElseIf = isElseIf;
        this.wsConsequent = [];
        this.wsTest = null;
        this.wsAlternate = null;
    }

    setTest(test: ProgramNode): void {
        this.wsTest = test;
    }

    setConsequent(consequent: TContent[]): void {
        this.wsConsequent = consequent;
    }

    /**
     * Accept visitor for conditional node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitElse(this, context);
    }

    /**
     * Check if conditional node is else-if node.
     */
    isElseIf(): boolean {
        return this.wsIsElseIf;
    }
}

/**
 * Represents node for ws:for.
 *
 * ```
 *    <ws:for data="init; test; update">
 *       content
 *    </ws:for>
 * ```
 */
export class ForNode extends Ast {
    /**
     * Initialize expression.
     */
    wsInit: ProgramNode | null;

    /**
     * Required test expression.
     */
    wsTest: ProgramNode;

    /**
     * Update expression.
     */
    wsUpdate: ProgramNode | null;

    /**
     * Content nodes.
     */
    wsContent: TContent[];

    /**
     * Initialize new instance of cycle node.
     * @param init {ProgramNode | null} Initialize expression.
     * @param test {ProgramNode} Required test expression.
     * @param update {ProgramNode | null} Update expression.
     * @param content {TContent[]} Content nodes.
     */
    constructor(
        init: ProgramNode | null,
        test: ProgramNode,
        update: ProgramNode | null,
        content: TContent[]
    ) {
        super();
        this.wsInit = init;
        this.wsTest = test;
        this.wsUpdate = update;
        this.wsContent = content;
    }

    /**
     * Accept visitor for cycle node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitFor(this, context);
    }
}

/**
 * Represents node for ws:for.
 *
 * ```
 *    <ws:foreach data="[index, ] iterator in collection">
 *       content
 *    </ws:foreach>
 * ```
 */
export class ForeachNode extends Ast {
    /**
     * Name of iterator indexer.
     */
    wsIndex: ProgramNode | null;

    /**
     * Name of iterator.
     */
    wsIterator: ProgramNode;

    /**
     * Collection expression.
     */
    wsCollection: ProgramNode;

    /**
     * Content nodes.
     */
    wsContent: TContent[];

    /**
     * Initialize new instance of cycle node.
     * @param index {ProgramNode | null} Name of iterator.
     * @param iterator {ProgramNode} Collection expression.
     * @param collection {ProgramNode} Collection expression.
     * @param content {TContent[]} Content nodes.
     */
    constructor(
        index: ProgramNode | null,
        iterator: ProgramNode,
        collection: ProgramNode,
        content: TContent[]
    ) {
        super();
        this.wsIndex = index;
        this.wsIterator = iterator;
        this.wsCollection = collection;
        this.wsContent = content;
    }

    /**
     * Accept visitor for cycle node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitForeach(this, context);
    }
}

// </editor-fold>

// <editor-fold desc="WaSaby data directives">

/**
 * Represents node for ws:Array tag.
 *
 * ```
 *    <ws:Array>
 *       elements
 *    </ws:Array>
 * ```
 */
export class ArrayNode extends Ast {
    /**
     * Array elements.
     */
    wsElements: TData[];

    /**
     * Initialize new instance of array node.
     * @param elements {TData[]} Array elements.
     */
    constructor(elements: TData[] = []) {
        super();
        this.wsElements = elements;
    }

    /**
     * Accept visitor for array node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitArray(this, context);
    }
}

/**
 * Represents node for ws:Boolean tag.
 *
 * ```
 *    <ws:Boolean>
 *       content
 *    </ws:Boolean>
 * ```
 */
export class BooleanNode extends Ast {
    /**
     * Data of boolean type.
     */
    wsData: TText[];

    /**
     * Initialize new instance of boolean node.
     * @param data {TText[]} Data of boolean type.
     */
    constructor(data: TText[]) {
        super();
        this.wsData = data;
    }

    /**
     * Accept visitor for abstract boolean node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitBoolean(this, context);
    }
}

/**
 * Represents node for ws:Function tag.
 *
 * ```
 *    <ws:Function option="value">
 *       path
 *    </ws:Function>
 * ```
 */
export class FunctionNode extends Ast {
    /**
     * Function expression.
     */
    wsFunctionExpression: TText[];

    /**
     * Collection of function options.
     */
    wsOptions: IOptions;

    /**
     * Initialize new instance of function node.
     * @param functionExpression {TText[]} Path to function.
     * @param options {IOptions} Collection of function options.
     */
    constructor(functionExpression: TText[], options: IOptions = {}) {
        super();
        this.wsFunctionExpression = functionExpression;
        this.wsOptions = options;
    }

    /**
     * Accept visitor for abstract function node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitFunction(this, context);
    }
}

/**
 * Represents node for ws:Number tag.
 *
 * ```
 *    <ws:Number>
 *       content
 *    </ws:Number>
 * ```
 */
export class NumberNode extends Ast {
    /**
     * Data representation.
     */
    wsData: TText[];

    /**
     * Initialize new instance of number node.
     * @param data {string} Data representation.
     */
    constructor(data: TText[]) {
        super();
        this.wsData = data;
    }

    /**
     * Accept visitor for number node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitNumber(this, context);
    }
}

/**
 * Interface of object node properties.
 */
export interface IObjectProperties {
    [name: string]: OptionNode | ContentOptionNode;
}

/**
 * Represents node for ws:Object tag.
 *
 * ```
 *    <ws:Object>
 *       <ws:property>
 *          content
 *       </ws:property>
 *    </ws:Object>
 * ```
 */
export class ObjectNode extends Ast {
    /**
     * Collection of object properties.
     */
    wsProperties: IObjectProperties;

    /**
     * Initialize new instance of object node.
     * @param properties {IObjectProperties} Collection of object properties.
     */
    constructor(properties: IObjectProperties) {
        super();
        this.wsProperties = properties;
    }

    /**
     * Accept visitor for object node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitObject(this, context);
    }
}

/**
 * Represents node for ws:String tag.
 *
 * ```
 *    <ws:String>
 *       content
 *    </ws:String>
 * ```
 */
export class StringNode extends Ast {
    /**
     * Data representation.
     */
    wsData: TText[];

    /**
     * Initialize new instance of string node.
     * @param data {TText[]} Data representation.
     */
    constructor(data: TText[]) {
        super();
        this.wsData = data;
    }

    /**
     * Accept visitor for string node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitString(this, context);
    }
}

/**
 * Represents node for ws:Value tag.
 *
 * ```
 *    <ws:Value>
 *       content
 *    </ws:Value>
 * ```
 */
export class ValueNode extends Ast {
    /**
     * Data representation.
     */
    wsData: TText[];

    /**
     * Initialize new instance of value node.
     * @param data {TText[]} Data representation.
     */
    constructor(data: TText[]) {
        super();
        this.wsData = data;
    }

    /**
     * Accept visitor for value node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitValue(this, context);
    }
}

// </editor-fold>

// <editor-fold desc="Wasaby text">

/**
 * Represents node for shared text that includes text, translation and expression.
 */
export class TextNode extends Ast {
    /**
     * Text content.
     */
    wsContent: TText[];

    /**
     * Initialize new instance of shared text node.
     * @param content {TText[]} Text content.
     */
    constructor(content: TText[] = []) {
        super();
        this.wsContent = content;
    }

    /**
     * Accept visitor for shared text node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitText(this, context);
    }
}

/**
 * Represents node for text.
 */
export class TextDataNode extends Ast {
    /**
     * Text content.
     */
    wsContent: string;

    /**
     * Initialize new instance of text node.
     * @param content {string} Text content.
     */
    constructor(content: string) {
        super();
        this.wsContent = unescape(content);
    }

    /**
     * Accept visitor for text node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitTextData(this, context);
    }
}

/**
 * Represents node for mustache expression.
 *
 * ```
 *    {{ javascript expression }}
 * ```
 */
export class ExpressionNode extends Ast {
    /**
     * Program node of mustache expression.
     */
    wsProgram: ProgramNode;

    /**
     * Initialize new instance of mustache expression node.
     * @param program
     */
    constructor(program: ProgramNode) {
        super();
        this.wsProgram = program;
    }

    /**
     * Accept visitor for mustache expression node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitExpression(this, context);
    }
}

/**
 * Represents node for translatable text.
 *
 * ```
 *    {[ [ translation context @@ ] translatable text ]}
 * ```
 */
export class TranslationNode extends Ast {
    /**
     * Translatable text.
     */
    wsText: string;

    /**
     * Translation context.
     */
    wsContext: string;

    /**
     * Initialize new instance of translation node.
     * @param text {string} Translatable text.
     * @param context {string} Translation context.
     */
    constructor(text: string, context: string = '') {
        super();
        this.wsText = unescape(text);
        this.wsContext = context;
    }

    /**
     * Accept visitor for translation node.
     * @param visitor {IAstVisitor} Concrete visitor.
     * @param context {*} Concrete visitor context.
     */
    accept(visitor: IAstVisitor, context: any): any {
        return visitor.visitTranslation(this, context);
    }
}

// </editor-fold>
