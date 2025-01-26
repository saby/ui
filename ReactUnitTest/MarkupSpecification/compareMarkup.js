/* global assert */
define('ReactUnitTest/MarkupSpecification/compareMarkup', [
   'react-dom/server'
], function (ReactDOMServer) {
   'use strict';

   const EMPTY_STRING = '';

   function cleanMarkup(markup) {
      // TODO: выяснить необходимость вырезания этих атрибутов.
      return markup
         .replace(/(\r)|(\n)/g, EMPTY_STRING)
         .replace(/ data-reactroot=""/gi, EMPTY_STRING);
   }

   // eslint-disable-next-line consistent-return
   function compareMarkup(standard, actual) {
      if (actual instanceof Error) {
         return false;
      }

      let cleanStandard = standard;
      let cleanActual = ReactDOMServer.renderToString(actual);
      cleanStandard = cleanMarkup(cleanStandard);
      cleanActual = cleanMarkup(cleanActual);
      assert.deepEqual(cleanActual, cleanStandard);
   }
   return compareMarkup;
});
