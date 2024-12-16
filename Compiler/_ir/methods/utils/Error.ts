/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 * @author Krylov M.A.
 */

/**
 * @private
 */
export default class MustacheExpressionError extends TypeError {
    readonly code: number;

    constructor(code: number, message?: string) {
        super(message);

        this.code = code;
    }

    static ERROR_NOT_A_FUNCTION: number = 1;
    static ERROR_CANNOT_READ_PROPERTIES: number = 2;
    static ERROR_INVALID_INTERNAL_CONTEXT: number = 3;
}
