define('UIDemo/RootTemplateWrapper', [
   'UI/Base',
   'WasabyLoader/ModulesLoader',
   'Core/PromiseLib/PromiseLib',
   'wml!UIDemo/RootTemplateWrapper'
], function (Base, ModulesLoader, PromiseLib, template) {
   'use strict';

   /**
    * This control if the templated passed to props actually exists
    */
   var ModuleClass = Base.Control.extend({
      _template: template,
      _beforeMount: function (opts, _, receivedState) {
         if (receivedState !== undefined) {
            this.templateLoaded = receivedState;
         } else if (ModulesLoader.isLoaded(opts.app)) {
            this.templateLoaded = true;
         } else {
            return PromiseLib.reflect(ModulesLoader.loadAsync(opts.app)).then(
               function (res) {
                  if (res.result) {
                     this.templateLoaded = true;
                     return true;
                  }
                  this.templateLoaded = false;
                  return false;
               }.bind(this)
            );
         }
      }
   });

   return ModuleClass;
});
