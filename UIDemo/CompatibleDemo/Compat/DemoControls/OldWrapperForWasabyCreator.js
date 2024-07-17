define('UIDemo/CompatibleDemo/Compat/DemoControls/OldWrapperForWasabyCreator', [
   'Lib/Control/CompoundControl/CompoundControl',
   'wml!UIDemo/CompatibleDemo/Compat/DemoControls/OldWrapperForWasabyCreator',
   'UI/Base',
   'Vdom/Vdom',
   'Controls/input'
], function (CompoundControl, template, Base, Vdom, input) {
   var CompatibleDemoNext = CompoundControl.extend({
      _dotTplFn: template,
      _text: null,

      init: function () {
         CompatibleDemoNext.superclass.init.call(this);
         this.myTextBoxElement = this._container.find('.for__ws4');
         this.myTextBox = null;
         var self = this;
         Base.AsyncCreator(
            input.Text,
            {
               name: 'myTextBox'
            },
            this.myTextBoxElement
         )
            .then(function (inst) {
               self.myTextBox = inst;
            })
            .catch(function () {
               // stub
            });
      },

      destroy: function () {
         if (this.myTextBox) {
            Vdom.Synchronizer.unMountControlFromDOM(
               this.myTextBox,
               this.myTextBoxElement
            );
            this.myTextBox = null;
            this.myTextBoxElement = null;
         }
         CompatibleDemoNext.superclass.destroy.apply(this, arguments);
      }
   });

   return CompatibleDemoNext;
});
