define('ReactUnitTest/_compatible/resources/WS3Control', [
   'Lib/Control/CompoundControl/CompoundControl',
   'wml!ReactUnitTest/_compatible/resources/WS3Control',
   'Lib/Control/Control.compatible',
   'Lib/Control/AreaAbstract/AreaAbstract.compatible',
   'Lib/Control/BaseCompatible/BaseCompatible',
   'Core/helpers/Hcontrol/makeInstanceCompatible',
   'Lib/StickyHeader/StickyHeaderMediator/StickyHeaderMediator',
   'View/ExecutorCompatible',
   'Core/nativeExtensions',
   'css!SBIS3.CONTROLS/themes/online/onlineCompatible'
], (CompoundControl, dotTplFn) => {
   'use strict';

   const CompoundChild = CompoundControl.extend({
      $protected: {
         _options: {}
      },
      _dotTplFn: dotTplFn
   });

   return CompoundChild;
});
