/**
 * @author Krylov M.A.
 *
 * Вспомогательный модуль для полностью или частично сгенерированных mustache выражений.
 * Необходим для генерации обертки над телом функции.
 */

import type { IFlags } from './Interface';

export default class Flags implements IFlags {

    /**
     * Mustache expression must be table function whatever it contains.
     */
    alwaysTableFunction: boolean;

    /**
     * Mustache expression contains references to this variable.
     * Compiling function cannot be arrow.
     */
    hasSelfReference: boolean;

    /**
     * Mustache expression contains references to methods variable.
     * Perhaps expression contains only literal.
     */
    hasMethodsReference: boolean;

    /**
     * Mustache expression contains references to funcContext variable.
     */
    hasFuncContextReference: boolean;

    /**
     * Mustache expression contains references to context variable.
     */
    hasContextReference: boolean;

    /**
     * Mustache expression contains references to children variable.
     */
    hasChildrenReference: boolean;

    /**
     * Mustache expression contains debug function call. This function must be declared in module.
     */
    hasDebugReference: boolean;

    /**
     * Mustache expression contains usage of rk function. This function must be declared in module.
     */
    hasTranslationReference: boolean;

    /**
     * Initialize new instance.
     */
    constructor() {
        this.reset();
    }

    /**
     * Reset all flags.
     */
    reset(): void {
        this.alwaysTableFunction = false;

        this.hasSelfReference = false;
        this.hasMethodsReference = false;
        this.hasFuncContextReference = false;
        this.hasContextReference = false;
        this.hasChildrenReference = false;

        this.hasDebugReference = false;
        this.hasTranslationReference = false;
    }

    /**
     * Merge flags with other flags possible used in sub-expression.
     * @param {IFlags} flags Flags of sub-expression.
     * @param {boolean?} isForce Merge all flags.
     */
    merge(flags: IFlags, isForce: boolean = false): void {
        this.hasDebugReference = (
            this.hasDebugReference || flags.hasDebugReference
        );

        this.hasTranslationReference = (
            this.hasTranslationReference || flags.hasTranslationReference
        );

        if (isForce) {
            this.hasSelfReference = (
                this.hasSelfReference || flags.hasSelfReference
            );
            this.hasMethodsReference = (
                this.hasMethodsReference || flags.hasMethodsReference
            );
            this.hasFuncContextReference = (
                this.hasFuncContextReference || flags.hasFuncContextReference
            );
            this.hasContextReference = (
                this.hasContextReference || flags.hasContextReference
            );
            this.hasChildrenReference = (
                this.hasChildrenReference || flags.hasChildrenReference
            );
        }
    }

    /**
     * Test if mustache expression must be generated as function.
     * If it's not a table function, its content can be used as a value.
     */
    isTableFunction(): boolean {
        return (
            this.alwaysTableFunction ||
            this.hasSelfReference ||
            this.hasMethodsReference ||
            this.hasFuncContextReference ||
            this.hasContextReference ||
            this.hasChildrenReference
        );
    }
}
