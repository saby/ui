/**
 * @author Krylov M.A.
 *
 * Модуль обработки подкласса mustache выражений -- конструкций типа bind.
 */

import type {
    Node,
    ArrayExpressionNode,
    BinaryExpressionNode,
    CallExpressionNode,
    ConditionalExpressionNode,
    IdentifierNode,
    LiteralNode,
    LogicalExpressionNode,
    MemberExpressionNode,
    ObjectExpressionNode,
    ProgramNode,
    SequenceExpressionNode,
    UnaryExpressionNode,
    DecoratorCallNode,
    DecoratorChainCallNode,
    DecoratorChainContext
} from '../../expressions/Nodes';

import type { IExpressionOptions, IExpressionMeta } from './Expression';

import ExpressionGenerator from './Expression';

/**
 * Event visitor processing state.
 */
enum BindVisitorState {

    /**
     * Initial state at the top of program node.
     */
    INITIAL,

    /**
     * Caught identifier node at first.
     * Generate setter for this node and getter for other nodes.
     */
    IDENTIFIER,

    /**
     * Caught member expression node at first.
     * Generate setter for this node and getter for other nodes.
     */
    MEMBER,
}

/**
 * Current processing context.
 * Warning! Options mustn't be re-created during generate process.
 *
 * @private
 */
interface IContext extends IExpressionOptions {

    /**
     * Identifier name which is used in generating setter function call.
     */
    setterValue: string;
}

export default class BindGenerator extends ExpressionGenerator {
    private state: BindVisitorState;

    generate(node: Node, options: IContext): IExpressionMeta<string> {
        return super.generate(node, options);
    }

    visitProgramNode(node: ProgramNode, context: IContext): string {
        this.state = BindVisitorState.INITIAL;

        return super.visitProgramNode(node, context);
    }

    visitArrayExpressionNode(node: ArrayExpressionNode, context: IContext): string {
        if (this.state === BindVisitorState.INITIAL) {
            throw new Error('запрещено объявлять массив в корне bind-выражения');
        }

        return super.visitArrayExpressionNode(node, context);
    }

    visitObjectExpressionNode(node: ObjectExpressionNode, context: IContext): string {
        if (this.state === BindVisitorState.INITIAL) {
            throw new Error('запрещено объявлять объект в корне bind-выражения');
        }

        return super.visitObjectExpressionNode(node, context);
    }

    visitSequenceExpressionNode(node: SequenceExpressionNode, context: IContext): string {
        if (this.state === BindVisitorState.INITIAL) {
            throw new Error(
                'запрещено использовать перечисление (sequence expression) в корне bind-выражения'
            );
        }

        return super.visitSequenceExpressionNode(node, context);
    }

    visitUnaryExpressionNode(node: UnaryExpressionNode, context: IContext): string {
        if (this.state === BindVisitorState.INITIAL) {
            throw new Error('запрещено использовать унарный оператор в корне bind-выражения');
        }

        return super.visitUnaryExpressionNode(node, context);
    }

    visitBinaryExpressionNode(node: BinaryExpressionNode, context: IContext): string {
        if (this.state === BindVisitorState.INITIAL) {
            throw new Error('запрещено использовать бинарный оператор в корне bind-выражения');
        }

        return super.visitBinaryExpressionNode(node, context);
    }

    visitLogicalExpressionNode(node: LogicalExpressionNode, context: IContext): string {
        if (this.state === BindVisitorState.INITIAL) {
            throw new Error('запрещено использовать логический оператор в корне bind-выражения');
        }

        return super.visitLogicalExpressionNode(node, context);
    }

    visitConditionalExpressionNode(node: ConditionalExpressionNode, context: IContext): string {
        if (this.state === BindVisitorState.INITIAL) {
            throw new Error('запрещено использовать тернарный оператор в корне bind-выражения');
        }

        return super.visitConditionalExpressionNode(node, context);
    }

    visitCallExpressionNode(node: CallExpressionNode, context: IContext): string {
        if (this.state === BindVisitorState.INITIAL) {
            throw new Error(
                'запрещено выполнять bind на вызов функции. Вместо a.b.c.get("field") нужно использовать a.b.c["field"]'
            );
        }

        return super.visitCallExpressionNode(node, context);
    }

    visitMemberExpressionNode(node: MemberExpressionNode, context: IContext): string {
        const isRootExpression = this.state === BindVisitorState.INITIAL;
        if (!isRootExpression) {
            return super.visitMemberExpressionNode(node, context);
        }
        this.state = BindVisitorState.MEMBER;

        const { dataSource, path } = this.resolveMemberProperty(node, context);

        if (path.length === 2 && path[0] === '"_options"') {
            throw new Error(
                'запрещено использовать bind на свойства объекта _options: данный объект заморожен'
            );
        }

        this.flags.hasMethodsReference = true;

        this.updateFunctionParameters(dataSource, context);

        return this.methods.setter(dataSource, path, context.setterValue);
    }

    visitIdentifierNode(node: IdentifierNode, context: IContext): string {
        const isRootExpression = this.state === BindVisitorState.INITIAL;
        if (!isRootExpression) {
            return super.visitIdentifierNode(node, context);
        }
        this.state = BindVisitorState.IDENTIFIER;

        const resolved = this.resolveIdentifier(node, context);

        if (resolved !== null) {
            return resolved;
        }

        this.flags.hasMethodsReference = true;

        this.updateFunctionParameters(context.dataSource, context);

        return this.methods.setter(context.dataSource, [`"${node.name}"`], context.setterValue);
    }

    visitLiteralNode(node: LiteralNode, context: IContext): string {
        if (this.state === BindVisitorState.INITIAL) {
            throw new Error('запрещено выполнять bind на литералы');
        }

        return super.visitLiteralNode(node, context);
    }

    visitDecoratorChainCallNode(_node: DecoratorChainCallNode, _context: IContext): string {
        throw new Error('запрещено использовать декораторы в bind-выражениях');
    }

    visitDecoratorChainContext(_node: DecoratorChainContext, _context: IContext): string {
        throw new Error('запрещено использовать декораторы в bind-выражениях');
    }

    visitDecoratorCallNode(_node: DecoratorCallNode, _context: IContext): string {
        throw new Error('запрещено использовать декораторы в bind-выражениях');
    }
}
