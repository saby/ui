define('Compiler/modules/data/array', [
   'Compiler/utils/ErrorHandler',
   'Compiler/modules/utils/parse',
   'Compiler/modules/utils/tag',
   'Compiler/modules/data/utils/dataTypesCreator',
   'Compiler/modules/data/utils/functionStringCreator',
   'Compiler/codegen/templates',
   'Compiler/codegen/Internal'
], function arrayLoader(ErrorHandlerLib, parseUtils, tagUtils, DTC, FSC, templates, Internal) {
   'use strict';

   /**
    * @author Крылов М.А.
    */

   var errorHandler = ErrorHandlerLib.createErrorHandler(true);

   function clearPropertyName(propertyName) {
      return propertyName ? propertyName.split('/').pop() : propertyName;
   }

   function generateInternal(string, injected, inlineTemplateBodies, internalFunctions) {
      if (Internal.canUseNewInternalFunctions() && internalFunctions) {
         return FSC.getStr(Internal.generate(injected.__$ws_internalTree, internalFunctions));
      }

      var dirtyCh = '';
      if (!string) {
         if (!inlineTemplateBodies) {
            dirtyCh = 'this.func.internal = ';
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
      var generatedString, cleanPropertyName = clearPropertyName(htmlPropertyName);
      var wsTemplateName = injected && injected.attribs && injected.attribs._wstemplatename;
      var generatedTemplate = this.getString(html, { }, this.handlers, { }, false);
      var fileName = this.handlers.fileName;
      var funcText = templates.generateContentTemplate(cleanPropertyName, generatedTemplate, fileName, !!string);
      var functionToWrap;

      // Важно: параметр string устанавливается в true, когда на контентной опции задан тип type="string".
      //  В таком случае создается контентная опция и сразу вызывается. Результат - строка (верстка).
      var postfixCall = string ? '(Object.create(data), null, context)' : '';
      var dirtyCh = generateInternal(string, injected, this.inlineTemplateBodies, this.internalFunctions, fileName);

      // eslint-disable-next-line no-new-func
      var func = new Function('data, attr, context, isVdom, sets, forceCompatible, generatorConfig', funcText);
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
         generatedString = templates.generateContentOption(
            functionToWrap, dirtyCh ? ('isVdom?' + dirtyCh + ':{}') : '{}', postfixCall, this.isWasabyTemplate, this.useReact
         );
      } else {
         // Режим tmpl
         generatedString = templates.generateContentOptionTmpl(
            functionToWrap, dirtyCh, postfixCall, this.isWasabyTemplate, this.useReact
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
         arrayAttributes = parseUtils.parseAttributesForData.call(this, {
            attribs: injected.attribs,
            isControl: injected.isControl,
            configObject: { },
            rootConfig: injected.rootConfig
         }, scopeData, propertyName, false);
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
                     var res = typeFunction.call(this, {
                        attribs: children[index].attribs,
                        children: children[index].children,
                        isControl: injected.isControl,
                        rootConfig: injected.rootConfig
                     }, types, scopeData, propertyName + '/' + index);
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
                     array.push(DTC.createDataRepresentation(
                        nameExists,
                        generateFunction.call(this, propertyName, [children[index]], stringFunctions, injected)
                     ));
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
                           'Typo in the type name. Use ws:' + typeName + ' instead of ws:', {
                              fileName: this.fileName
                           }
                        );
                     } else {
                        errorHandler.error(
                           children[index].name + ' property can\'t be in the root of ws:array tag', {
                              fileName: this.fileName
                           }
                        );
                     }
                  }
               }
            } else {
               // Генерация Array-узла без контента (данные заданы через атрибуты) или содержимого контентной опции
               array.push(DTC.createDataRepresentation(
                  nameExists,
                  generateFunction.call(this, propertyName, [children[index]], stringFunctions, injected)
               ));
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
