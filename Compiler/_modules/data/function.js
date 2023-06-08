define('Compiler/_modules/data/function', [
   'Compiler/_modules/data/utils/functionStringCreator',
   'Compiler/_modules/utils/parse'
], function (FSC, parseUtils) {
   'use strict';

   /**
    * Для обработки type="function" в конфигурации компонента
    */

   return function functionTag(injected) {
      return FSC.functionTypeHandler(
         this._processData.bind(this),
         injected.children,
         injected.attribs,
         parseUtils.parseAttributesForData
      );
   };
});
