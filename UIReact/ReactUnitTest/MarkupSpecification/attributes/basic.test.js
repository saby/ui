define([
   'ReactUnitTest/MarkupSpecification/testing',
   'ReactUnitTest/MarkupSpecification/asserts'
], (Testing, Asserts) => {
   let checkStr = Asserts.assertMarkup;

   let tests = {
      'boolean attribute': {
         templateStr:
            '' +
            '<div' +
            ' attr1="true"' +
            ' attr2="{{true}}"' +
            ' attr3="false"' +
            ' attr4="{{false}}"' +
            '></div>',
         checkers: [
            checkStr('<div attr1="true" attr2="true" attr3="false"></div>')
         ]
      },

      'input checked attribute': {
         templateStr:
            '' +
            '<input checked="true"/>' +
            '<input checked="{{true}}"/>' +
            '<input checked="false"/>' +
            '<input checked="{{false}}"/>' +
            '<input checked="checked"/>' +
            '',
         checkers: [
            checkStr(
               '' +
                  '' +
                  '<input checked=""/>' +
                  '<input checked=""/>' +
                  '<input checked=""/>' +
                  '<input/>' +
                  '<input checked=""/>' +
                  ''
            )
         ]
      }
   };

   describe('Markup! Class', () => {
      Testing.runTests(tests);
   });
});
