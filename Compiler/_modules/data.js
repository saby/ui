define('Compiler/_modules/data', [
   'Compiler/_modules/data/string',
   'Compiler/_modules/data/array',
   'Compiler/_modules/data/object',
   'Compiler/_modules/data/function',
   'Compiler/_modules/data/value'
], function injectedDataForceLoader(str, arr, obj, func, value) {
   'use strict';

   /**
    * Типы данных для внедрения в тэгах компонента или partial
    *
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
      return types.Object.call(
         this,
         data,
         types,
         scopeData,
         undefined,
         restricted,
         true
      );
   };
});
