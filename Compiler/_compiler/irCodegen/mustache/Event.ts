/**
 * @author Krylov M.A.
 *
 * Модуль обработки подкласса mustache выражений -- конструкций типа event.
 */

import type {
    Node,
    CallExpressionNode,
    IdentifierNode,
    MemberExpressionNode,
    ProgramNode
} from '../../expressions/Nodes';

import type { IExpressionOptions, IExpressionMeta } from './Expression';

import Flags from './Flags';
import ExpressionGenerator from './Expression';

/**
 * Event visitor processing state.
 */
enum EventVisitorState {
    INITIAL,

    /**
     * Processing any other statements.
     * Before first function call.
     */
    BEFORE_HANDLER,

    /**
     * Processing handler expression.
     * Caught first function call.
     */
    IN_HANDLER,

    /**
     * Processing possible member expression to detect it's context.
     */
    IN_CONTEXT,

    /**
     * Processing event handler arguments.
     */
    IN_ARGUMENTS,

    /**
     * Processing any other statements.
     * After first function call.
     */
    AFTER_HANDLER,
}

/**
 * Interface of generation result.
 * Warning! Only in this visitor it's allowed to clone context.
 *
 * @private
 */
export interface IEventMeta<TFunction> extends IExpressionMeta<TFunction> {

    /**
     * Collection of event handler arguments.
     */
    args: IExpressionMeta<string>[];

    /**
     * Detected handler name.
     */
    handlerName: string | null;

    /**
     * Generated function which evaluates event handler context.
     */
    context: string;

    /**
     * Generated content of context function.
     */
    contextContent: string;
}

export default class EventGenerator extends ExpressionGenerator {
    private args: IExpressionMeta<string>[];
    private handlerName: string | null;
    private context: string;
    private state: EventVisitorState;

    private contextFlags: Flags;

    generate(node: Node, options: IExpressionOptions): IEventMeta<string> {
        this.contextFlags = new Flags();

        const meta = super.generate(node, options) as IEventMeta<string>;

        if (this.state === EventVisitorState.AFTER_HANDLER) {
            meta.args = this.args;
            meta.handlerName = this.handlerName;
            meta.context = super.generateFunction(this.context, this.contextFlags, options);
            meta.contextContent = this.context;

            return meta;
        }

        throw new Error('ожидалось, что обработчик события является функцией');
    }

    visitProgramNode(node: ProgramNode, context: IExpressionOptions): string {
        if (node.body.length !== 1) {
            throw new Error('ожидалось, что обработчик события - единственное выражение');
        }

        this.state = EventVisitorState.BEFORE_HANDLER;
        this.handlerName = null;
        this.args = [];

        this.context = this.source.self;
        this.contextFlags.hasSelfReference = true;

        return node.body[0].accept(this, context);
    }

    visitCallExpressionNode(node: CallExpressionNode, context: IExpressionOptions): string {
        if (this.state !== EventVisitorState.BEFORE_HANDLER) {
            return super.visitCallExpressionNode(node, context);
        }

        this.state = EventVisitorState.IN_HANDLER;
        const calleeContext = {
            ...context,
            dataSource: this.source.self
        };

        const callee = node.callee.accept(this, calleeContext);
        this.state = EventVisitorState.IN_ARGUMENTS;

        // Для аргументов не запрещаем вычисляемые поля
        const argsContext = {
            ...context,
            allowComputedObjectProperty: true
        };

        this.generateHandlerArguments(node.arguments, argsContext);

        this.state = EventVisitorState.AFTER_HANDLER;

        return callee;
    }

    visitMemberExpressionNode(node: MemberExpressionNode, context: IExpressionOptions): string {
        if (this.state === EventVisitorState.IN_HANDLER) {
            if (node.computed) {
                throw new Error('имя функции-обработчика события не может быть вычисляемым');
            }
            this.state = EventVisitorState.IN_CONTEXT;

            this.handlerName = (node.property as IdentifierNode).name;

            this.enterExpression(this.contextFlags);
            this.flags.reset();
            this.context = node.object.accept(this, context);
            this.leaveExpression();
        }

        return super.visitMemberExpressionNode(node, context);
    }

    visitIdentifierNode(node: IdentifierNode, context: IExpressionOptions): string {
        const identifierContext = { ...context };

        if (this.state === EventVisitorState.IN_HANDLER) {
            this.handlerName = node.name;
        } else if (context.checkChildren === true && context.children?.indexOf(node.name) > -1) {
            this.context = this.source.children;
            this.flags.reset();
            this.contextFlags.hasChildrenReference = true;

            identifierContext.dataSource = this.source.children;
        }

        return super.visitIdentifierNode(node, identifierContext);
    }

    private generateHandlerArguments(args: Node[], context: IExpressionOptions): void {
        this.args = args.map(arg => {
            this.enterExpression(new Flags());
            const meta = super.generate(arg, {
                ...context,
                dataSource: this.source.data,
                checkChildren: false
            });
            this.leaveExpression();

            return meta;
        });
    }
}
