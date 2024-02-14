/**
 * @author Krylov M.A.
 *
 * Модуль генерации обращений к строковым литералам.
 *
 * В сгенерированном шаблоне одна и та же строка может повторяться десятки, а то и сотни раз.
 * Работа данного модуля заключается в размещении строковых литералов в таблице символов,
 * и реализация методов обращений к ним.
 */

import type { ISymbols } from '../Interface';

import { wrapString, wrapArray } from '../types/String';

export default class Symbols implements ISymbols {
    private readonly instance: string;
    private readonly isRelease: boolean;
    private readonly table: string[];
    private reactivePropertiesStart: number;
    private reactivePropertiesEnd: number;

    hasReferences: boolean;

    constructor(instance: string, isRelease: boolean) {
        this.instance = instance;
        this.isRelease = isRelease;

        this.table = [];
        this.reactivePropertiesStart = -1;
        this.reactivePropertiesEnd = -1;

        this.hasReferences = false;
    }

    toStringsTableDefinition(): string {
        if (!this.isRelease) {
            return undefined;
        }

        return wrapArray(this.table.map(wrapString));
    }

    putReactiveProperties(reactiveProperties: string[]): void {
        if (this.table.length > 0) {
            // Установка реактивных свойств должна производиться до размещения литералов в таблице
            throw new Error('внутренняя ошибка: таблица литералов не пустая');
        }

        this.reactivePropertiesStart = this.table.length;

        this.table.push(...reactiveProperties);

        this.reactivePropertiesEnd = this.table.length;
    }

    access(literal: string): string {
        if (!this.isRelease) {
            return wrapString(literal);
        }

        const index = this.registerLiteral(literal);

        return this.accessLiteral(index, literal);
    }

    toReactiveProperties(): string {
        if (this.reactivePropertiesStart === this.reactivePropertiesEnd) {
            // Реактивных свойств нет. Их оформление не требуется
            return undefined;
        }

        if (!this.isRelease) {
            return wrapArray(
                this.table
                    .slice(this.reactivePropertiesStart, this.reactivePropertiesEnd)
                    .map(wrapString)
            );
        }

        if (this.reactivePropertiesEnd === this.table.length) {
            return `${this.instance}.slice(${this.reactivePropertiesStart})`;
        }

        return `${this.instance}.slice(${this.reactivePropertiesStart}, ${this.reactivePropertiesEnd})`;
    }

    private accessLiteral(index: number, literal: string): string {
        this.hasReferences = true;

        return `${this.instance}[/*${literal}*/ ${index}]`;
    }

    private registerLiteral(literal: string): number {
        const index = this.table.findIndex(element => element === literal);

        if (index > -1) {
            return index;
        }

        this.table.push(literal);

        return this.table.length - 1;
    }
}
