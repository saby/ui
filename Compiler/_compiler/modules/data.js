define('Compiler/_compiler/modules/data', [
   'Compiler/_compiler/modules/data/string',
   'Compiler/_compiler/modules/data/array',
   'Compiler/_compiler/modules/data/object',
   'Compiler/_compiler/modules/data/function',
   'Compiler/_compiler/modules/data/value'
], function injectedDataForceLoader(str, arr, obj, func, value) {
   'use strict';

   /**
    * Типы данных для внедрения в тэгах компонента или partial
    */

   return function injectedDataForce(data, scopeData, restricted) {
      var types = {
         String: str,
         Array: arr,
         Object: obj,
         Function: func,
         Number: value,
         Boolean: value,
         Value: value
      };
      return types.Object.call(this, data, types, scopeData, undefined, restricted, true);
   };
});
