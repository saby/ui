/**
 * Created by dv.zuev on 18.05.2017.
 */
/* global assert */
define(['UI/Builder', 'UI/Executor'], function (Builder, Executor) {
   'use strict';

   var template = Builder.Tmpl;
   var config = Builder.Config;

   describe('Compiler/Tmpl', function () {
      describe('Generate function', function () {
         it('function from string', function () {
            let str = '<div>a</div>';
            let f = template.getFunction(str, config, Executor.TClosure);
            assert.isTrue(typeof f === 'function');
         });
         it('function from string to JSON', function () {
            let str = '<div>a</div>';
            let f = template.getFunction(str, config, Executor.TClosure);
            assert.isTrue(f.toJSON() === str);
         });
      });
   });
});
