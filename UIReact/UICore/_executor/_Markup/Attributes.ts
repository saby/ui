import * as React from 'react';

const formatStringToCamelCase = (name: string) => {
   // CSSVariables names do not converted
   if (name.slice(0, 2) === '--') {
      return name;
   }

   const splitted = name.split('-');
   if (splitted.length === 1) return splitted[0];
   return (
      splitted[0] +
      splitted
         .slice(1)
         .map((word) => word ? word[0].toUpperCase() + word.slice(1) : '')
         .join('')
   );
};

const getStyleObjectFromString = (str) => {
   const style = {};
   str.split(';').forEach((el) => {
      // tslint:disable-next-line:typedef
      const [property, value] = el.split(':');
      if (property && value) {
         const formattedProperty = formatStringToCamelCase(property.trim());
         style[formattedProperty] = value.trim();
      }
   });

   return style;
};

export interface WasabyAttributes {
   class?: string;
   style?: string;
   tabindex?: string | number;
   'xml:lang'?: string;
   name?: string;
   ref?: React.MutableRefObject<HTMLElement> | React.LegacyRef<HTMLElement>;
}

interface IStandardAttributes {
   spellcheck?: boolean | 'false' | 'true';
   autocorrect?: string;
   autocapitalize?: string;
   inputmode?: string;
   autocomplete?: string;
   class?: string;
}
/**
 * Шаблоны замены стандартных атрибутов в реактовские аналоги
 * Стандартные атрибуты такие как class (вместо className в реакте), spellcheck и т.д.
 */
const replacementTemplates = {
   spellcheck: 'spellCheck',
   autocorrect: 'autoCorrect',
   autocapitalize: 'autoCapitalize',
   inputmode: 'inputMode',
   autocomplete: 'autoComplete',
   class: 'className'
};
/**
 * Стандартные атрибуты в html элементах, хранятся как ключи в replacementTemplates.
 */
const keysReplacementTemplates = Object.keys(replacementTemplates);

/**
 * Конвертирует наши атрибуты в реактовские аналоги.
 * @param attributes
 */
export function convertAttributes<
   T extends HTMLElement,
   P extends React.HTMLAttributes<T>
>(attributes: IStandardAttributes & WasabyAttributes & P): P {
   const convertedAttributes = (attributes as unknown) as P;
   /** замена атрибута и удаление старого */
   Object.keys(attributes).forEach(key => {
      if(!keysReplacementTemplates.includes(key)) {
         return;
      }
      convertedAttributes[replacementTemplates[key]] = attributes[key];
      delete attributes[key];
   });
   /** замена атрибута c обработкой значения с типом данных Number и удаление старого */
   if (attributes.tabindex) {
      convertedAttributes.tabIndex = Number(attributes.tabindex);
      delete attributes.tabindex;
   }
   convertedAttributes.style =
      typeof attributes.style !== 'string'
         ? attributes.style
         : getStyleObjectFromString(attributes.style);

   return convertedAttributes;
}
