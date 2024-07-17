define('ReactUnitTest/_react/OnCompatiblePage/WS3', [
   'Lib/Control/CompoundControl/CompoundControl',
   'tmpl!ReactUnitTest/_react/OnCompatiblePage/WS3'
], function (Control, dotTplFn) {
   'use strict';
   var Child = Control.extend({ _dotTplFn: dotTplFn });
   return Child;
});
