import * as Ast from './Ast';

function shouldSkip(node: Ast.Ast): boolean {
    return (
        node instanceof Ast.DoctypeNode ||
        node instanceof Ast.CDataNode ||
        node instanceof Ast.InstructionNode ||
        node instanceof Ast.CommentNode
    );
}

function getComponentName(node: Ast.Ast): string {
    if (node instanceof Ast.ComponentNode || node instanceof Ast.StaticPartialNode) {
        return node.wsPath.getFullPath();
    }

    return undefined;
}

export function getTopLevelComponentName(nodes: Ast.Ast[]): string {
    for (const node of nodes) {
        if (shouldSkip(node)) {
            continue;
        }

        return getComponentName(node);
    }
}
