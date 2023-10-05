/**
 * @author Krylov M.A.
 *
 * Модуль генерации компонентов мета-описания шаблона.
 */

import type { IEntryPoint, IEntryPointDescription, IObjectProperty, IFormatter } from '../Interface';

import Base from './Base';
import { ENTRY_POINT_ALIASES } from '../Aliases';
import { wrapString } from '../types/String';
import { Description } from './Contract';
import { DEFAULT_CONTENT_BODY_NAME } from '../Constants';

function putProperties(meta: IObjectProperty[], description: IEntryPointDescription<string>): void {
    if (typeof description.reactiveProperties === 'undefined') {
        return;
    }

    meta.push({
        name: Description.reactiveProperties,
        value: description.reactiveProperties
    });
}

function putNames(meta: IObjectProperty[], description: IEntryPointDescription<string>): void {
    if (typeof description.names === 'undefined') {
        return;
    }

    meta.push({
        name: Description.names,
        value: description.names
    });
}

export default class EntryPoint extends Base implements IEntryPoint<string, string> {
    private readonly version: number;

    constructor(formatter: IFormatter, instance: string, version: number, isRelease: boolean) {
        super(formatter, instance, ENTRY_POINT_ALIASES, isRelease);

        this.version = version;
    }

    generate(description: IEntryPointDescription<string>): string {
        const meta = [
            {
                name: Description.version,
                value: this.version
            },
            {
                name: Description.moduleName,
                value: wrapString(description.moduleName)
            }
        ];

        this.putDependencies(meta, description);
        this.putTemplates(meta, description);
        putProperties(meta, description);
        this.putExpressions(meta, description);
        this.putInternalsMeta(meta, description);
        putNames(meta, description);

        return this.generateMethodCall('generate', [
            this.formatter.formatObject(meta, 1)
        ]);
    }

    wrapDependencies(names: string[], startIndex: number): string {
        return this.generateMethodCall('wrapDependencies', [
            this.formatter.formatArray(names.map(wrapString), 1),
            `Array.prototype.slice.call(arguments, ${startIndex})`
        ]);
    }

    wrapContentBody(body: string, name: string): string {
        if (name === DEFAULT_CONTENT_BODY_NAME) {
            return this.generateMethodCall('wrapContentBody', [body]);
        }

        return this.generateMethodCall('wrapContentBody', [
            body,
            wrapString(name)
        ]);
    }

    wrapTemplateBody(name: string, body: string): string {
        return this.generateMethodCall('wrapTemplateBody', [
            wrapString(name),
            body
        ]);
    }

    wrapRootBody(body: string): string {
        return this.generateMethodCall('wrapRootBody', [body]);
    }

    private putDependencies(meta: IObjectProperty[], description: IEntryPointDescription<string>): void {
        if (description.dependencies.length === 0) {
            return;
        }

        this.formatter.enter();
        meta.push({
            name: Description.dependencies,
            value: this.wrapDependencies(description.dependencies, description.dependenciesStartIndex)
        });
        this.formatter.leave();
    }

    private putTemplates(meta: IObjectProperty[], description: IEntryPointDescription<string>): void {
        const templates = description.templates.map((template) => {
            if (template.type === 'content') {
                return this.wrapContentBody(template.body, template.name);
            }

            if (template.type === 'template') {
                return this.wrapTemplateBody(template.name, template.body);
            }

            if (template.type === 'root') {
                return this.wrapRootBody(template.body);
            }

            throw new Error(`внутреняя ошибка генерации кода: получен неизвестный тип тела шаблона "${template.type}"`);
        });

        this.formatter.enter();
        meta.push({
            name: Description.templates,
            value: this.formatter.formatArray(this.wrapWithReferenceId(templates), 1)
        });
        this.formatter.leave();
    }

    private putExpressions(meta: IObjectProperty[], description: IEntryPointDescription<string>): void {
        if (description.expressions.length === 0) {
            return;
        }

        this.formatter.enter();
        meta.push({
            name: Description.mustacheExpressions,
            value: this.formatter.formatArray(this.wrapWithReferenceId(description.expressions), 1)
        });
        this.formatter.leave();
    }

    private putInternalsMeta(meta: IObjectProperty[], description: IEntryPointDescription<string>): void {
        if (description.internalsMeta.length === 0) {
            return;
        }

        this.formatter.enter();
        meta.push({
            name: Description.internalsMeta,
            value: this.formatter.formatArray(this.wrapWithReferenceId(description.internalsMeta), 1)
        });
        this.formatter.leave();
    }

    private wrapWithReferenceId(collection: string[]): string[] {
        return collection.map((element: string, index: number): string => {
            if (this.isRelease) {
                return element;
            }

            return `/* ${index} */ ${element}`;
        });
    }
}
