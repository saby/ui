define('UIDemo/CompatibleDemo/WasabyEnv/Events/Case1/WS3Control', [
   'Lib/Control/CompoundControl/CompoundControl',
   'tmpl!UIDemo/CompatibleDemo/WasabyEnv/Events/Case1/WS3Control'
], function (CompoundControl, template) {
   var WS3Control = CompoundControl.extend({
      _dotTplFn: template,
      _text: null,
      $protected: {
         _options: {
            isServer: typeof window === 'undefined',
            config: { someOptionForWasabyControl: true }
         }
      },

      init: function () {
         WS3Control.superclass.init.call(this);
         var Creator = require('UI/Base').Creator;
         var config = this._options.config;
         var element = this.getContainer().find('.wasabyContainer');
         require([
            'UIDemo/CompatibleDemo/WasabyEnv/Events/Case1/WasabyControl'
         ], function (WasabyControl) {
            Creator(WasabyControl.default, config, element);
         });
      },

      destroy: function () {
         WS3Control.superclass.destroy.apply(this, arguments);
      }
   });

   return WS3Control;
});
