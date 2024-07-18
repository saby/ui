define('UIDemo/CompatibleDemo/WasabyEnv/WS3/WS3WithHandlers', [
   'UI/Base',
   'wml!UIDemo/CompatibleDemo/WasabyEnv/WS3/WS3WithHandlers',
   'Lib/Control/LayerCompatible/LayerCompatible'
], function (Base, template, CompatibleLayer) {
   'use strict';

   var WS3WithHandlers = Base.Control.extend({
      _template: template,
      _compatibleReady: false,
      _textForWs3Control: null,
      _textForWasabyControl: null,

      _beforeMount: function () {
         this._textForWs3Control = 'Wait...';
         this._textForWasabyControl = this._textForWs3Control;
      },

      _afterMount: function () {
         var self = this;
         CompatibleLayer.load().addCallback(function () {
            self._compatibleReady = true;
            self._textForWs3Control = 'Init success!';
            self._proxySetTextFromWs3Control(null, self._textForWs3Control);
            self._forceUpdate();
         });
      },

      // изменение текста в wasaby-контроле
      _setTextFromWasabyControl: function (e, value) {
         this._textForWs3Control = value;
      },

      // изменение текста в wasaby-контроле, которое "проксируется" из WS3-контрола
      _proxySetTextFromWs3Control: function (e, value) {
         this._textForWasabyControl = value;
      },

      // изменение текста в WS3-контроле, который находится в CompoundContainer
      _setTextFromWs3Control: function (e, value) {
         this.getParent()._logicParent._proxySetTextFromWs3Control(e, value);
      }
   });
   WS3WithHandlers._styles = ['UIDemo/CompatibleDemo/CompatibleDemo'];

   return WS3WithHandlers;
});
