define([
   'ReactUnitTest/MarkupSpecification/testing',
   'ReactUnitTest/MarkupSpecification/asserts'
], (Testing, Asserts) => {
   let checkStr = Asserts.assertMarkup;

   let tests = {
      'Template attributes splash': {
         templateStr:
            '' +
            '<ws:template name="rr">' +
            '<ws:partial attributes="{{ attrs }}" template="{{injected}}"></ws:partial>' +
            '</ws:template>' +
            '<ws:partial template="rr" attrs="{{ attributes }}">' +
            '<ws:injected><i>text</i></ws:injected>' +
            '</ws:partial>',
         checkers: checkStr(
            '<i tabindex="0" class="some" id="crash" data="cheep">text</i>'
         ),
         executionConfig: {
            data: {
               attributes: {
                  class: 'some',
                  id: 'crash',
                  data: 'cheep'
               }
            }
         }
      },
      'attribute with zero value': {
         templateStr: '<div attr:data-index="{{0}}"></div>',
         checkers: checkStr('<div data-index="0"></div>'),
         executionConfig: {
            data: {
               attributes: {
                  class: 'some',
                  id: 'crash',
                  data: 'cheep'
               }
            }
         }
      }
   };

   describe('Markup! Attributes', () => {
      Testing.runTests(tests);
   });
});
