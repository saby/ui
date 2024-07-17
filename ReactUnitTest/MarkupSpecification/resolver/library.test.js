define(['ReactUnitTest/MarkupSpecification/testing', 'ReactUnitTest/MarkupSpecification/asserts'], (
   Testing,
   Asserts
) => {
   let checkStr = Asserts.assertMarkup;

   let tests = {
      'Library 1': {
         templateStr:
            '' +
            '<ws:partial template="ReactUnitTest/MarkupSpecification/resolver/TestLibrary:TestControl"/>',
         checkers: [checkStr('<div tabindex="0" attr="test-container"></div>')],
         executionConfig: {
            data: {}
         }
      }
   };

   describe('Markup! Library', () => {
      Testing.runTests(tests);
   });
});
