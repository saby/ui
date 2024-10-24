/**
 * @author Krylov M.A.
 *
 * Базовый генератор обращений к именованным сущностям.
 */

import type { TPrimitive, IFormatter } from '../Interface';
import type { TAliasesMap } from '../Aliases';

import { wrapSequence } from '../types/String';

export default class Base {
    protected constructor(
        protected readonly formatter: IFormatter,
        protected readonly instance: string,
        protected readonly aliases: TAliasesMap,
        protected readonly isRelease: boolean
    ) { }

    protected getPropertyName(fn: string): string {
        if (this.isRelease) {
            if (this.aliases.has(fn)) {
                return `.${this.aliases.get(fn)}/*${fn}*/`;
            }
        }

        return `.${fn}`;
    }

    protected generateMethodCall(method: string, args: TPrimitive[]): string {
        return `${this.instance}${this.getPropertyName(method)}(${wrapSequence(args)})`;
    }

    protected generateFormattedMethodCall(method: string, args: TPrimitive[]): string {
        return `${this.instance}${this.getPropertyName(method)}(${this.formatter.formatSequence(args, 1)})`;
    }
}
