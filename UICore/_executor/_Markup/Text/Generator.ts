/**
 * @kaizen_zone 6e654dec-ddc3-417d-bd2e-ce775a13cd46
 */
import * as React from 'react';
import { Control } from 'UICore/Base';
import { IControlOptions } from 'UICommon/Base';
import { IControlConfig } from '../interfaces';
import {
    CommonUtils as Common,
    IGenerator,
    IGeneratorComponent,
    IGeneratorConfig,
} from 'UICommon/Executor';
import { TWasabyEvent } from 'UICommon/Events';
import { Generator } from '../Generator';
import { TemplateOrigin } from '../interfaces';
import { joinElements } from '../Utils';
import renderToString from '../RenderToString/RenderToString';

import { CreateTag } from '../Component';

const isServerSide = typeof window === 'undefined';

/**
 * @private
 */
export class GeneratorText extends Generator implements IGenerator {
    private createTagComponent: IGeneratorComponent;
    private generatorConfig: IGeneratorConfig;

    constructor(config: IGeneratorConfig) {
        super();
        if (config) {
            this.generatorConfig = config;
        }
        this.createTagComponent = new CreateTag();
    }

    /**
     * подготавливает опции для контрола. вызывается в функции шаблона в случае выполнения инлайн шаблона
     * @param tplOrigin тип шаблона
     * @param scope результирующий контекст выполнения
     */
    prepareDataForCreate(tplOrigin: TemplateOrigin, scope: IControlOptions): IControlOptions {
        return scope;
    }

    protected calculateOptions(
        resolvedOptionsExtended: IControlOptions,
        config: IControlConfig,
        events: TWasabyEvent,
        name: string
    ): IControlOptions {
        if (!isServerSide) {
            return {
                ...resolvedOptionsExtended,
                ...{ _$events: events },
            };
        } else {
            return resolvedOptionsExtended;
        }
    }

    createText(text) {
        return text;
    }

    /**
     * Дает возможность дополнительно трансформировать результат построения контрола.
     * @param control Результат построения контрола.
     */
    processControl(
        control: React.ComponentElement<IControlOptions, Control<IControlOptions, object>>
    ): string {
        return renderToString(control);
    }

    joinElements(elements: string[]): string {
        return joinElements(elements);
    }

    createTag(tagName, attrs, children, attrToDecorate?, __?): string {
        return this.createTagComponent.create(tagName, attrs, children, attrToDecorate, __);
    }

    createDirective(text: string): string {
        return '<' + text + '>';
    }

    escape<T>(value: T): T {
        return Common.escape(value);
    }
}
