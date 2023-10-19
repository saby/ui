define('UIDemo/CompatibleDemo/Compat/Wasaby/CoreCreator/CoreCreator', [
   'Lib/Control/CompoundControl/CompoundControl',
   'wml!UIDemo/CompatibleDemo/Compat/Wasaby/CoreCreator/CoreCreator'
], function (CompoundControl, template) {
   'use strict';

   var WasabyCreateDemo = CompoundControl.extend({
      _dotTplFn: template,

      init: function () {
         WasabyCreateDemo.superclass.init.call(this);
      },
      destroy: function () {
         WasabyCreateDemo.superclass.destroy.apply(this, arguments);
      }
   });
   WasabyCreateDemo._styles = ['UIDemo/CompatibleDemo/CompatibleDemo'];

   return WasabyCreateDemo;
});
