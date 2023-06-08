define('Compiler/_modules/template', [
   'Compiler/_utils/ErrorHandler',
   'Compiler/Config',
   'Compiler/_codegen/JsTemplates'
], function templateLoader(ErrorHandlerLib, BuilderConfig, JsTemplates) {
   'use strict';

   /**
    */

   var errorHandler = ErrorHandlerLib.createErrorHandler(true);

   function validateTemplateName(tag) {
      var name = tag.attribs.name;
      if (BuilderConfig.Config.reservedWords.includes(name)) {
         errorHandler.error(
            "Встречено разерверированное служебное слово '" +
               name +
               "' в названии шаблона",
            {
               fileName: this.fileName
            }
         );
      }
      if (!name.match(/^[a-zA-Z_]\w*$/g) && /\.wml$/g.test(this.fileName)) {
         errorHandler.error("Некорректное имя шаблона '" + name + "'", {
            fileName: this.fileName
         });
      }
      return name;
   }

   var templateM = {
      module: function templateModule(tag) {
         // ws:template name already reserved
         var name = validateTemplateName.call(this, tag);
         function templateReady() {
            var result, functionString;
            functionString = this.getString(
               tag.children,
               {},
               this.handlers,
               {},
               false
            );
            if (this.inlineTemplateBodies) {
               functionString =
                  JsTemplates.generateInlineTemplate(functionString);
               this.inlineTemplateBodies[name] = functionString;
               return '';
            }
            result = JsTemplates.generateInlineTemplateTmpl(
               name,
               functionString
            );
            return result;
         }
         return templateReady;
      }
   };
   return templateM;
});
