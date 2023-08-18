/**
 * @author Krylov M.A.
 *
 * Модуль генерации обращений к генератору узлов внутри фрагмента шаблона.
 */

import type { IGenerator, TPrimitive, IFormatter } from '../Interface';

import Base from './Base';
import { GENERATOR_ALIASES } from '../Aliases';
import { wrapString, wrapArray, wrapSequence } from '../types/String';

function isNotNone(value: unknown): boolean {
    return value !== undefined && value !== null;
}

export function wrapNone(value: TPrimitive): TPrimitive {
    if (value === undefined) {
        return 'undefined';
    }

    if (value === null) {
        return 'null';
    }

    return value;
}

export default class Generator extends Base implements IGenerator<TPrimitive, string, string> {
    constructor(formatter: IFormatter, instance: string, isRelease: boolean) {
        super(formatter, instance, GENERATOR_ALIASES, isRelease);
    }

    escape(value: string): string {
        return this.generateMethodCall('escape', ['context', value]);
    }

    createText(text: string, key?: string): string {
        if (typeof key === 'string') {
            return this.generateFormattedMethodCall('createText', ['context', text, key]);
        }

        return this.generateFormattedMethodCall('createText', ['context', text]);
    }

    createDirective(text: string): string {
        return this.generateFormattedMethodCall('createDirective', [
            'context',
            wrapString(text)
        ]);
    }

    createComment(text: string): string {
        return this.generateMethodCall('createComment', ['context', text]);
    }

    createTag(name: string, configuration: string, children: string[]): string {
        if (children.length > 0) {
            return this.generateFormattedMethodCall('createTag', [
                'context',
                wrapString(name),
                configuration,
                this.formatter.formatArray(children, 2)
            ]);
        }

        return this.generateFormattedMethodCall('createTag', [
            'context',
            wrapString(name),
            configuration
        ]);
    }

    createControl(method: string, configuration: string): string {
        return this.generateFormattedMethodCall('createControl', [
            'context',
            method,
            configuration
        ]);
    }

    createPartial(method: string, configuration: string): string {
        return this.generateFormattedMethodCall('createPartial', [
            'context',
            method,
            configuration
        ]);
    }

    createTemplate(method: string, configuration: string): string {
        return this.generateFormattedMethodCall('createTemplate', [
            'context',
            method,
            configuration
        ]);
    }

    createInline(referenceId: number, name: string, configuration: string): string {
        return this.generateFormattedMethodCall('createInline', [
            'context',
            `/* ${name} */ ${wrapNone(referenceId)}`,
            configuration
        ]);
    }

    evalDefaultScope(options: string): string {
        return this.generateMethodCall('evalDefaultScope', ['context', options]);
    }

    evalOptionsScope(options: string, scope: string): string {
        return this.generateMethodCall('evalOptionsScope', ['context', options, scope]);
    }

    evalScope(options: string, scope: string): string {
        return this.generateMethodCall('evalScope', ['context', options, scope]);
    }

    evalExpression(referenceId: number, comment?: string): string {
        if (typeof comment === 'string') {
            return this.generateMethodCall('evalExpression', ['context', `/* ${comment} */ ${referenceId}`]);
        }

        return this.generateMethodCall('evalExpression', ['context', referenceId]);
    }

    closeExpression(referenceId: number, comment?: string): string {
        if (typeof comment === 'string') {
            return this.generateMethodCall('closeExpression', ['context', `/* ${comment} */ ${referenceId}`]);
        }

        return this.generateMethodCall('closeExpression', ['context', referenceId]);
    }

    closeBindExpression(referenceId: number, comment?: string): string {
        if (typeof comment === 'string') {
            return this.generateMethodCall('closeBindExpression', ['context', `/* ${comment} */ ${referenceId}`]);
        }

        return this.generateMethodCall('closeBindExpression', ['context', referenceId]);
    }

    createContentOption(referenceId: number, internalsMetaId?: number): string {
        if (typeof internalsMetaId === 'number') {
            return this.generateMethodCall('createContentOption', ['context', referenceId, internalsMetaId]);
        }

        return this.generateMethodCall('createContentOption', ['context', referenceId]);
    }

    evalContentOption(referenceId: number, internalsMetaId?: number): string {
        if (typeof internalsMetaId === 'number') {
            return this.generateMethodCall('evalContentOption', ['context', referenceId, internalsMetaId]);
        }

        return this.generateMethodCall('evalContentOption', ['context', referenceId]);
    }

    createFunction(name: string, data: string): string {
        return this.generateMethodCall('createFunction', ['context', name, data]);
    }

    if(test: string, body: string): string {
        return (
            this.instance + this.formatter.newLineChar +
            this.formatter.formatLine(`${this.getPropertyName('if')}(${wrapSequence(['context', test, body])})`)
        );
    }

    for(id: number, init: string, test: string, update: string, body: string, internalsMetaId?: number): string {
        if (typeof internalsMetaId === 'number') {
            return this.generateMethodCall('for', [
                'context',
                id,
                wrapNone(init),
                test,
                wrapNone(update),
                body,
                internalsMetaId
            ]);
        }

        return this.generateMethodCall('for', [
            'context',
            id,
            wrapNone(init),
            test,
            wrapNone(update),
            body
        ]);
    }

    foreach(id: number, identifiers: string[], collection: string, body: string, internalsMetaId?: number): string {
        if (typeof internalsMetaId === 'number') {
            return this.generateMethodCall('foreach', [
                'context',
                id,
                wrapArray(identifiers.filter(isNotNone).map(wrapString)),
                collection,
                body,
                internalsMetaId
            ]);
        }

        return this.generateMethodCall('foreach', [
            'context',
            id,
            wrapArray(identifiers.filter(isNotNone).map(wrapString)),
            collection,
            body
        ]);
    }
}
