/**
 * @author Krylov M.A.
 *
 * Модуль генерации обращений к методам внутри mustache выражений.
 */

import type { IMethods, IFormatter } from '../Interface';

import Base from './Base';
import { METHODS_ALIASES } from '../Aliases';
import { wrapString, wrapArray } from '../types/String';

export default class Methods extends Base implements IMethods<string> {
    constructor(formatter: IFormatter, instance: string, isRelease: boolean) {
        super(formatter, instance, METHODS_ALIASES, isRelease);
    }

    sanitize(content: string): string {
        return this.generateMethodCall('sanitize', [content]);
    }

    wrapUndefined(value: string): string {
        return this.generateMethodCall('wrapUndefined', [value]);
    }

    wrapString(value: string): string {
        return this.generateMethodCall('wrapString', [value]);
    }

    getResourceURL(args: string[]): string {
        return this.generateMethodCall('getResourceURL', args);
    }

    getter(data: string, path: string[]): string {
        return this.generateMethodCall('getter', [data, wrapArray(path)]);
    }

    setter(data: string, path: string[], value: string): string {
        return this.generateMethodCall('setter', [data, wrapArray(path), value]);
    }

    decorate(name: string, args: string[]): string {
        if (args.length > 0) {
            return this.generateMethodCall('decorate', [wrapString(name), wrapArray(args)]);
        }

        return this.generateMethodCall('decorate', [wrapString(name)]);
    }

    call(funcContext: string, data: string, path: string[], args: string[]): string {
        if (args.length > 0) {
            return this.generateMethodCall('call', [funcContext, data, wrapArray(path), wrapArray(args)]);
        }

        return this.generateMethodCall('call', [funcContext, data, wrapArray(path)]);
    }

    call2(data: string, path: string[], args: string[]): string {
        if (args.length > 0) {
            return this.generateMethodCall('call2', [data, wrapArray(path), wrapArray(args)]);
        }

        return this.generateMethodCall('call2', [data, wrapArray(path)]);
    }

    dots(data: string): string {
        return this.generateMethodCall('dots', [data]);
    }
}
