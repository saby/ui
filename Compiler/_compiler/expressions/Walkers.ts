/**
 * @author Krylov M.A.
 */

import type {
    IExpressionVisitor,
    Node,
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
    LiteralNode,
    LogicalExpressionNode,
    MemberExpressionNode,
    ObjectExpressionNode,
    IObjectProperty,
    ProgramNode,
    SequenceExpressionNode,
    ThisExpressionNode,
    UnaryExpressionNode
} from './Nodes';

import { IdentifierNode } from './Nodes';
import { Parser } from './Parser';

export interface IWalkerHooks {
    [nodeType: string]: (node: Node) => void;
}

/**
 * Обойти дерево выражения Program Node, выполнив callback-функции на нужных узлах.
 * @param expression Program Node выражение.
 * @param cbs Объект callback-функций.
 */
export class Walker implements IExpressionVisitor<void, void> {
    readonly hooks: IWalkerHooks;

    constructor(hooks: IWalkerHooks) {
        this.hooks = hooks;
    }

    visitArrayExpressionNode(node: ArrayExpressionNode): void {
        for (let index = 0; index < node.elements.length; ++index) {
            node.elements[index].accept(this);
        }

        if (this.hooks[node.type]) {
            this.hooks[node.type](node);
        }
    }

    visitBinaryExpressionNode(node: BinaryExpressionNode): void {
        node.left.accept(this);
        node.right.accept(this);

        if (this.hooks[node.type]) {
            this.hooks[node.type](node);
        }
    }

    visitCallExpressionNode(node: CallExpressionNode): void {
        node.callee.accept(this);

        if (node.arguments) {
            for (let index = 0; index < node.arguments.length; ++index) {
                node.arguments[index].accept(this);
            }
        }

        if (this.hooks[node.type]) {
            this.hooks[node.type](node);
        }
    }

    visitConditionalExpressionNode(node: ConditionalExpressionNode): void {
        node.test.accept(this);

        node.consequent.accept(this);

        if (node.alternate) {
            node.alternate.accept(this);
        }

        if (this.hooks[node.type]) {
            this.hooks[node.type](node);
        }
    }

    visitDecoratorCallNode(node: DecoratorCallNode): void {
        node.caller.accept(this);
        node.decorator.accept(this);
        if (this.hooks[node.type]) {
            this.hooks[node.type](node);
        }
    }

    visitDecoratorChainCallNode(node: DecoratorChainCallNode): void {
        if (node.argumentsDecorator) {
            for (let index = 0; index < node.argumentsDecorator.length; ++index) {
                node.argumentsDecorator[index].accept(this);
            }
        }

        if (this.hooks[node.type]) {
            this.hooks[node.type](node);
        }
    }

    visitDecoratorChainContext(node: DecoratorChainContext): void {
        node.fn.accept(this);

        if (node.entity) {
            node.entity.accept(this);
        }

        if (this.hooks[node.type]) {
            this.hooks[node.type](node);
        }
    }

    visitEmptyStatementNode(node: EmptyStatementNode): void {
        if (this.hooks[node.type]) {
            this.hooks[node.type](node);
        }
    }

    visitExpressionBrace(node: ExpressionBrace): void {
        node.name.accept(this);

        if (this.hooks[node.type]) {
            this.hooks[node.type](node);
        }
    }

    visitExpressionStatementNode(node: ExpressionStatementNode): void {
        node.expression.accept(this);

        if (this.hooks[node.type]) {
            this.hooks[node.type](node);
        }
    }

    visitIdentifierNode(node: IdentifierNode): void {
        if (this.hooks[node.type]) {
            this.hooks[node.type](node);
        }
    }

    visitLiteralNode(node: LiteralNode): void {
        if (this.hooks[node.type]) {
            this.hooks[node.type](node);
        }
    }

    visitLogicalExpressionNode(node: LogicalExpressionNode): void {
        node.left.accept(this);
        node.right.accept(this);

        if (this.hooks[node.type]) {
            this.hooks[node.type](node);
        }
    }

    visitMemberExpressionNode(node: MemberExpressionNode): void {
        node.object.accept(this);

        if (node.computed) {
            node.property.accept(this);
        }

        if (this.hooks[node.type]) {
            this.hooks[node.type](node);
        }
    }

    visitObjectExpressionNode(node: ObjectExpressionNode): void {
        node.properties.forEach((property: IObjectProperty) => {
            const key = property.key;
            const value = property.value;

            key.accept(this);
            value.accept(this);
        });

        if (this.hooks[node.type]) {
            this.hooks[node.type](node);
        }
    }

    visitProgramNode(node: ProgramNode): void {
        for (let index = 0; index < node.body.length; ++index) {
            node.body[index].accept(this);
        }

        if (this.hooks[node.type]) {
            this.hooks[node.type](node);
        }
    }

    visitSequenceExpressionNode(node: SequenceExpressionNode): void {
        for (let index = 0; index < node.expressions.length; ++index) {
            node.expressions[index].accept(this);
        }

        if (this.hooks[node.type]) {
            this.hooks[node.type](node);
        }
    }

    visitThisExpressionNode(node: ThisExpressionNode): void {
        if (this.hooks[node.type]) {
            this.hooks[node.type](node);
        }
    }

    visitUnaryExpressionNode(node: UnaryExpressionNode): void {
        node.argument.accept(this);
        if (this.hooks[node.type]) {
            this.hooks[node.type](node);
        }
    }
}

export function collectIdentifiers(node: Node): string[] {
    const identifiers: string[] = [];

    node.accept(new Walker({
        Identifier: (identifierNode: IdentifierNode): void => {
            const identifier = identifierNode.name;
            // Do not produce duplicates
            if (identifiers.indexOf(identifier) === -1) {
                identifiers.push(identifierNode.name);
            }
        }
    }));

    return identifiers;
}

export function containsTranslationFunction(node: Node): boolean {
    let containsTranslation: boolean = false;

    node.accept(new Walker({
        CallExpression: (callExpressionNode: CallExpressionNode): void => {
            const callee = callExpressionNode.callee;

            if (!(callee instanceof IdentifierNode)) {
                return;
            }

            if (callee.name === 'rk') {
                containsTranslation = true;
            }
        },
    }));

    return containsTranslation;
}

const BIND_SUBPROGRAMS_SHIFT: number = -2;

let parser;
export function dropBindProgram(program: ProgramNode): ProgramNode[] {
    if (!parser) {
        parser = new Parser();
    }

    const programs: ProgramNode[] = [];

    program.accept(new Walker({
        Identifier: (node: IdentifierNode): void => {
            programs.push(parser.parse(node.name));
        },
        MemberExpression: (node: MemberExpressionNode): void => {
            programs.push(parser.parse(node.string));
        }
    }));

    // We need to return value-program and object-program.
    // Ex. for "a.b.c.d.e" we only return "a.b.c.d" and "a.b.c.d.e".
    return programs.slice(BIND_SUBPROGRAMS_SHIFT);
}

export function containsFunctionCall(program: Node): boolean {
    let hasFunctionCall = false;

    program.accept(new Walker({
        CallExpression: (): void => {
            hasFunctionCall = true;
        }
    }));

    return hasFunctionCall;
}

export function containsIdentifiers(node: Node, identifiers: string[]): boolean {
    let hasLocalIdentifier = false;

    node.accept(new Walker({
        Identifier: (identifierNode: IdentifierNode): void => {
            if (identifiers.indexOf(identifierNode.name) > -1) {
                hasLocalIdentifier = true;
            }
        }
    }));

    return hasLocalIdentifier;
}

export function hasDecorators(node: Node): boolean {
    let contains = false;

    node.accept(new Walker({
        DecoratorChainCall: (): void => {
            contains = true;
        },
        DecoratorChainContext: (): void => {
            contains = true;
        },
        DecoratorCall: (): void => {
            contains = true;
        }
    }));

    return contains;
}
