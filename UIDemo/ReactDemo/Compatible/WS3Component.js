define('UIDemo/ReactDemo/Compatible/WS3Component', [
   'Lib/Control/CompoundControl/CompoundControl',
   'wml!UIDemo/ReactDemo/Compatible/WS3Component'
], function (Control, dotTplFn) {
   'use strict';
   var Child = Control.extend({ _dotTplFn: dotTplFn });
   return Child;
});
