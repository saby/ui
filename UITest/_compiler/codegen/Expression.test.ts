import { processProperty } from 'Compiler/expressions/Statement';
import { processExpressions } from 'Compiler/expressions/Process';
import { assert } from 'chai';

describe('Compiler/codegen/Expression', () => {
   it('Check function before apply it', () => {
      const html = 'a.b.c("g") && a.b.d && a.b.e.f';
      const program = processProperty(html);
      const standard = '' +
         'thelpers.getter(data, ["a","b","c"])' +
         '.apply(thelpers.getter(data, ["a","b"]), ["g"])' +
         '&&thelpers.getter(data, ["a","b","d"])' +
         '&&thelpers.getter(data, ["a","b","e","f"])';
      const actual = processExpressions(program, {}, '', false, {}, 'option');
      assert.strictEqual(actual, standard);
   });
   it('Check nested functions', () => {
      const html = 'a(b, c(d, e(f), g), h)';
      const program = processProperty(html);
      const standard = ('' +
         'thelpers.getter(data,["a"]).apply(funcContext,[' +
         '    thelpers.getter(data,["b"]),' +
         '    thelpers.getter(data,["c"]).apply(funcContext,[' +
         '        thelpers.getter(data,["d"]),' +
         '        thelpers.getter(data,["e"]).apply(funcContext,[' +
         '            thelpers.getter(data,["f"])' +
         '        ]),' +
         '        thelpers.getter(data,["g"])' +
         '    ]),' +
         '    thelpers.getter(data,["h"])' +
         '])').replace(/ +/gi, '');
      const actual = processExpressions(program, {}, '', false, {}, 'option').replace(/ +/gi, '');
      assert.strictEqual(actual, standard);
   });
   describe('Internal expressions', () => {
      it('Check function before apply it', () => {
         const html = 'a.b.c("g") && a.b.d && a.b.e.f';
         const program = processProperty(html);
         const standard = 'thelpers.callIFun(thelpers.getter(data, ["a","b","c"]), thelpers.getter(data, ["a","b"]), ["g"])&&thelpers.getter(data, ["a","b","d"])&&thelpers.getter(data, ["a","b","e","f"])';
         const actual = processExpressions(program, {}, '', false, {}, '__dirtyCheckingVars_0');
         assert.strictEqual(actual, standard);
      });
      it('Check function before apply it 2', () => {
         const html = '!a.b.c("g") && a.b.d && a.b.e.f';
         const program = processProperty(html);
         const standard = '!thelpers.callIFun(thelpers.getter(data, ["a","b","c"]), thelpers.getter(data, ["a","b"]), ["g"])&&thelpers.getter(data, ["a","b","d"])&&thelpers.getter(data, ["a","b","e","f"])';
         const actual = processExpressions(program, {}, '', false, {}, '__dirtyCheckingVars_0');
         assert.strictEqual(actual, standard);
      });
      it('Check nested functions', () => {
         const html = 'a(b, c(d, e(f), g), h)';
         const program = processProperty(html);
         const standard = 'thelpers.callIFun(thelpers.getter(data,["a"]),funcContext,[thelpers.getter(data,["b"]),thelpers.callIFun(thelpers.getter(data,["c"]),funcContext,[thelpers.getter(data,["d"]),thelpers.callIFun(thelpers.getter(data,["e"]),funcContext,[thelpers.getter(data,["f"])]),thelpers.getter(data,["g"])]),thelpers.getter(data,["h"])])';
         const actual = processExpressions(program, {}, '', false, {}, '__dirtyCheckingVars_0').replace(/ +/gi, '');
         assert.strictEqual(actual, standard);
      });
   });
});
