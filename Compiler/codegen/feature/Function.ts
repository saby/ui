
const EMPTY_STRING = '';

function replaceAnonymousFunctionName(name: string, text: string): string {
   return text.replace('function anonymous', `function ${name}`);
}

export interface ITemplateFunctionGenerator {
   createTemplateFunction(body: string): Function;
   createTemplateFunctionString(body: string, name?: string): string;
   createTemplateFunctionCall(name: string, args: string[]): string;
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

class TemplateFunctionGenerator implements ITemplateFunctionGenerator {
   createTemplateFunction(body: string): Function {
      const params = TEMPLATE_PARAMETERS.join(', ');
      return new Function(params, body);
   }

   createTemplateFunctionString(body: string, name: string = EMPTY_STRING): string {
      const text = this.createTemplateFunction(body).toString();
      return replaceAnonymousFunctionName(name, text);
   }

   createTemplateFunctionCall(name: string, args: string[]): string {
      const params = args.join(', ');
      return `${name}.call(${params})`;
   }
}

export function createTemplateFunctionGenerator(useReact: boolean): ITemplateFunctionGenerator {
   if (useReact) {
      // TODO: release
   }
   return new TemplateFunctionGenerator();
}