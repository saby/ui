define('Compiler/_core/bridge', [
   'Core/Deferred',
   'Compiler/_core/Traverse',
   'Compiler/_expressions/Parser',
   'Compiler/_utils/ErrorHandler',
   'Compiler/_core/PatchVisitor',
   'Compiler/_core/Scope',
   'Compiler/_i18n/Translator',
   'Compiler/_core/Annotate'
], function (
   Deferred,
   TraverseLib,
   ParserLib,
   ErrorHandlerLib,
   PatchVisitorLib,
   ScopeLib,
   Translator,
   Annotate
) {
   'use strict';

   /**
    * @deprecated
    * @description Модуль предназначен для соединения старой и новой логик разбора и аннотации деревьев.
    */

   /**
    * Флаг - генерировать rk-функции
    * @todo https://online.sbis.ru/opendoc.html?guid=ea8a25dd-5a2f-4330-8d6f-599c8c5878dd
    * @type {boolean}
    */
   var USE_GENERATE_CODE_FOR_TRANSLATIONS = false;

   /**
    * New annotation method.
    */
   function annotateWithVisitors(
      traversed,
      options,
      traverseOptions,
      deferred
   ) {
      Annotate.process(traversed, traverseOptions.scope);
      PatchVisitorLib.default(traversed, traverseOptions.scope);

      // в случае сбора словаря локализуемых слов отдаем объект
      // { astResult - ast-дерево, words - словарь локализуемых слов }
      if (options.createResultDictionary) {
         deferred.callback({
            astResult: traversed,
            words: traverseOptions.scope.getTranslationKeys()
         });
         return;
      }
      deferred.callback(traversed);
   }

   function prepareTraverse(htmlTree, options) {
      var scope = new ScopeLib.default(!options.fromBuilderTmpl);
      var errorHandler = ErrorHandlerLib.createErrorHandler(
         !options.fromBuilderTmpl
      );
      var traverseConfig = {
         expressionParser: new ParserLib.Parser(),
         hierarchicalKeys: true,
         errorHandler: errorHandler,
         allowComments: false,
         textTranslator: Translator.createTextTranslator(
            options.componentsProperties || {}
         ),
         generateTranslations:
            (USE_GENERATE_CODE_FOR_TRANSLATIONS &&
               !!options.generateCodeForTranslations) ||
            !USE_GENERATE_CODE_FOR_TRANSLATIONS,
         hasExternalInlineTemplates: options.hasExternalInlineTemplates,
         checkInlineTemplateName: options.isWasabyTemplate
      };
      var traverseOptions = {
         fileName: options.fileName,
         scope: scope,
         translateText: true
      };
      var traversed = TraverseLib.default(
         htmlTree,
         traverseConfig,
         traverseOptions
      );
      var hasFailures = errorHandler.hasFailures();
      var lastMessage = hasFailures
         ? errorHandler.popLastErrorMessage()
         : undefined;
      errorHandler.flush();

      return {
         scope: scope,
         traversed: traversed,
         hasFailures: hasFailures,
         lastMessage: lastMessage,
         traverseOptions: traverseOptions
      };
   }

   /**
    * New traverse method.
    */
   function traverse(htmlTree, options) {
      var deferred = new Deferred();
      var result = prepareTraverse(htmlTree, options);

      if (result.hasFailures) {
         deferred.errback(new Error(result.lastMessage));
         return deferred;
      }

      result.scope.requestDependencies().addCallbacks(
         function () {
            return annotateWithVisitors(
               result.traversed,
               options,
               result.traverseOptions,
               deferred
            );
         },
         function (error) {
            deferred.errback(error);
         }
      );
      return deferred;
   }

   function traverseSync(htmlTree, options, dependencies) {
      var result = prepareTraverse(htmlTree, options);

      if (result.hasFailures) {
         throw new Error(result.lastMessage);
      }

      // annotation
      Annotate.process(result.traversed, result.scope);
      PatchVisitorLib.default(result.traversed, result.scope);

      return {
         ast: result.traversed,
         localizedDictionary: result.scope.getTranslationKeys(),
         templateNames: result.traversed.templateNames,
         hasTranslations: result.traversed.hasTranslations,
         dependencies: dependencies
      };
   }

   return {
      traverseSync: traverseSync,
      traverse: traverse
   };
});
