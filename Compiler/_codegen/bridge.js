define('Compiler/_codegen/bridge', ['Compiler/_codegen/function'], function (
   processingToFunction
) {
   'use strict';

   /**
    * @class
    * @deprecated
    * @description Модуль предназначен для соединения старой и новой логик генерации кода шаблона.
    */

   /**
    * Флаг включения посетителей генерации кода.
    */
   var CODEGEN_VISITORS = false;

   var USE_GENERATE_CODE_FOR_TRANSLATIONS = false;

   /**
    * Инициализировать окружение для wml.
    * @param templateNames {string[]} Коллекция имен inline-шаблонов.
    */
   function initWorkspaceWML(templateNames) {
      processingToFunction.functionNames = {};
      if (Array.isArray(templateNames)) {
         for (var index = 0; index < templateNames.length; ++index) {
            var name = templateNames[index];
            processingToFunction.functionNames[name] = 1;
         }
      }
      processingToFunction.contentOptionFunctions = [];
      processingToFunction.inlineTemplateBodies = {};
      processingToFunction.internalFunctions = [];
   }

   /**
    * Инициализировать окружение для tmpl.
    * @param templateNames {string[]} Коллекция имен inline-шаблонов.
    */
   function initWorkspaceTMPL(templateNames) {
      processingToFunction.functionNames = {};
      if (Array.isArray(templateNames)) {
         for (var index = 0; index < templateNames.length; ++index) {
            var name = templateNames[index];
            processingToFunction.functionNames[name] = 1;
         }
      }
      processingToFunction.contentOptionFunctions = null;
      processingToFunction.inlineTemplateBodies = null;
      processingToFunction.internalFunctions = null;
   }

   /**
    * Очистить окружение
    */
   function cleanWorkspace() {
      processingToFunction.functionNames = null;
      processingToFunction.contentOptionFunctions = null;
      processingToFunction.inlineTemplateBodies = null;
      processingToFunction.internalFunctions = null;
   }

   /**
    * Выполнить генерацию шаблона.
    * @param ast AST-дерево
    * @param data Данные
    * @param handlers Обработчики
    * @param attributes Атрибуты
    * @param internal Коллекция internal-выражений
    * @returns {*} Возвращает шаблонную функцию.
    */
   function getFunction(ast, data, handlers, attributes, internal) {
      if (typeof handlers.generateTranslations === 'undefined') {
         handlers.generateTranslations =
            ((handlers.generateCodeForTranslations &&
               USE_GENERATE_CODE_FOR_TRANSLATIONS) ||
               !USE_GENERATE_CODE_FOR_TRANSLATIONS) &&
            ast.hasTranslations;
      }
      if (CODEGEN_VISITORS) {
         // TODO: Release
      }
      return processingToFunction.getFunction(
         ast,
         data,
         handlers,
         attributes,
         internal
      );
   }

   return {
      initWorkspaceWML: initWorkspaceWML,
      initWorkspaceTMPL: initWorkspaceTMPL,
      cleanWorkspace: cleanWorkspace,
      getFunction: getFunction
   };
});
