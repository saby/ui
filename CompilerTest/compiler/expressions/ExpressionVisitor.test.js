/* global assert */
define([
   'Compiler/_compiler/expressions/Statement',
   'Compiler/_compiler/expressions/Bind',
   'Compiler/_compiler/expressions/Nodes',
   'Compiler/_compiler/expressions/Parser',
   'Compiler/_compiler/codegen/Expression'
], function (StatementLib, BindLib, ExpressionNodes, ParserLib, ExpressionCodegen) {
   'use strict';

   /**
    * TODO: распутать кодогенерацию и убрать завязку тестов на результат кодогенерации.
    */

   function processExpression(text, attributeName, childrenStorage) {
      const context = {
         data: null,
         fileName: 'Compiler/codegen/Expression/template.wml',
         attributeName: attributeName || 'option',
         isControl: false,
         isExprConcat: false,
         configObject: undefined,
         escape: false,
         sanitize: false,
         caller: undefined,
         getterContext: 'data',
         forbidComputedMembers: false,
         childrenStorage: childrenStorage || [],
         checkChildren: true,
         safeCheckVariable: null
      };
      const visitor = new ExpressionCodegen.ExpressionVisitor();
      const parser = new ParserLib.Parser();
      const ast = parser.parse(text);
      return ast.accept(visitor, context);
   }

   function processEventExpression(text, childrenStorage) {
      const context = {
         data: null,
         fileName: 'Compiler/codegen/Expression/event.template.wml',
         attributeName: 'on:event',
         isControl: false,
         isExprConcat: false,
         configObject: undefined,
         escape: false,
         sanitize: false,
         caller: undefined,
         getterContext: 'this',
         forbidComputedMembers: true,
         childrenStorage: childrenStorage || [],
         checkChildren: true,
         safeCheckVariable: null
      };
      const visitor = new ExpressionCodegen.EventExpressionVisitor();
      const parser = new ParserLib.Parser();
      const ast = parser.parse(text);
      return visitor.visit(ast, context);
   }

   function processBindExpression(text) {
      const context = {
         data: null,
         fileName: 'Compiler/codegen/Expression/bind.template.wml',
         attributeName: 'bind:option',
         isControl: false,
         isExprConcat: false,
         configObject: undefined,
         escape: false,
         sanitize: false,
         caller: undefined,
         getterContext: 'data',
         forbidComputedMembers: false,
         childrenStorage: [],
         checkChildren: false
      };
      const visitor = new ExpressionCodegen.BindExpressionVisitor();
      const parser = new ParserLib.Parser();
      const ast = parser.parse(text);
      return ast.accept(visitor, context);
   }

   describe('Compiler/_compiler/codegen/Expression', function () {
      describe('class ExpressionVisitor', function () {
         it('Check function before apply it', function () {
            const html = 'a.b.c("g") && a.b.d && a.b.e.f';
            const actual = processExpression(html);
            const standard =
               '' +
               'thelpers.g/* getter */(data, ["a","b","c"])' +
               '.apply(thelpers.g/* getter */(data, ["a","b"]), ["g"])' +
               '&&thelpers.g/* getter */(data, ["a","b","d"])' +
               '&&thelpers.g/* getter */(data, ["a","b","e","f"])';
            assert.strictEqual(actual, standard);
         });
         it('Check nested functions', function () {
            const html = 'a(b, c(d, e(f), g), h)';
            const actual = processExpression(html);
            const standard =
               '' +
               'thelpers.g/* getter */(data, ["a"]).apply(funcContext, [' +
               'thelpers.g/* getter */(data, ["b"]),' +
               'thelpers.g/* getter */(data, ["c"]).apply(funcContext, [' +
               'thelpers.g/* getter */(data, ["d"]),' +
               'thelpers.g/* getter */(data, ["e"]).apply(funcContext, [' +
               'thelpers.g/* getter */(data, ["f"])' +
               ']),' +
               'thelpers.g/* getter */(data, ["g"])' +
               ']),' +
               'thelpers.g/* getter */(data, ["h"])' +
               '])';
            assert.strictEqual(actual, standard);
         });
         describe('Internal expressions', function () {
            it('Check function before apply it', function () {
               const html = 'a.b.c("g") && a.b.d && a.b.e.f';
               const actual = processExpression(html, '__dirtyCheckingVars_0');
               const standard =
                  'thelpers.i/* callIFun */(thelpers.g/* getter */(data, ["a","b","c"]), thelpers.g/* getter */(data, ["a","b"]), ["g"])&&thelpers.g/* getter */(data, ["a","b","d"])&&thelpers.g/* getter */(data, ["a","b","e","f"])';
               assert.strictEqual(actual, standard);
            });
            it('Check function before apply it 2', function () {
               const html = '!a.b.c("g") && a.b.d && a.b.e.f';
               const actual = processExpression(html, '__dirtyCheckingVars_0');
               const standard =
                  '!thelpers.i/* callIFun */(thelpers.g/* getter */(data, ["a","b","c"]), thelpers.g/* getter */(data, ["a","b"]), ["g"])&&thelpers.g/* getter */(data, ["a","b","d"])&&thelpers.g/* getter */(data, ["a","b","e","f"])';
               assert.strictEqual(actual, standard);
            });
            it('Check nested functions', function () {
               const html = 'a(b, c(d, e(f), g), h)';
               const actual = processExpression(html, '__dirtyCheckingVars_0');
               const standard =
                  'thelpers.i/* callIFun */(thelpers.g/* getter */(data, ["a"]), funcContext, [thelpers.g/* getter */(data, ["b"]),thelpers.i/* callIFun */(thelpers.g/* getter */(data, ["c"]), funcContext, [thelpers.g/* getter */(data, ["d"]),thelpers.i/* callIFun */(thelpers.g/* getter */(data, ["e"]), funcContext, [thelpers.g/* getter */(data, ["f"])]),thelpers.g/* getter */(data, ["g"])]),thelpers.g/* getter */(data, ["h"])])';
               assert.strictEqual(actual, standard);
            });
         });
         describe('ObjectExpressionNode', function () {
            it('Object property as identifier', function () {
               const functionString = processExpression('{id: 123}');
               assert.strictEqual(functionString, '{"id":123}');
            });
            it('Object property as string literal', function () {
               const functionString = processExpression('{"id": 123}');
               assert.strictEqual(functionString, '{"id":123}');
            });
            it('Object property as numeric literal', function () {
               const functionString = processExpression('{123: 456}');
               assert.strictEqual(functionString, '{"123":456}');
            });
         });
      });

      describe('class BindExpressionVisitor', function () {
         describe('API', function () {
            it('isBind', function () {
               assert.isTrue(BindLib.isBind('bind:text'));
               assert.isFalse(BindLib.isBind('event:text'));
               assert.isFalse(BindLib.isBind('bind:'));
               assert.isFalse(BindLib.isBind('bindtext'));
            });
         });
         describe('Spec', function () {
            it('Bind on identifier', function () {
               const functionString = processBindExpression('identifier');
               assert.strictEqual(
                  functionString,
                  'thelpers.s/* setter */(data, ["identifier"], value)'
               );
            });
            it('Bind on context identifier', function () {
               const functionString = processBindExpression('data.property.identifier');
               assert.strictEqual(
                  functionString,
                  'thelpers.s/* setter */(data, ["data","property","identifier"], value)'
               );
            });
            it('Bind on computed context identifier', function () {
               const functionString = processBindExpression('data["property"].identifier');
               assert.strictEqual(
                  functionString,
                  'thelpers.s/* setter */(data, ["data","property","identifier"], value)'
               );
            });
            it('Bind on computed context identifier 2', function () {
               const functionString = processBindExpression('data[property].identifier');
               assert.strictEqual(
                  functionString,
                  'thelpers.s/* setter */(data, ["data",thelpers.g/* getter */(data, ["property"]),"identifier"], value)'
               );
            });
            it('Bind on computed context identifier 3', function () {
               const functionString = processBindExpression(
                  'data[condition ? first : second].identifier'
               );
               assert.strictEqual(
                  functionString,
                  'thelpers.s/* setter */(data, ["data",(thelpers.g/* getter */(data, ["condition"]) ? thelpers.g/* getter */(data, ["first"]) : thelpers.g/* getter */(data, ["second"])),"identifier"], value)'
               );
            });
            it('Bind on computed context identifier 4', function () {
               const functionString = processBindExpression('data[property.getName()].identifier');
               assert.strictEqual(
                  functionString,
                  'thelpers.s/* setter */(data, ["data",thelpers.g/* getter */(data, ["property","getName"]).apply(thelpers.g/* getter */(data, ["property"]), []),"identifier"], value)'
               );
            });
            it('Bind on record on _options', function () {
               const functionString = processBindExpression('_options.record.field');
               assert.strictEqual(
                  functionString,
                  'thelpers.s/* setter */(data, ["_options","record","field"], value)'
               );
            });
         });
         describe('Stress', function () {
            it('Literal', function () {
               try {
                  processBindExpression('123');
               } catch (error) {
                  assert.strictEqual(error.message, 'Запрещено выполнять bind на литералы');
                  return;
               }
               throw new Error('This test must be failed');
            });
            it('Binary operator in root', function () {
               try {
                  processBindExpression('ident1 + ident2');
               } catch (error) {
                  assert.strictEqual(
                     error.message,
                     'Запрещено использовать бинарный оператор в корне bind-выражения'
                  );
                  return;
               }
               throw new Error('This test must be failed');
            });
            it('Logical operator in root', function () {
               try {
                  processBindExpression('ident1 || ident2');
               } catch (error) {
                  assert.strictEqual(
                     error.message,
                     'Запрещено использовать логический оператор в корне bind-выражения'
                  );
                  return;
               }
               throw new Error('This test must be failed');
            });
            it('Unary operator in root', function () {
               try {
                  processBindExpression('-ident1');
               } catch (error) {
                  assert.strictEqual(
                     error.message,
                     'Запрещено использовать унарный оператор в корне bind-выражения'
                  );
                  return;
               }
               throw new Error('This test must be failed');
            });
            it('Conditional operator in root', function () {
               try {
                  processBindExpression('condition ? ident1 : ident2');
               } catch (error) {
                  assert.strictEqual(
                     error.message,
                     'Запрещено использовать тернарный оператор в корне bind-выражения'
                  );
                  return;
               }
               throw new Error('This test must be failed');
            });
            it('Array declaration in root', function () {
               try {
                  processBindExpression('[ident]');
               } catch (error) {
                  assert.strictEqual(
                     error.message,
                     'Запрещено объявлять массив в корне bind-выражения'
                  );
                  return;
               }
               throw new Error('This test must be failed');
            });
            it('Object declaration in root', function () {
               try {
                  processBindExpression('{ prop: ident }');
               } catch (error) {
                  assert.strictEqual(
                     error.message,
                     'Запрещено объявлять объект в корне bind-выражения'
                  );
                  return;
               }
               throw new Error('This test must be failed');
            });
            it('Bind on _options field', function () {
               try {
                  processBindExpression('_options.field');
               } catch (error) {
                  assert.strictEqual(
                     error.message,
                     'Запрещено использовать bind на свойства объекта _options: данный объект заморожен'
                  );
                  return;
               }
               throw new Error('This test must be failed');
            });
         });
      });

      describe('class EventExpressionVisitor', function () {
         describe('Spec', function () {
            it('Simple handler', function () {
               const result = processEventExpression('_handler()');
               assert.strictEqual(result.handlerName, '_handler');
               assert.strictEqual(result.args.length, 0);
               assert.strictEqual(result.fn, 'thelpers.g/* getter */(this, ["_handler"])');
               assert.strictEqual(result.context, 'this');
            });
            it('Simple handler with identifier as argument', function () {
               const result = processEventExpression('_handler(identifier)');
               assert.strictEqual(result.handlerName, '_handler');
               assert.strictEqual(result.args.length, 1);
               assert.strictEqual(result.args[0], 'thelpers.g/* getter */(data, ["identifier"])');
               assert.strictEqual(result.fn, 'thelpers.g/* getter */(this, ["_handler"])');
               assert.strictEqual(result.context, 'this');
            });
            it('Simple handler with literal as argument', function () {
               const result = processEventExpression('_handler(true)');
               assert.strictEqual(result.handlerName, '_handler');
               assert.strictEqual(result.args.length, 1);
               assert.strictEqual(result.args[0], 'true');
               assert.strictEqual(result.fn, 'thelpers.g/* getter */(this, ["_handler"])');
               assert.strictEqual(result.context, 'this');
            });
            it('Context handler', function () {
               const result = processEventExpression('data.property._handler()');
               assert.strictEqual(result.handlerName, '_handler');
               assert.strictEqual(result.args.length, 0);
               assert.strictEqual(
                  result.fn,
                  'thelpers.g/* getter */(this, ["data","property","_handler"])'
               );
               assert.strictEqual(
                  result.context,
                  'thelpers.g/* getter */(this, ["data","property"])'
               );
            });
            it('Context handler with identifier as argument', function () {
               const result = processEventExpression('data.property._handler(identifier)');
               assert.strictEqual(result.handlerName, '_handler');
               assert.strictEqual(result.args.length, 1);
               assert.strictEqual(result.args[0], 'thelpers.g/* getter */(data, ["identifier"])');
               assert.strictEqual(
                  result.fn,
                  'thelpers.g/* getter */(this, ["data","property","_handler"])'
               );
               assert.strictEqual(
                  result.context,
                  'thelpers.g/* getter */(this, ["data","property"])'
               );
            });
            it('Context handler in braces', function () {
               const result = processEventExpression('(data.property._handler)()');
               assert.strictEqual(result.handlerName, '_handler');
               assert.strictEqual(result.args.length, 0);
               assert.strictEqual(
                  result.fn,
                  '(thelpers.g/* getter */(this, ["data","property","_handler"]))'
               );
               assert.strictEqual(
                  result.context,
                  'thelpers.g/* getter */(this, ["data","property"])'
               );
            });
            it('Handler with the same name as parent', function () {
               const result = processEventExpression('process()', ['process']);
               assert.strictEqual(result.handlerName, 'process');
               assert.strictEqual(result.args.length, 0);
               assert.strictEqual(result.fn, 'thelpers.g/* getter */(this, ["process"])');
               assert.strictEqual(result.context, 'this');
            });
            it('Context handler with parent', function () {
               const result = processEventExpression('parent.handler()', ['parent']);
               assert.strictEqual(result.handlerName, 'handler');
               assert.strictEqual(result.args.length, 0);
               assert.strictEqual(
                  result.fn,
                  'thelpers.g/* getter */(this._children, ["parent","handler"])'
               );
               assert.strictEqual(
                  result.context,
                  'thelpers.g/* getter */(this._children, ["parent"])'
               );
            });
            it('Context handler with braced parent', function () {
               const result = processEventExpression('(parent.handler)()', ['parent']);
               assert.strictEqual(result.handlerName, 'handler');
               assert.strictEqual(result.args.length, 0);
               assert.strictEqual(
                  result.fn,
                  '(thelpers.g/* getter */(this._children, ["parent","handler"]))'
               );
               assert.strictEqual(
                  result.context,
                  'thelpers.g/* getter */(this._children, ["parent"])'
               );
            });
            it('Long context handler with parent', function () {
               const result = processEventExpression('a.b.c.d.e.f.g()', ['a']);
               assert.strictEqual(result.handlerName, 'g');
               assert.strictEqual(result.args.length, 0);
               assert.strictEqual(
                  result.fn,
                  'thelpers.g/* getter */(this._children, ["a","b","c","d","e","f","g"])'
               );
               assert.strictEqual(
                  result.context,
                  'thelpers.g/* getter */(this._children, ["a","b","c","d","e","f"])'
               );
            });
            it('Long context handler', function () {
               const result = processEventExpression('a.b.c.d.e.f.g()');
               assert.strictEqual(result.handlerName, 'g');
               assert.strictEqual(result.args.length, 0);
               assert.strictEqual(
                  result.fn,
                  'thelpers.g/* getter */(this, ["a","b","c","d","e","f","g"])'
               );
               assert.strictEqual(
                  result.context,
                  'thelpers.g/* getter */(this, ["a","b","c","d","e","f"])'
               );
            });
            it('Handler arguments with parent', function () {
               const result = processEventExpression('parent.handler(a, parent.b)', ['parent']);
               assert.strictEqual(result.handlerName, 'handler');
               assert.strictEqual(result.args.length, 2);
               assert.strictEqual(result.args[0], 'thelpers.g/* getter */(data, ["a"])');
               assert.strictEqual(result.args[1], 'thelpers.g/* getter */(data, ["parent","b"])');
               assert.strictEqual(
                  result.fn,
                  'thelpers.g/* getter */(this._children, ["parent","handler"])'
               );
               assert.strictEqual(
                  result.context,
                  'thelpers.g/* getter */(this._children, ["parent"])'
               );
            });
         });
         describe('Stress', function () {
            it('Non-function', function () {
               try {
                  processEventExpression('123');
               } catch (error) {
                  assert.strictEqual(
                     error.message,
                     'Ожидалось, что обработчик события является функцией'
                  );
                  return;
               }
               throw new Error('This test must be failed');
            });
            it('Computed function handler name', function () {
               try {
                  processEventExpression('data.property["_handler"]()');
               } catch (error) {
                  assert.strictEqual(
                     error.message,
                     'Имя функции-обработчика события не может быть вычисляемым'
                  );
                  return;
               }
               throw new Error('This test must be failed');
            });
            it('Computed context handler', function () {
               try {
                  processEventExpression('data[item.get("value")]._handler()');
               } catch (error) {
                  assert.strictEqual(error.message, 'Вычисляемые member-выражения запрещены');
                  return;
               }
               throw new Error('This test must be failed');
            });
            it('Context with literal handler', function () {
               try {
                  processEventExpression('data["property"]._handler()');
               } catch (error) {
                  assert.strictEqual(error.message, 'Вычисляемые member-выражения запрещены');
                  return;
               }
               throw new Error('This test must be failed');
            });
         });
      });
   });
});
