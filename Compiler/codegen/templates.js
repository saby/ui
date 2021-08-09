define('Compiler/codegen/templates', [
   'Compiler/codegen/jstpl',
   'Compiler/Config',
   'Compiler/codegen/feature/Function'
], function(jstpl, builderConfig, codegenFeatureFunction) {
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
   var bodyTemplateReact = preprocessRawTemplate(jstpl.BODY_REACT);
   var contentTemplateString = preprocessRawTemplate(jstpl.CONTENT_TEMPLATE_STRING);
   var contentTemplateFunction = preprocessRawTemplate(jstpl.CONTENT_TEMPLATE_FUNCTION);

   var contentOption = preprocessRawTemplate(jstpl.CONTENT_OPTION);
   var contentOptionReact = preprocessRawTemplate(jstpl.CONTENT_OPTION_REACT);
   var contentOptionTmpl = preprocessRawTemplate(jstpl.CONTENT_OPTION_TMPL);
   var contentOptionTmplReact = preprocessRawTemplate(jstpl.CONTENT_OPTION_TMPL_REACT);

   var inlineTemplate = preprocessRawTemplate(jstpl.INLINE_TEMPLATE);
   var inlineTemplateTmpl = preprocessRawTemplate(jstpl.INLINE_TEMPLATE_TMPL);
   var partialTemplateHeader = preprocessRawTemplate(jstpl.PARTIAL_TEMPLATE_HEADER);

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
    * Выполнить подстановку переменной с именем контентной опции.
    * @param source Текст шаблона.
    * @param hasVariable Флаг наличия переменной currentPropertyName в тексте шаблона.
    * @return Обработанный текст шаблона.
    */
   function replaceContentOptionName(source, hasVariable) {
      var pattern = /\/\*#CONFIG__CURRENT_PROPERTY_NAME#\*\//g;
      if (hasVariable) {
         return source.replace(pattern, generateReturnValueFunction('pName: currentPropertyName,'));
      }
      return source.replace(pattern, EMPTY_STRING);
   }

   /**
    * Сгенерировать define-модуль шаблона wml-шаблона.
    * @param moduleName Имя модуля.
    * @param moduleExtension Расширение шаблона.
    * @param templateFunction Функция шаблона, содержащая contentOptionFunctions, inlineTemplateBodies.
    * @param dependencies Массив зависимостей.
    * @param reactiveProperties Массив имен реактивных свойств.
    * @param hasTranslations Флаг наличия в единице трансляции конструкции локализации.
    * @param useReact Флаг react сборки.
    * @returns {string} Сгенерированный текст шаблона.
    */
   function generateDefine(moduleName, moduleExtension, templateFunction, dependencies, reactiveProperties, hasTranslations, useReact) {
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

      var tmplFuncGenerator = codegenFeatureFunction.createTemplateFunctionGenerator(useReact);
      if (templateFunction.inlineTemplateBodies) {
         for (functionName in templateFunction.inlineTemplateBodies) {
            if (templateFunction.inlineTemplateBodies.hasOwnProperty(functionName)) {
               includedTemplates += tmplFuncGenerator.createTemplateFunctionString(
                  templateFunction.inlineTemplateBodies[functionName], functionName
               );
               localDependenciesList += 'depsLocal["' + functionName + '"] = ' + functionName + ';';
            }
         }
      }

      var dependenciesList = '';
      var headDependencies = [
         'UI/Executor'
      ];
      var moduleParams = ['Executor'];

      if (hasTranslations) {
         headDependencies.push('i18n!' + moduleName.split('/')[0]);
         moduleParams.push('rk');
      }
      if (useReact) {
         headDependencies.push('react');
         moduleParams.push('React');
      }
      if (dependencies) {
         for (index = 0; index < dependencies.length; ++index) {
            dependenciesList += 'depsLocal["' + dependencies[index] + '"] = deps[' + (index + headDependencies.length) + '];';
         }
      }

      var finalDependencies = headDependencies.concat(dependencies);
      var globalFileNameCode = 'var filename = "' + moduleName + '";';
      var moduleParamsString = moduleParams.join(', ');

      return defineTemplate
         .replace(/\/\*#GLOBAL_FILE_NAME#\*\//g, generateReturnValueFunction(globalFileNameCode))
         .replace(/\/\*#TEMPLATE#\*\//g, generateReturnValueFunction(template))
         .replace(/\/\*#MODULE_EXTENSION#\*\//g, generateReturnValueFunction(moduleExtension))
         .replace(/\/\*#MODULE_PARAMS#\*\//g, generateReturnValueFunction(moduleParamsString))
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
    * @param useReact Флаг react сборки.
    * @returns {string} Сгенерированный текст шаблона.
    */
   function generateDefineTmpl(moduleName, moduleExtension, templateFunction, dependencies, reactiveProperties, hasTranslations, useReact) {
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
      var moduleParams = ['Executor'];

      if (hasTranslations) {
         headDependencies.push('i18n!' + moduleName.split('/')[0]);
         moduleParams.push('rk');
      }
      if (useReact) {
         headDependencies.push('react');
         moduleParams.push('React');
      }
      if (dependencies) {
         for (index = 0; index < dependencies.length; ++index) {
            dependenciesList += '_deps["' + dependencies[index] + '"] = deps[' + (index + headDependencies.length) + '];';
         }
      }

      var finalDependencies = headDependencies.concat(dependencies);
      var moduleParamsString = moduleParams.join(', ');

      return defineTemplate
         .replace(/\/\*#GLOBAL_FILE_NAME#\*\//g, EMPTY_STRING)
         .replace(/\/\*#TEMPLATE#\*\//g, generateReturnValueFunction(template))
         .replace(/\/\*#MODULE_EXTENSION#\*\//g, generateReturnValueFunction(moduleExtension))
         .replace(/\/\*#MODULE_PARAMS#\*\//g, generateReturnValueFunction(moduleParamsString))
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
    * @param appendHeader Флаг, означающий, что необходимо включить заголовок с переменными.
    * @param useReact Флаг react сборки.
    * @returns {string} Сгенерированный блок кода.
    */
   function generateTemplate(fileName, markupGeneration, hasTranslations, appendHeader, useReact) {
      var initRkFunction = EMPTY_STRING;
      var header = appendHeader ? headTemplate : EMPTY_STRING;
      if (hasTranslations) {
         initRkFunction = 'var rk = thelpers.getRk(filename);';
      }
      if (useReact) {
         return header + bodyTemplateReact
            .replace(/\/\*#INITIALIZE_RK_FUNCTION#\*\//g, generateReturnValueFunction(initRkFunction))
            .replace(/\/\*#FILE_NAME#\*\//g, fileName)
            .replace(/\/\*#MARKUP_GENERATION#\*\//g, generateReturnValueFunction(markupGeneration));
      }
      var source = header + bodyTemplate
         .replace(/\/\*#INITIALIZE_RK_FUNCTION#\*\//g, generateReturnValueFunction(initRkFunction))
         .replace(/\/\*#FILE_NAME#\*\//g, fileName)
         .replace(/\/\*#MARKUP_GENERATION#\*\//g, generateReturnValueFunction(markupGeneration));
      if (appendHeader) {
         return replaceContentOptionName(source);
      }
      return source;
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
      var source = tmpl
         .replace(/\/\*#PROPERTY_NAME#\*\//g, generateReturnValueFunction(propertyName))
         .replace(/\/\*#TEMPLATE_BODY#\*\//g, generateReturnValueFunction(templateBody));
      return replaceContentOptionName(source, true);
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
      var source;
      if (useReact) {
         source = contentOptionTmplReact
            .replace('/*#TEMPLATE#*/', generateReturnValueFunction(templateBody))
            .replace(/\/\*#IS_WASABY_TEMPLATE#\*\//g, isWasabyTemplate)
            .replace('/*#INTERNAL#*/', generateReturnValueFunction(internal)) + postfixCall;
         return replaceContentOptionName(source, true);
      }
      source = contentOptionTmpl
         .replace('/*#TEMPLATE#*/', generateReturnValueFunction(templateBody))
         .replace(/\/\*#IS_WASABY_TEMPLATE#\*\//g, isWasabyTemplate)
         .replace('/*#INTERNAL#*/', generateReturnValueFunction(internal)) + postfixCall;
      return replaceContentOptionName(source, true);
   }

   /**
    * Сгенерировать тело функции inline-шаблона.
    * @param body {string} Тело шаблона.
    * @returns {string} Сгенерированный блок кода.
    */
   function generateInlineTemplate(body) {
      var source = inlineTemplate
         .replace('/*#BODY#*/', generateReturnValueFunction(body));
      return replaceContentOptionName(source);
   }

   /**
    * Сгенерировать тело функции inline-шаблона.
    * @param name {string} Имя шаблона.
    * @param body {string} Тело шаблона.
    * @returns {string} Сгенерированный блок кода.
    */
   function generateInlineTemplateTmpl(name, body) {
      var source = inlineTemplateTmpl
         .replace('/*#NAME#*/', generateReturnValueFunction(name))
         .replace('/*#BODY#*/', generateReturnValueFunction(body));
      return replaceContentOptionName(source);
   }

   /**
    * Сгенерировать inline-шаблон для tmpl.
    * @returns {string} Сгенерированный блок кода.
    */
   function generatePartialTemplateHeader() {
      return partialTemplateHeader;
   }

   return {
      replaceContentOptionName: replaceContentOptionName,
      clearSourceFromDeprecated: clearSourceFromDeprecated,

      generateFor: generateFor,
      generateForeach: generateForeach,

      generateDefine: generateDefine,
      generateInlineTemplate: generateInlineTemplate,
      generateTemplate: generateTemplate,
      generateContentTemplate: generateContentTemplate,
      generateContentOption: generateContentOption,

      generateDefineTmpl: generateDefineTmpl,
      generateInlineTemplateTmpl: generateInlineTemplateTmpl,
      generateContentOptionTmpl: generateContentOptionTmpl,
      generatePartialTemplateHeader: generatePartialTemplateHeader
   };
});
