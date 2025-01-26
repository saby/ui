/* eslint-disable max-classes-per-file */

export interface IExpressionVisitor<TContext, TReturn> {
    visitProgramNode(node: ProgramNode, context?: TContext): TReturn;
    visitEmptyStatementNode(node: EmptyStatementNode, context?: TContext): TReturn;
    visitExpressionStatementNode(node: ExpressionStatementNode, context?: TContext): TReturn;
    visitThisExpressionNode(node: ThisExpressionNode, context?: TContext): TReturn;
    visitArrayExpressionNode(node: ArrayExpressionNode, context?: TContext): TReturn;
    visitObjectExpressionNode(node: ObjectExpressionNode, context?: TContext): TReturn;
    visitSequenceExpressionNode(node: SequenceExpressionNode, context?: TContext): TReturn;
    visitUnaryExpressionNode(node: UnaryExpressionNode, context?: TContext): TReturn;
    visitBinaryExpressionNode(node: BinaryExpressionNode, context?: TContext): TReturn;
    visitLogicalExpressionNode(node: LogicalExpressionNode, context?: TContext): TReturn;
    visitConditionalExpressionNode(node: ConditionalExpressionNode, context?: TContext): TReturn;
    visitCallExpressionNode(node: CallExpressionNode, context?: TContext): TReturn;
    visitMemberExpressionNode(node: MemberExpressionNode, context?: TContext): TReturn;
    visitDecoratorChainCallNode(node: DecoratorChainCallNode, context?: TContext): TReturn;
    visitDecoratorChainContext(node: DecoratorChainContext, context?: TContext): TReturn;
    visitDecoratorCallNode(node: DecoratorCallNode, context?: TContext): TReturn;
    visitIdentifierNode(node: IdentifierNode, context?: TContext): TReturn;
    visitExpressionBrace(node: ExpressionBrace, context?: TContext): TReturn;
    visitLiteralNode(node: LiteralNode, context?: TContext): TReturn;
}

export interface IPosition {
    line: number;
    column: number;
}

export interface ISourceLocation {
    start: IPosition;
    end: IPosition;
}

export abstract class Node {
    loc: ISourceLocation;
    /// @deprecated Use visitors.
    type: string;
    /// @deprecated Use visitors.
    string: string;

    protected constructor(type: string, loc: ISourceLocation) {
        this.type = type;
        this.loc = loc;
        this.string = '';
    }

    abstract accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn;
}

export class ProgramNode extends Node {
    referenceId: number;
    body: Node[];

    constructor(body: Node[], loc: ISourceLocation) {
        super('Program', loc);
        this.referenceId = -1;
        this.body = body;
        if (body) {
            this.string = body[0].string;
        }
    }

    accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn {
        return visitor.visitProgramNode(this, context);
    }
}

export class EmptyStatementNode extends Node {
    constructor(loc: ISourceLocation) {
        super('EmptyStatement', loc);
        this.string = '';
    }

    accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn {
        return visitor.visitEmptyStatementNode(this, context);
    }
}

export class ExpressionStatementNode extends Node {
    expression: Node;

    constructor(expression: Node, loc: ISourceLocation) {
        super('ExpressionStatement', loc);
        this.expression = expression;
        if (expression) {
            this.string = expression.string;
        }
    }

    accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn {
        return visitor.visitExpressionStatementNode(this, context);
    }
}

export class ThisExpressionNode extends Node {
    constructor(discriminant: Node, cases: Node[], loc: ISourceLocation) {
        super('ThisExpression', loc);
        this.string = 'this';
    }

    accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn {
        return visitor.visitThisExpressionNode(this, context);
    }
}

export class ArrayExpressionNode extends Node {
    elements: Node[];

    constructor(elements: Node[], loc: ISourceLocation) {
        super('ArrayExpression', loc);
        this.elements = elements;
        this.string = '[';
        for (let i = 0; i < elements.length; ++i) {
            if (i !== 0) {
                this.string += ', ';
            }
            this.string += elements[i].string;
        }
        this.string += ']';
    }

    accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn {
        return visitor.visitArrayExpressionNode(this, context);
    }
}

export interface IObjectProperty {
    key: LiteralNode | IdentifierNode;
    value: Node;
}

export class ObjectExpressionNode extends Node {
    properties: IObjectProperty[];

    constructor(properties: IObjectProperty[], loc: ISourceLocation) {
        super('ObjectExpression', loc);
        this.properties = properties;
        this.string = '{';
        for (let i = 0; i < properties.length; ++i) {
            if (i !== 0) {
                this.string += ',';
            }
            this.string += ` ${properties[i].key.string}: ${properties[i].value.string}`;
        }
        this.string += ' }';
    }

    accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn {
        return visitor.visitObjectExpressionNode(this, context);
    }
}

export class SequenceExpressionNode extends Node {
    expressions: Node[];

    constructor(expressions: Node[], loc: ISourceLocation) {
        super('SequenceExpression', loc);
        this.expressions = expressions;
        for (let i = 0; i < expressions.length; ++i) {
            if (i !== 0) {
                this.string += ', ';
            }
            this.string += expressions[i].string;
        }
    }

    accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn {
        return visitor.visitSequenceExpressionNode(this, context);
    }
}

export class UnaryExpressionNode extends Node {
    operator: string;
    prefix: boolean;
    argument: Node;
    // FIXME: Разобраться!!!
    value: any;

    constructor(operator: string, prefix: boolean, argument: Node, loc: ISourceLocation) {
        super('UnaryExpression', loc);
        this.operator = operator;
        this.prefix = prefix;
        this.argument = argument;
        if (argument) {
            if (prefix) {
                this.string = operator + argument.string;
            } else {
                this.string = argument.string + operator;
            }
        }
    }

    accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn {
        return visitor.visitUnaryExpressionNode(this, context);
    }
}

export class BinaryExpressionNode extends Node {
    operator: string;
    left: Node;
    right: Node;

    constructor(operator: string, left: Node, right: Node, loc: ISourceLocation) {
        super('BinaryExpression', loc);
        this.operator = operator;
        this.left = left;
        this.right = right;
        if (left && right) {
            this.string = `${left.string} ${operator} ${right.string}`;
        }
    }

    accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn {
        return visitor.visitBinaryExpressionNode(this, context);
    }
}

export class LogicalExpressionNode extends Node {
    operator: string;
    left: Node;
    right: Node;

    constructor(operator: string, left: Node, right: Node, loc: ISourceLocation) {
        super('LogicalExpression', loc);
        this.operator = operator;
        this.left = left;
        this.right = right;
        if (left && right) {
            this.string = `${left.string} ${operator} ${right.string}`;
        }
    }

    accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn {
        return visitor.visitLogicalExpressionNode(this, context);
    }
}

export class ConditionalExpressionNode extends Node {
    test: Node;
    consequent: Node;
    alternate: Node;

    constructor(test: Node, consequent: Node, alternate: Node, loc: ISourceLocation) {
        super('ConditionalExpression', loc);
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
        if (test && consequent) {
            if (alternate) {
                this.string = test.string + ' ? ' + consequent.string + ' : ' + alternate.string;
            } else {
                this.string = test.string + ' ? ' + consequent.string;
            }
        }
    }

    accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn {
        return visitor.visitConditionalExpressionNode(this, context);
    }
}

export class CallExpressionNode extends Node {
    callee: IdentifierNode | MemberExpressionNode;
    arguments: Node[];

    constructor(callee: IdentifierNode | MemberExpressionNode, args: Node[], loc: ISourceLocation) {
        super('CallExpression', loc);
        this.callee = callee;
        this.arguments = args;
        if (callee) {
            this.string = callee.string + '(';
            for (let i = 0; i < args.length; ++i) {
                if (i !== 0) {
                    this.string += ', ';
                }
                this.string += args[i].string;
            }
            this.string += ')';
        }
    }

    accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn {
        return visitor.visitCallExpressionNode(this, context);
    }
}

export class MemberExpressionNode extends Node {
    object: MemberExpressionNode | IdentifierNode;
    property: Node;
    computed: boolean;

    constructor(
        object: MemberExpressionNode | IdentifierNode,
        property: IdentifierNode,
        computed: boolean,
        loc: ISourceLocation
    ) {
        super('MemberExpression', loc);
        this.object = object;
        this.property = property;
        this.computed = computed;
        if (object && property) {
            if (computed) {
                this.string = object.string + '[' + property.string + ']';
            } else {
                this.string = object.string + '.' + property.string;
            }
        }
    }

    accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn {
        return visitor.visitMemberExpressionNode(this, context);
    }
}

export class DecoratorChainCallNode extends Node {
    identifier: string;
    argumentsDecorator: Node[];

    constructor(identifier: string, argumentsDecorator: Node[], loc: ISourceLocation) {
        super('DecoratorChainCall', loc);
        this.identifier = identifier;
        this.argumentsDecorator = argumentsDecorator || [];
        this.string = identifier;
        if (argumentsDecorator) {
            this.string += ': ';
            for (let i = 0; i < argumentsDecorator.length; ++i) {
                if (i !== 0) {
                    this.string += ', ';
                }
                this.string += argumentsDecorator[i].string;
            }
        }
    }

    accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn {
        return visitor.visitDecoratorChainCallNode(this, context);
    }
}

export class DecoratorChainContext extends Node {
    fn: DecoratorChainCallNode;
    entity: DecoratorChainContext | undefined;

    constructor(
        fn: DecoratorChainCallNode,
        entity: DecoratorChainContext | undefined,
        loc: ISourceLocation
    ) {
        super('DecoratorChainContext', loc);
        this.fn = fn;
        this.entity = entity;
        this.string = '';
        if (entity) {
            this.string += entity.string + ' | ';
        }
        this.string += fn.string;
    }

    accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn {
        return visitor.visitDecoratorChainContext(this, context);
    }
}

export class DecoratorCallNode extends Node {
    decorator: DecoratorChainContext;
    caller: IdentifierNode;

    constructor(decorator: DecoratorChainContext, caller: IdentifierNode, loc: ISourceLocation) {
        super('DecoratorCall', loc);
        this.decorator = decorator;
        this.caller = caller;
        if (caller) {
            this.string = caller.string + ' | ' + decorator.string;
        } else {
            this.string = '| ' + decorator.string;
        }
    }

    accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn {
        return visitor.visitDecoratorCallNode(this, context);
    }
}

export class IdentifierNode extends Node {
    name: string;

    constructor(name: string, loc: ISourceLocation) {
        super('Identifier', loc);
        this.name = name;
        this.string = name;
    }

    accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn {
        return visitor.visitIdentifierNode(this, context);
    }
}

export class ExpressionBrace extends Node {
    name: Node;

    constructor(expression: Node, loc: ISourceLocation) {
        super('Brace', loc);
        this.name = expression;
        this.string = '(' + expression.string + ')';
    }

    accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn {
        return visitor.visitExpressionBrace(this, context);
    }
}

export class LiteralNode extends Node {
    value: string;

    constructor(value: string, isString: boolean, loc: ISourceLocation) {
        super('Literal', loc);
        this.value = value;
        if (isString) {
            this.value = this.value.trim().replace(/^['"](.*)['"]$/, '$1');
        }
        this.string = value;
    }

    accept<TContext, TReturn>(visitor: IExpressionVisitor<TContext, TReturn>, context?: TContext): TReturn {
        return visitor.visitLiteralNode(this, context);
    }
}

/* eslint-enable max-classes-per-file */
