/**
 * @author Krylov M.A.
 */
import type { IFormatter, TPrimitive, TObject } from '../Interface';
import { toObjectNotation, toObjectPropertyName, wrapObject } from '../types/Object';
import { wrapSequence, wrapArray } from '../types/String';

const DEFAULT_INDENT_SIZE = 4;
const DEFAULT_INDENT_CHAR = ' ';
const DEFAULT_NEW_LINE_CHAR = '\n';

class DebugFormatter implements IFormatter {
    readonly initialOffset: number;
    readonly indentSize: number = DEFAULT_INDENT_SIZE;
    readonly indentChar: string = DEFAULT_INDENT_CHAR;
    readonly newLineChar: string = DEFAULT_NEW_LINE_CHAR;

    offset: number;

    constructor(offset: number) {
        this.initialOffset = offset;
        this.offset = offset;
    }

    formatLine(line: TPrimitive, offset: number = 0): string {
        return `${this.toIdent(offset)}${line}`;
    }

    formatObject(object: TObject, offset: number = 0): string {
        const notation = Array.isArray(object) ? object : toObjectNotation(object);
        if (notation.length === 0) {
            return '{ }';
        }

        const properties = notation.map(({ name, comment, value }) => {
            const property = toObjectPropertyName(name, comment);

            return `${property}: ${value}`;
        });

        return `{${this.formatSequence(properties, offset)}}`;
    }

    formatArray(elements: TPrimitive[], offset: number = 0): string {
        if (elements.length === 0) {
            return '[]';
        }

        return `[${this.formatSequence(elements, offset)}]`;
    }

    formatSequence(elements: TPrimitive[], offset: number = 0): string {
        if (elements.length === 0) {
            return '';
        }

        const terminalOffset = offset === 0 ? 0 : offset - 1;

        return (
            this.newLineChar +
            elements.map(element => `${this.toIdent(offset)}${element}`).join(`,${this.newLineChar}`) +
            this.newLineChar +
            this.toIdent(terminalOffset)
        );
    }

    enter(size: number = 1): void {
        this.offset += size;
    }

    leave(size: number = 1): void {
        this.offset -= size;
    }

    private toIdent(offset: number = 0): string {
        return this.indentChar.repeat(this.indentSize * (this.offset + offset));
    }
}

class ReleaseFormatter extends DebugFormatter {
    readonly newLineChar: string = '';

    formatLine(line: TPrimitive): string {
        return `${line}`;
    }

    formatObject(object: TObject): string {
        return wrapObject(object);
    }

    formatArray(elements: TPrimitive[]): string {
        return wrapArray(elements);
    }

    formatSequence(elements: TPrimitive[]): string {
        return wrapSequence(elements);
    }
}

export function formatNewLine(line: string, offset: number): string {
    return `${DEFAULT_NEW_LINE_CHAR}${DEFAULT_INDENT_CHAR.repeat(DEFAULT_INDENT_SIZE * (offset))}${line}`;
}

export default function createFormatter(offset: number, isRelease: boolean): IFormatter {
    if (isRelease) {
        return new ReleaseFormatter(offset);
    }

    return new DebugFormatter(offset);
}
