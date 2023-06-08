define([
   'ReactUnitTest/MarkupSpecification/testing',
   'ReactUnitTest/MarkupSpecification/asserts',
   'ReactUnitTest/MarkupSpecification/resolver/TestControl',
   'wml!ReactUnitTest/MarkupSpecification/resolver/TestControl'
], (Testing, Asserts, TestControl, WmlTestControl) => {
   let checkStr = Asserts.assertMarkup;

   let tests = {
      'Inline template 1': {
         templateStr:
            '' +
            '<ws:template name="abc">' +
            '<div></div>' +
            '</ws:template>' +
            '<ws:partial template="abc"/>',
         checkers: [checkStr('<div></div>')],
         executionConfig: {
            data: {}
         }
      },
      'Inline template 2': {
         templateStr:
            '' +
            '<ws:partial template="{{\'ReactUnitTest/MarkupSpecification/resolver/TestControl\'}}"/>',
         checkers: [checkStr('<div></div>')],
         executionConfig: {
            data: {}
         }
      },
      'Inline template 3': {
         templateStr:
            '' +
            '<ws:partial template="{{\'wml!ReactUnitTest/MarkupSpecification/resolver/TestControl\'}}"/>',
         checkers: [checkStr('<div></div>')],
         executionConfig: {
            data: {}
         }
      },
      'Inline template 4': {
         templateStr: '<ws:partial template="{{TestControl}}"/>',
         checkers: [checkStr('<div></div>')],
         executionConfig: {
            data: {
               TestControl
            }
         }
      },
      'Inline template 5': {
         templateStr: '<ws:partial template="{{WmlTestControl}}"/>',
         checkers: [checkStr('<div></div>')],
         executionConfig: {
            data: {
               WmlTestControl
            }
         }
      }
   };

   describe('Markup! Inline', () => {
      Testing.runTests(tests);
   });
});
