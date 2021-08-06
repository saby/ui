import * as ReactDOMServer from 'react-dom/server';
import * as React from "react";
import { Control } from 'UICore/Base';
import { IControlOptions } from 'UICommon/Base';
import { IControlConfig } from '../interfaces';
import {
   CommonUtils as Common,
   IGenerator, IGeneratorComponent
} from 'UICommon/Executor';
import { IWasabyEvent } from 'UICommon/_events/IEvents';
import { Generator } from '../Generator';
import { TemplateOrigin } from '../interfaces';
import { joinElements } from '../Utils';

import { CreateTag } from '../Component';

/**
 * @author Тэн В.А.
 */
export class GeneratorText extends Generator implements IGenerator {
   private createTagComponent: IGeneratorComponent;
   constructor() {
      super();
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
       events: Record<string, IWasabyEvent[]>,
       name: string): IControlOptions {
      return {
         ...resolvedOptionsExtended,
         ...{events}
      };
   }

   createText(text) {
      return text;
   }

   /**
    * Дает возможность дополнительно трансформировать результат построения контрола.
    * @param control Результат построения контрола.
    */
   processControl(
       control: React.ComponentElement<
           IControlOptions,
           Control<IControlOptions, object>
           >
   ): string {
      return ReactDOMServer.renderToString(control);
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


