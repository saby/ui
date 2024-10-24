define('UIDemo/CompatibleDemo/WasabyEnv/WS3/WithoutCompatible', [
   'UI/Base',
   'wml!UIDemo/CompatibleDemo/WasabyEnv/WS3/WithoutCompatible',
   'Lib/Control/LayerCompatible/LayerCompatible'
], function (Base, template, CompatibleLayer) {
   'use strict';

   var WithoutCompatible = Base.Control.extend({
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
      }
   });
   WithoutCompatible._styles = ['UIDemo/CompatibleDemo/CompatibleDemo'];

   return WithoutCompatible;
});
