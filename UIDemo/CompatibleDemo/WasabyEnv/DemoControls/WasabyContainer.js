define('UIDemo/CompatibleDemo/WasabyEnv/DemoControls/WasabyContainer', [
   'UI/Base',
   'wml!UIDemo/CompatibleDemo/WasabyEnv/DemoControls/WasabyContainer',
   'Lib/Control/LayerCompatible/LayerCompatible'
], function (Base, template, CompatibleLayer) {
   'use strict';

   var WasabyContainer = Base.Control.extend({
      _template: template,
      _compatibleReady: false,
      _text: null,

      _beforeMount: function () {
         this._text = 'Wait...';
      },

      _afterMount: function () {
         var self = this;
         CompatibleLayer.load().addCallback(function () {
            self._compatibleReady = true;
            self._text = 'Init success!';
            self._forceUpdate();
         });
      },
      _setText: function (e, value) {
         this._text = value;
      },

      _setTextOld: function (e, value) {
         this._parent._logicParent._setText(e, value);
      }
   });
   WasabyContainer._styles = ['UIDemo/CompatibleDemo/CompatibleDemo'];

   return WasabyContainer;
});
