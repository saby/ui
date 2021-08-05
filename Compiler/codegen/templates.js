define('Compiler/codegen/templates', [
   'Compiler/codegen/jstpl',
   'Compiler/Config'
], function(jstpl, builderConfig) {
   'use strict';

   /**
    * @description Предоставляет методы генерации кода для конкретных узлов AST-дерева.
    * @author Крылов М.А.
    */

   /**
    * Пустая строка.
    * @type {string}
    */
   var EMPTY_STRING = '';

   /**
    * Предобработать текст шаблона.
    * @param text Текст шаблона.
    * @returns {string} Предобработанный текст шаблона.
    */
   function preprocessRawTemplate(text) {
      return text
         .replace(/\r|\n/g, EMPTY_STRING);
   }

   // Если второй аргумент функции replace - строка, то там могут быть специальные шаблоны замены.
   // Если в шаблон-функцию попадёт один из них, финальный вариант после всех replace можеть сломать вызов new Function.
   // И будет очень сложно понять, почему. Во избежание этого, вторым аргументом replace будем передавать функцию.
   // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter
   // $$	Вставляет символ доллара «$».
   // $& - Вставляет сопоставившуюся подстроку.
   // $` - Вставляет часть строки, предшествующую сопоставившейся подстроке.
   // $' - Вставляет часть строки, следующую за сопоставившейся подстрокой.
   // $n или $nn - Символы n или nn являются десятичными цифрами, вставляет n-ную сопоставившуются подгруппу
   // из объекта RegExp в первом параметре.
   function generateReturnValueFunction(value) {
      return function() {
         return value;
      };
   }

   // Предобработанные шаблоны
   var defineTemplate = preprocessRawTemplate(jstpl.DEFINE);
   var forTemplate = preprocessRawTemplate(jstpl.FOR);
   var foreachTemplate = preprocessRawTemplate(jstpl.FOREACH);
   var headTemplate = preprocessRawTemplate(jstpl.HEAD);
   var bodyTemplate = preprocessRawTemplate(jstpl.BODY);
   var contentTemplateString = preprocessRawTemplate(jstpl.CONTENT_TEMPLATE_STRING);
   var contentTemplateFunction = preprocessRawTemplate(jstpl.CONTENT_TEMPLATE_FUNCTION);

   var contentOption = preprocessRawTemplate(jstpl.CONTENT_OPTION);
   var contentOptionReact = preprocessRawTemplate(jstpl.CONTENT_OPTION_REACT);
   var contentOptionTmpl = preprocessRawTemplate(jstpl.CONTENT_OPTION_TMPL);
   var contentOptionTmplReact = preprocessRawTemplate(jstpl.CONTENT_OPTION_TMPL_REACT);

   var inlineTemplate = preprocessRawTemplate(jstpl.INLINE_TEMPLATE);
   var inlineTemplateTmpl = preprocessRawTemplate(jstpl.INLINE_TEMPLATE_TMPL);
   var partialTemplate = preprocessRawTemplate(jstpl.PARTIAL_TEMPLATE);

   /**
    * Очистить сгенерированный текст шаблона от deprecated-блоков.
    * @param text Сгенерированный текст шаблона.
    * @returns {string} Очищенный текст шаблона.
    */
   function clearSourceFromDeprecated(text) {
      var end, clearedSource = text;
      var start = clearedSource.indexOf('/*#DELETE IT START#*/');
      while (start > -1) {
         end = clearedSource.indexOf('/*#DELETE IT END#*/');
         clearedSource = clearedSource.substr(0, start) + clearedSource.substr(end + 19);
         start = clearedSource.indexOf('/*#DELETE IT START#*/');
      }
      return clearedSource;
   }

   function getPrivateFunctionName(func, index) {
      var functionName = func.name;
      if (typeof functionName === 'string' && functionName !== 'anonymous') {
         return functionName;
      }
      if (index === 0) {
         return builderConfig.Config.privateFunctionName;
      }
      return builderConfig.Config.privateFunctionName + '_' + index;
   }

   /**
    * Сгенерировать define-модуль шаблона wml-шаблона.
    * @param moduleName Имя модуля.
    * @param moduleExtension Расширение шаблона.
    * @param templateFunction Функция шаблона, содержащая contentOptionFunctions, inlineTemplateBodies.
    * @param dependencies Массив зависимостей.
    * @param reactiveProperties Массив имен реактивных свойств.
    * @param hasTranslations Флаг наличия в единице трансляции конструкции локализации.
    * @returns {string} Сгенерированный текст шаблона.
    */
   function generateDefine(moduleName, moduleExtension, templateFunction, dependencies, reactiveProperties, hasTranslations) {
      var index, functionName, functionBody;
      var includedTemplates = '';
      var localDependenciesList = '';
      var privateTemplates = '';
      var mainTemplateFunctionName = templateFunction.name;
      if (mainTemplateFunctionName === 'anonymous' || mainTemplateFunctionName === undefined) {
         mainTemplateFunctionName = 'template';
      }
      var template = templateFunction.toString()
         .replace('function anonymous', 'function ' + mainTemplateFunctionName);

      if (templateFunction.internalFunctions) {
         for (index = 0; index < templateFunction.internalFunctions.length; ++index) {
            privateTemplates += templateFunction.internalFunctions[index];
         }
      }

      if (templateFunction.contentOptionFunctions) {
         for (index = 0; index < templateFunction.contentOptionFunctions.length; ++index) {
            functionName = getPrivateFunctionName(templateFunction.contentOptionFunctions[index], index);
            functionBody = templateFunction.contentOptionFunctions[index].toString()
               .replace('function anonymous', 'function ' + functionName);
            privateTemplates += functionBody;
         }
      }

      if (templateFunction.inlineTemplateBodies) {
         for (functionName in templateFunction.inlineTemplateBodies) {
            if (templateFunction.inlineTemplateBodies.hasOwnProperty(functionName)) {
               includedTemplates += 'function ' + functionName + '(data, attr, context, isVdom, sets, forceCompatible, generatorConfig)' + templateFunction.inlineTemplateBodies[functionName];
               localDependenciesList += 'depsLocal["' + functionName + '"] = ' + functionName + ';';
            }
         }
      }

      var dependenciesList = '';
      var headDependencies = [
         'UI/Executor'
      ];
      if (hasTranslations) {
         headDependencies.push('i18n!' + moduleName.split('/')[0]);
      }
      if (dependencies) {
         for (index = 0; index < dependencies.length; ++index) {
            dependenciesList += 'depsLocal["' + dependencies[index] + '"] = deps[' + (index + headDependencies.length) + '];';
         }
      }

      var finalDependencies = headDependencies.concat(dependencies);
      var globalFileNameCode = 'var filename = "' + moduleName + '";';

      return defineTemplate
         .replace(/\/\*#GLOBAL_FILE_NAME#\*\//g, generateReturnValueFunction(globalFileNameCode))
         .replace(/\/\*#TEMPLATE#\*\//g, generateReturnValueFunction(template))
         .replace(/\/\*#MODULE_EXTENSION#\*\//g, generateReturnValueFunction(moduleExtension))
         .replace(/\/\*#PRIVATE_TEMPLATES#\*\//g, generateReturnValueFunction(privateTemplates))
         .replace(/\/\*#INCLUDED_TEMPLATES#\*\//g, generateReturnValueFunction(includedTemplates))
         .replace(/\/\*#IS_WASABY_TEMPLATE#\*\//g, 'true')
         .replace(/\/\*#MODULE_NAME#\*\//g, generateReturnValueFunction(moduleName))
         .replace(/\/\*#LOCAL_DEPENDENCIES#\*\//g, generateReturnValueFunction(dependenciesList + localDependenciesList))
         .replace(/\/\*#DEPENDENCIES#\*\//g, generateReturnValueFunction(JSON.stringify(finalDependencies)))
         .replace(/\/\*#REACTIVE_PROPERTIES#\*\//g, generateReturnValueFunction(JSON.stringify(reactiveProperties)));
   }

   /**
    * Сгенерировать define-модуль шаблона tmpl-шаблона.
    * @param moduleName Имя модуля.
    * @param moduleExtension Расширение шаблона.
    * @param templateFunction Функция шаблона, содержащая contentOptionFunctions, inlineTemplateBodies.
    * @param dependencies Массив зависимостей.
    * @param reactiveProperties Массив имен реактивных свойств.
    * @param hasTranslations Флаг наличия в единице трансляции конструкции локализации.
    * @returns {string} Сгенерированный текст шаблона.
    */
   function generateDefineTmpl(moduleName, moduleExtension, templateFunction, dependencies, reactiveProperties, hasTranslations) {
      var index;
      var mainTemplateFunctionName = templateFunction.name;
      if (mainTemplateFunctionName === 'anonymous' || mainTemplateFunctionName === undefined) {
         mainTemplateFunctionName = 'template';
      }
      var template = templateFunction.toString()
         .replace('function anonymous', 'function ' + mainTemplateFunctionName);
      var dependenciesList = '';
      var headDependencies = [
         'UI/Executor'
      ];
      if (hasTranslations) {
         headDependencies.push('i18n!' + moduleName.split('/')[0]);
      }
      if (dependencies) {
         for (index = 0; index < dependencies.length; ++index) {
            dependenciesList += '_deps["' + dependencies[index] + '"] = deps[' + (index + headDependencies.length) + '];';
         }
      }

      var finalDependencies = headDependencies.concat(dependencies);
      return defineTemplate
         .replace(/\/\*#GLOBAL_FILE_NAME#\*\//g, EMPTY_STRING)
         .replace(/\/\*#TEMPLATE#\*\//g, generateReturnValueFunction(template))
         .replace(/\/\*#MODULE_EXTENSION#\*\//g, generateReturnValueFunction(moduleExtension))
         .replace(/\/\*#PRIVATE_TEMPLATES#\*\//g, EMPTY_STRING)
         .replace(/\/\*#INCLUDED_TEMPLATES#\*\//g, EMPTY_STRING)
         .replace(/\/\*#IS_WASABY_TEMPLATE#\*\//g, 'false')
         .replace(/\/\*#MODULE_NAME#\*\//g, generateReturnValueFunction(moduleName))
         .replace(/\/\*#LOCAL_DEPENDENCIES#\*\//g, generateReturnValueFunction(dependenciesList))
         .replace(/\/\*#DEPENDENCIES#\*\//g, generateReturnValueFunction(JSON.stringify(finalDependencies)))
         .replace(/\/\*#REACTIVE_PROPERTIES#\*\//g, generateReturnValueFunction(JSON.stringify(reactiveProperties)));
   }

   /**
    * Сгенерировать блок кода для инструкции for (init; test; update).
    * @param init Выражение инициализации.
    * @param test Выражение условия.
    * @param update Выражение обновления.
    * @param processedBlock Тело цикла.
    * @param cycleIndex Уникальный индекс цикла в рамках одной единицы компиляции.
    * @returns {string} Сгенерированный блок кода.
    */
   function generateFor(init, test, update, processedBlock, cycleIndex) {
      return forTemplate
         .replace(/\/\*#CYCLE_INDEX#\*\//g, generateReturnValueFunction(cycleIndex))
         .replace(/\/\*#INIT#\*\//g, generateReturnValueFunction(init))
         .replace(/\/\*#TEST#\*\//g, generateReturnValueFunction(test))
         .replace(/\/\*#UPDATE#\*\//g, generateReturnValueFunction(update))
         .replace(/\/\*#PROCESSED#\*\//g, generateReturnValueFunction(processedBlock));
   }

   /**
    * Сгенерировать блок кода для инструкции for (key, value in collection).
    * @param scopeArray Выражение итерируемой коллекции.
    * @param forSource Инструкции цикла (key и value).
    * @param processedBlock Тело цикла.
    * @param cycleIndex Уникальный индекс цикла в рамках одной единицы компиляции.
    * @returns {string} Сгенерированный блок кода.
    */
   function generateForeach(scopeArray, forSource, processedBlock, cycleIndex) {
      var iteratorScope = JSON.stringify({
         key: forSource.key,
         value: forSource.value
      });
      return foreachTemplate
         .replace(/\/\*#CYCLE_INDEX#\*\//g, generateReturnValueFunction(cycleIndex))
         .replace(/\/\*#SCOPE_ARRAY#\*\//g, generateReturnValueFunction(scopeArray))
         .replace(/\/\*#ITERATOR_SCOPE#\*\//g, generateReturnValueFunction(iteratorScope))
         .replace(/\/\*#PROCESSED#\*\//g, generateReturnValueFunction(processedBlock));
   }

   /**
    * Сгенерировать тело функции шаблона - блок формирования верстки.
    * @param fileName Путь к файлу шаблона.
    * @param markupGeneration Блок генерации верстки.
    * @param hasTranslations Флаг наличия в единице трансляции конструкции локализации.
    * @param appendHeader Флаг включения заголовка с инициализацией переменных.
    * @returns {string} Сгенерированный блок кода.
    */
   function generateTemplate(fileName, markupGeneration, hasTranslations, appendHeader) {
      var initRkFunction = EMPTY_STRING;
      var header = appendHeader ? headTemplate : EMPTY_STRING;
      if (hasTranslations) {
         initRkFunction = 'var rk = thelpers.getRk(filename);';
      }
      return header + bodyTemplate
         .replace(/\/\*#INITIALIZE_RK_FUNCTION#\*\//g, generateReturnValueFunction(initRkFunction))
         .replace(/\/\*#FILE_NAME#\*\//g, fileName)
         .replace(/\/\*#MARKUP_GENERATION#\*\//g, generateReturnValueFunction(markupGeneration));
   }

   /**
    * Сгенерировать тело функции контентной опции.
    * @param propertyName Имя контентной опции.
    * @param templateBody Тело шаблона.
    * @param fileName Путь к файлу шаблона.
    * @param isString Метка: генерировать шаблон для строки или функции.
    * @returns {string} Сгенерированное тело функции контентной опции.
    */
   function generateContentTemplate(propertyName, templateBody, fileName, isString) {
      var tmpl = isString ? contentTemplateString : contentTemplateFunction;
      return tmpl
         .replace(/\/\*#PROPERTY_NAME#\*\//g, generateReturnValueFunction(propertyName))
         .replace(/\/\*#TEMPLATE_BODY#\*\//g, generateReturnValueFunction(templateBody));
   }

   /**
    * Сгенерировать контентную опцию для wml шаблона.
    * Полученный блок кода - значение контентной опции в блоке "options".
    * @param template Имя функции контентной опции.
    * @param internal Набор internal выражений.
    * @param postfix Строка, которую необходимо добавить в конце сгенерированного блока.
    * @param isWasabyTemplate Флаг wml шаблона.
    * @param useReact Флаг генерации кода для React.
    * @returns {string} Значение контентной опции для блока "options".
    */
   function generateContentOption(template, internal, postfix, isWasabyTemplate, useReact) {
      var postfixCall = postfix || '';
      if (useReact) {
         return contentOptionReact
            .replace('/*#TEMPLATE#*/', generateReturnValueFunction(template))
            .replace('/*#TEMPLATE_JSON#*/', generateReturnValueFunction(template))
            .replace(/\/\*#IS_WASABY_TEMPLATE#\*\//g, isWasabyTemplate);
      }
      return contentOption
         .replace('/*#TEMPLATE#*/', generateReturnValueFunction(template))
         .replace('/*#TEMPLATE_JSON#*/', generateReturnValueFunction(template))
         .replace(/\/\*#IS_WASABY_TEMPLATE#\*\//g, isWasabyTemplate)
         .replace('/*#INTERNAL#*/', generateReturnValueFunction(internal)) + postfixCall;
   }

   /**
    * Сгенерировать контентную опцию для tmpl шаблона.
    * Полученный блок кода - значение контентной опции в блоке "options".
    * @param templateBody Тело шаблонной функции.
    * @param internal Набор internal выражений.
    * @param postfix Строка, которую необходимо добавить в конце сгенерированного блока.
    * @param isWasabyTemplate Флаг wml шаблона.
    * @param useReact Флаг генерации кода для React.
    * @returns {string} Значение контентной опции для блока "options".
    */
   function generateContentOptionTmpl(templateBody, internal, postfix, isWasabyTemplate, useReact) {
      var postfixCall = postfix || '';
      if (useReact) {
         return contentOptionTmplReact
            .replace('/*#TEMPLATE#*/', generateReturnValueFunction(templateBody))
            .replace(/\/\*#IS_WASABY_TEMPLATE#\*\//g, isWasabyTemplate)
            .replace('/*#INTERNAL#*/', generateReturnValueFunction(internal)) + postfixCall;
      }
      return contentOptionTmpl
         .replace('/*#TEMPLATE#*/', generateReturnValueFunction(templateBody))
         .replace(/\/\*#IS_WASABY_TEMPLATE#\*\//g, isWasabyTemplate)
         .replace('/*#INTERNAL#*/', generateReturnValueFunction(internal)) + postfixCall;
   }

   /**
    * Сгенерировать тело функции inline-шаблона.
    * @param body {string} Тело шаблона.
    * @returns {string} Сгенерированный блок кода.
    */
   function generateInlineTemplate(body) {
      return inlineTemplate
         .replace('/*#BODY#*/', generateReturnValueFunction(body));
   }

   /**
    * Сгенерировать тело функции inline-шаблона.
    * @param name {string} Имя шаблона.
    * @param body {string} Тело шаблона.
    * @returns {string} Сгенерированный блок кода.
    */
   function generateInlineTemplateTmpl(name, body) {
      return inlineTemplateTmpl
         .replace('/*#NAME#*/', generateReturnValueFunction(name))
         .replace('/*#BODY#*/', generateReturnValueFunction(body));
   }

   /**
    * Сгенерировать inline-шаблон для tmpl.
    * @param body {string} Тело шаблона.
    * @returns {string} Сгенерированный блок кода.
    */
   function generatePartialTemplate(body) {
      return partialTemplate
         .replace('/*#BODY#*/', generateReturnValueFunction(body));
   }

   return {
      clearSourceFromDeprecated: clearSourceFromDeprecated,

      generateFor: generateFor,
      generateForeach: generateForeach,

      generateDefine: generateDefine,
      generateInlineTemplate: generateInlineTemplate,
      generateTemplateBody: generateTemplate,
      generateContentTemplate: generateContentTemplate,
      generateContentOption: generateContentOption,

      generateDefineTmpl: generateDefineTmpl,
      generateInlineTemplateTmpl: generateInlineTemplateTmpl,
      generateContentOptionTmpl: generateContentOptionTmpl,
      generatePartialTemplate: generatePartialTemplate
   };
});
