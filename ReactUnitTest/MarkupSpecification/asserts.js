define('ReactUnitTest/MarkupSpecification/asserts', [
   'ReactUnitTest/MarkupSpecification/compareMarkup'
], function (compareMarkup) {
   'use strict';

   function assertMarkup(standard, standardVDOM) {
      let checker = function (isVdom, actual) {
         if (isVdom) {
            return compareMarkup(standardVDOM || standard, actual);
         }
         return compareMarkup(standard, actual);
      };
      checker.type = 'markup';
      return checker;
   }

   return {
      assertMarkup: assertMarkup
   };
});
