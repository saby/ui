
const EMPTY_STRING = '';

export interface ITemplateFunctionGenerator {
   createTemplateFunction(body: string): Function;
   createTemplateFunctionString(body: string, name?: string): string;
   createTemplateFunctionCall(name: string, args: string[]): string;
}

abstract class BaseTemplateFunctionGenerator implements ITemplateFunctionGenerator {
   abstract createTemplateFunction(body: string): Function;

   createTemplateFunctionString(body: string, name: string = EMPTY_STRING): string {
      const text = this.createTemplateFunction(body).toString();
      return BaseTemplateFunctionGenerator.replaceAnonymousFunctionName(name, text);
   }

   createTemplateFunctionCall(name: string, args: string[]): string {
      const params = args.join(', ');
      return `${name}.call(${params})`;
   }

   private static replaceAnonymousFunctionName(name: string, text: string): string {
      return text.replace('function anonymous', `function ${name}`);
   }
}

const TEMPLATE_PARAMETERS = [
   'data',
   'attr',
   'context',
   'isVdom',
   'sets',
   'forceCompatible',
   'generatorConfig'
];

class TemplateFunctionGenerator extends BaseTemplateFunctionGenerator {
   createTemplateFunction(body: string): Function {
      const params = TEMPLATE_PARAMETERS.join(', ');
      return new Function(params, body);
   }
}

const REACT_TEMPLATE_PARAMETERS = [
   'props',
   'ref'
];

/**
 * TODO: инициализировать переменные Wasaby через аргументы шаблонной функции react
 */
export const REACT_PARAMETERS_INIT = `
var data = props;
var attr = props.__$$attributes;
var context = props.__$$context;
var isVdom = props.__$$isVdom;
var sets = props.__$$sets;
var forceCompatible = props.__$$forceCompatible;
var generatorConfig = props.__$$generatorConfig;

`;

class ReactTemplateFunctionGenerator extends BaseTemplateFunctionGenerator {
   createTemplateFunction(body: string): Function {
      const params = REACT_TEMPLATE_PARAMETERS.join(', ');
      return new Function(params, REACT_PARAMETERS_INIT + body);
   }
}

export function createTemplateFunctionGenerator(useReact: boolean): ITemplateFunctionGenerator {
   if (useReact) {
      return new ReactTemplateFunctionGenerator();
   }
   return new TemplateFunctionGenerator();
}