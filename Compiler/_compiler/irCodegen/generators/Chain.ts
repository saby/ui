/**
 * @author Krylov M.A.
 *
 * Модуль генерации условной цепочки.
 */

import type { TMustache, IChainGenerator, IFormatter } from '../Interface';

import Base from './Base';
import { CHAIN_ALIASES } from '../Aliases';

export default class Chain extends Base implements IChainGenerator<TMustache, string, string> {
    constructor(formatter: IFormatter, isRelease: boolean) {
        super(formatter, '', CHAIN_ALIASES, isRelease);
    }

    elif(test: TMustache, body: string): string {
        return (
            this.formatter.newLineChar +
            this.formatter.formatLine(this.generateMethodCall('elif', [test, body]))
        );
    }

    else(body: string): string {
        return (
            this.formatter.newLineChar +
            this.formatter.formatLine(this.generateMethodCall('else', [body]))
        );
    }

    fi(): string {
        return (
            this.formatter.newLineChar +
            this.formatter.formatLine(this.generateMethodCall('fi', []))
        );
    }
}
