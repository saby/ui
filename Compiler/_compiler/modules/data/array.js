define('Compiler/_compiler/modules/data/array', [
   'Compiler/_compiler/utils/ErrorHandler',
   'Compiler/_compiler/modules/utils/parse',
   'Compiler/_compiler/modules/utils/tag',
   'Compiler/_compiler/modules/data/utils/dataTypesCreator',
   'Compiler/_compiler/modules/data/utils/functionStringCreator',
   'Compiler/_compiler/codegen/JsTemplates',
   'Compiler/_compiler/codegen/Internal',
   'Compiler/_compiler/codegen/Template'
], function arrayLoader(
   ErrorHandlerLib,
   parseUtils,
   tagUtils,
   DTC,
   FSC,
   JsTemplates,
   Internal,
   TemplateLib
) {
   'use strict';

   var errorHandler = ErrorHandlerLib.createErrorHandler(true);

   function clearPropertyName(propertyName) {
      return propertyName ? propertyName.split('/').pop() : propertyName;
   }

   function generateInternal(string, injected, inlineTemplateBodies, internalFunctions) {
      if (internalFunctions) {
         return FSC.getStr(Internal.generate(injected.wsInternalTree, internalFunctions));
      }

      var dirtyCh = '';
      if (!string) {
         if (!inlineTemplateBodies) {
            dirtyCh = 'this.func.internal = shouldCalculateInternal && ';
         }
         if (injected && injected.internal) {
            dirtyCh += FSC.getStr(injected.internal);
         } else {
            dirtyCh += '{}';
            if (!inlineTemplateBodies) {
               dirtyCh += ';';
            }
         }
      }
      return dirtyCh;
   }

   // Генерация контентной опции (массив)
   function generateFunction(htmlPropertyName, html, string, injected) {
      var generatedString,
         cleanPropertyName = clearPropertyName(htmlPropertyName);
      var wsTemplateName = injected && injected.attribs && injected.attribs._wstemplatename;
      var generatedTemplate = this.getString(html, {}, this.handlers, {}, false);
      var fileName = this.handlers.fileName;
      var funcText = JsTemplates.generateContentTemplate(
         cleanPropertyName,
         generatedTemplate,
         fileName,
         !!string,
         this.esGenerator
      );
      var functionToWrap;

      // Важно: параметр string устанавливается в true, когда на контентной опции задан тип type="string".
      //  В таком случае создается контентная опция и сразу вызывается. Результат - строка (верстка).
      var postfixCall = string ? '(Object.create(data), null, context)' : '';
      var dirtyCh = generateInternal(
         string,
         injected,
         this.inlineTemplateBodies,
         this.internalFunctions,
         fileName
      );
      var func = TemplateLib.createFunction(funcText);
      var funcName = this.setFunctionName(func, wsTemplateName, undefined, cleanPropertyName);
      if (this.contentOptionFunctions) {
         this.contentOptionFunctions.push(func);
         functionToWrap = funcName;
      } else {
         functionToWrap = func
            .toString()
            .replace('function anonymous', 'function ' + funcName)
            .replace(/\n/g, ' ');
      }
      if (this.inlineTemplateBodies) {
         // Режим wml
         generatedString = JsTemplates.generateContentOption(
            // eslint-disable-next-line no-invalid-this
            functionToWrap,
            dirtyCh ? 'shouldCalculateInternal?' + dirtyCh + ':{}' : '{}',
            postfixCall,
            this.isWasabyTemplate,
            this.esGenerator
         );
      } else {
         // Режим tmpl
         generatedString = JsTemplates.generateContentOptionTmpl(
            functionToWrap,
            dirtyCh,
            postfixCall,
            this.isWasabyTemplate,
            this.esGenerator
         );
      }

      // eslint-disable-next-line no-new-wrappers
      var finalResult = new String(generatedString);
      finalResult.innerFunction = true;
      return finalResult;
   }

   function reduceFunctionsArrayToOneString(prev, next) {
      return prev + next;
   }

   function arrayTag(injected, types, scopeData, propertyName, falsy) {
      var children;
      var array = [];
      var nameExists;
      var typeFunction;
      var index;
      var arrayAttributes;
      var stringFunctions = false;
      var variableInner;
      var typeName;

      // Вход в функцию:
      // + узел типа ArrayNode

      if (injected.children) {
         arrayAttributes = parseUtils.parseAttributesForData.call(
            this,
            {
               attribs: injected.attribs,
               isControl: injected.isControl,
               configObject: {},
               rootConfig: injected.rootConfig
            },
            scopeData,
            propertyName,
            false
         );
         if (arrayAttributes && arrayAttributes.type === 'string') {
            stringFunctions = true;
         }
         children = injected.children;
         for (index = 0; index < children.length; ++index) {
            nameExists = tagUtils.splitWs(children[index].name);
            if (nameExists) {
               if (children[index].children) {
                  typeFunction = types[nameExists];
                  if (typeFunction) {
                     // Обработка DataType узлов
                     var res = typeFunction.call(
                        this,
                        {
                           attribs: children[index].attribs,
                           children: children[index].children,
                           isControl: injected.isControl,
                           rootConfig: injected.rootConfig
                        },
                        types,
                        scopeData,
                        propertyName + '/' + index
                     );
                     if (typeof res === 'string') {
                        variableInner = children && children[0] && children[0].children;
                        res = DTC.createDataRepresentation(nameExists, res, variableInner);
                     }
                     array.push(res);
                  } else if (
                     tagUtils.checkForControl(nameExists, true, true) ||
                     !tagUtils.isEntityUsefulOrHTML(nameExists, this._modules)
                  ) {
                     // Генерация содержимого узла ContentOption
                     array.push(
                        DTC.createDataRepresentation(
                           nameExists,
                           generateFunction.call(
                              this,
                              propertyName,
                              [children[index]],
                              stringFunctions,
                              injected
                           )
                        )
                     );
                  } else {
                     // FIXME: Потенциально мервая ветка кода, т.к. ws:Array содержит DataType узлы
                     typeName = undefined;
                     if (nameExists && nameExists.charAt && nameExists.slice) {
                        typeName = nameExists.charAt(0).toUpperCase() + nameExists.slice(1);
                     }

                     // Если была опечатка в имени типа (например, value вместо Value),
                     // то необходимо вывести соответствующую ошибку
                     if (types[typeName]) {
                        errorHandler.error(
                           'Typo in the type name. Use ws:' + typeName + ' instead of ws:',
                           {
                              fileName: this.fileName
                           }
                        );
                     } else {
                        errorHandler.error(
                           children[index].name + " property can't be in the root of ws:array tag",
                           {
                              fileName: this.fileName
                           }
                        );
                     }
                  }
               }
            } else {
               // Генерация Array-узла без контента (данные заданы через атрибуты) или содержимого контентной опции
               array.push(
                  DTC.createDataRepresentation(
                     nameExists,
                     generateFunction.call(
                        this,
                        propertyName,
                        [children[index]],
                        stringFunctions,
                        injected
                     )
                  )
               );
            }
         }
         if (stringFunctions) {
            return array.reduce(reduceFunctionsArrayToOneString, '');
         }
      }

      // Не будем применять меры контентных опций массивов
      // к обычным массивам
      if (falsy) {
         return DTC.createDataRepresentation.call(this, 'Array', array);
      }
      return array;
   }

   return arrayTag;
});
