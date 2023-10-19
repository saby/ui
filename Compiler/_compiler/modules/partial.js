define('Compiler/_compiler/modules/partial', [
   'Compiler/_compiler/modules/data',
   'Compiler/_compiler/modules/utils/names',
   'Compiler/_compiler/expressions/Process',
   'Compiler/_compiler/modules/utils/parse',
   'Compiler/_compiler/modules/data/utils/functionStringCreator',
   'Compiler/_compiler/codegen/Generator',
   'Compiler/_compiler/codegen/JsTemplates',
   'Compiler/_compiler/codegen/TClosure',
   'Compiler/_compiler/codegen/feature/Partial',
   'Compiler/_compiler/codegen/Internal'
], function partialLoader(
   injectedDataForce,
   names,
   Process,
   parse,
   FSC,
   Generator,
   JsTemplates,
   TClosure,
   FeaturePartial,
   Internal
) {
   'use strict';

   var USE_NEW_GENERATOR_METHODS = true;

   function calculateData(sequence) {
      var string = '',
         attrData = sequence.data,
         i;
      if (attrData.length) {
         if (attrData.length === 1) {
            return attrData[0].value;
         }
         for (i = 0; i < attrData.length; i++) {
            string += attrData[i].value;
         }
         return string;
      }
      return sequence;
   }

   function isControl(tag) {
      return !!(
         tag.children &&
         tag.children[0] &&
         tag.children[0].fn &&
         (names.isControlString(tag.children[0].fn) || names.isSlashedControl(tag.children[0].fn))
      );
   }

   function isModule(tag) {
      return !!(tag.children && tag.children[0] && tag.children[0].type === 'module');
   }

   function prepareScope(tag, data) {
      return injectedDataForce.call(
         this,
         {
            children: tag.injectedData,
            attribs: tag.attribs,
            isControl: isControl(tag),
            internal: tag.internal,
            wsInternalTree: tag.wsInternalTree
         },
         data,
         {
            partial: tag.name === 'ws:partial'
         }
      );
   }

   function getWsTemplateName(tag) {
      if (tag.name === 'ws:partial') {
         if (tag.attribs._wstemplatename.data) {
            return 'ws:' + tag.attribs._wstemplatename.data.value.replace(/^js!/, '');
         }
         return 'ws:' + tag.attribs._wstemplatename.replace(/^js!/, '');
      }
      return tag.name;
   }

   function getLibraryModulePath(tag) {
      // extract library and module names from the tag
      return {
         library: tag.children[0].library,
         module: tag.children[0].module
      };
   }

   function cleanAttributesCollection(attributes) {
      var result = {};
      for (var name in attributes) {
         if (attributes.hasOwnProperty(name)) {
            var cleanName = name.replace(/^attr:/gi, '');
            result[cleanName] = attributes[name];
         }
      }
      return result;
   }

   function getMergeType(tag, decor) {
      if (tag.injectedTemplate) {
         if (decor && decor.isMainAttrs) {
            return 'attribute';
         }
         return 'none';
      }
      if (decor) {
         return 'attribute';
      }
      return 'context';
   }

   function prepareDataForCodeGeneration(tag, data, decor) {
      var tagIsWsControl = isControl(tag);
      var tagIsModule = isModule(tag);
      var tagIsDynamicPartial = !!tag.injectedTemplate;
      var scope = null;
      var compositeAttributes = null;
      var cleanAttributes = {};
      var events = {};
      if (tag.attribs) {
         // FIXME: Temporary disable
         // if (tag.attribs.hasOwnProperty('scope')) {
         //    scope = Process.processExpressions(
         //       tag.attribs.scope.data[0],
         //       data,
         //       this.fileName,
         //       isControl,
         //       {},
         //       'scope',
         //       false
         //    );
         //    delete tag.attribs.scope;
         // }
         if (tag.attribs.hasOwnProperty('attributes')) {
            compositeAttributes = Process.processExpressions(
               tag.attribs.attributes.data[0],
               data,
               this.fileName,
               isControl,
               {},
               'attributes',
               true
            );
            delete tag.attribs.attributes;
         }
         var decorated = parse.processAttributes.call(
            this,
            tag.attribs,
            data,
            {},
            tagIsWsControl,
            tag
         );
         var attributes = decorated.attributes;
         cleanAttributes = cleanAttributesCollection(attributes);
         events = decorated.events;
      }
      var options = prepareScope.call(this, tag, data);
      var internal =
         tag.internal && Object.keys(tag.internal).length > 0 ? FSC.getStr(tag.internal) : '{}';

      if (this.internalFunctions) {
         // TODO: Test and remove code above
         internal = Internal.generate(tag.wsInternalTree, this.internalFunctions);
      }

      var mergeType = getMergeType(tag, decor);
      var vdomContext =
         'isVdom ? ' +
         this.esGenerator.genStringInterpolation(
            this.esGenerator.toTemplateStringExpression('context') +
               'part_' +
               this.esGenerator.toTemplateStringExpression('templateCount++')
         ) +
         ' : context';
      var context = tagIsModule || tagIsDynamicPartial ? vdomContext : 'context';
      var blockOptionNames = FeaturePartial.getBlockOptionNames(tag);
      var config = FeaturePartial.createConfigNew(
         compositeAttributes,
         scope,
         context,
         internal,
         tag.isRootTag,
         tag.key,
         mergeType,
         blockOptionNames,
         this.handlers.fromBuilderTmpl,
         tag.wsIsContainerNode,
         this.esGenerator
      );

      var result = {
         attributes: FSC.getStr(cleanAttributes),
         events: FSC.getStr(events),
         options: FSC.getStr(options),
         config: config,
         rawOptions: options
      };

      // FIXME: Multiple processing
      tag.__$decoratedData = result;
      return result;
   }

   function getPrettyTemplateName(attribute) {
      if (!attribute) {
         return '[[unknown]]';
      }
      if (Array.isArray(attribute.data)) {
         if (attribute.data.length === 1) {
            var program = attribute.data[0];
            if (program.name && program.name.string) {
               return program.name.string;
            }
            return '[[unknown2]]';
         }
         return '[[unknown3]]';
      }
      return '[[unknown4]]';
   }

   function processNode(tag, data, decor) {
      var tagIsWsControl = isControl(tag);
      var tagIsModule = isModule(tag);
      var tagIsTemplate = tag.children && tag.children[0] && tag.children[0].fn;
      var tagIsDynamicPartial = !!tag.injectedTemplate;
      var config =
         tag.__$decoratedData || prepareDataForCodeGeneration.call(this, tag, data, decor);
      if (tagIsDynamicPartial) {
         // FIXME: Need to process injectedTemplate to get generated code fragment from _wstemplatename
         Process.processExpressions(
            tag.injectedTemplate,
            data,
            this.fileName,
            undefined,
            config.rawOptions
         );
         var templateName = calculateData(tag.attribs._wstemplatename).slice(1, -1);
         var templateNameDescription = getPrettyTemplateName(tag.attribs._wstemplatename);
         return (
            Generator.genCreateControlNew(
               'resolver',
               templateNameDescription,
               templateName,
               config.attributes,
               config.events,
               config.options,
               config.config
            ) + ','
         );
      }
      if (tagIsModule) {
         return (
            Generator.genCreateControlNew(
               'resolver',
               tag.originName,
               FSC.getStr(getLibraryModulePath(tag)),
               config.attributes,
               config.events,
               config.options,
               config.config
            ) + ','
         );
      }
      if (tagIsWsControl) {
         return (
            Generator.genCreateControlNew(
               'wsControl',
               tag.originName,
               '"' + getWsTemplateName(tag) + '"',
               config.attributes,
               config.events,
               config.options,
               config.config
            ) + ','
         );
      }
      var templateValue = tag.attribs._wstemplatename.data.value;
      if (tagIsTemplate) {
         return (
            Generator.genCreateControlNew(
               'template',
               templateValue,
               '"' + templateValue + '"',
               config.attributes,
               config.events,
               config.options,
               config.config
            ) + ','
         );
      }

      // WML compiler
      if (this.inlineTemplateBodies) {
         return (
            Generator.genCreateControlNew(
               'inline',
               templateValue,
               templateValue,
               config.attributes,
               config.events,
               config.options,
               config.config
            ) + ','
         );
      }

      // TMPL compiler
      var inlineTemplateBody = this.getString(tag.children, {}, this.handlers, {}, false);
      var inlineTemplateFunction = JsTemplates.generatePartialTemplate(
         inlineTemplateBody,
         this.esGenerator
      );
      return (
         Generator.genCreateControlNew(
            'inline',
            templateValue,
            inlineTemplateFunction,
            config.attributes,
            config.events,
            config.options,
            config.config
         ) + ','
      );
   }

   var partialM = {
      module: function partialModule(tag, data) {
         return function resolveStatement(decor) {
            var tagIsModule = isModule(tag);
            var tagIsWsControl = isControl(tag);
            var tagIsTemplate = tag.children && tag.children[0] && tag.children[0].fn;
            var tagIsDynamicPartial = !!tag.injectedTemplate;

            // FIXME: включить метод для inline-шаблонов
            var canUseNewMethods =
               tagIsModule || tagIsWsControl || tagIsTemplate || tagIsDynamicPartial;

            if (canUseNewMethods && USE_NEW_GENERATOR_METHODS) {
               return processNode.call(this, tag, data, decor);
            }

            var decorAttribs =
               tag.decorAttribs ||
               parse.parseAttributesForDecoration.call(
                  this,
                  tag.attribs,
                  data,
                  {},
                  tagIsWsControl,
                  tag
               );
            tag.decorAttribs = decorAttribs;
            var preparedScope = prepareScope.call(this, tag, data);
            var strPreparedScope = FSC.getStr(preparedScope);

            var createAttribs = decor
               ? TClosure.genPlainMergeAttr('attr', FSC.getStr(decorAttribs))
               : TClosure.genPlainMergeContext('attr', FSC.getStr(decorAttribs));

            // Start code generation for construction:
            // <ws:partial template="inline_template_name" />

            var callDataArg = TClosure.genPlainMerge(
               'Object.create(data || {})',
               Generator.genPrepareDataForCreate(
                  '"_$inline_template"',
                  strPreparedScope,
                  'attrsForTemplate',
                  '{}'
               ),
               'false'
            );

            var tpl;
            if (this.inlineTemplateBodies) {
               tpl = tag.attribs._wstemplatename.data.value;
            } else {
               var body = this.getString(tag.children, {}, this.handlers, {}, false);
               tpl = JsTemplates.generatePartialTemplate(body, this.esGenerator);
            }

            var beforeCallFn =
               '(' +
               this.esGenerator.genArrowFunction(
                  'attrsForTemplate = ' +
                     createAttribs +
                     ';' +
                     'attrsForTemplate.isInline = true;' +
                     (tag.wsIsContainerNode
                        ? 'attrsForTemplate.isContainerNodeInline = ' +
                          this.esGenerator.genOptionalChaining('attr?.isControlTemplate') +
                          ';'
                        : '') +
                     (tag.wsPassRef
                        ? 'if (attrsForTemplate.isContainerNodeInline) attrsForTemplate.refForContainer = ' +
                          this.esGenerator.genOptionalChaining('attr?.refForContainer') +
                          ';'
                        : '') +
                     'scopeForTemplate = ' +
                     callDataArg +
                     ';'
               ) +
               ')(),';
            var afterCallFn =
               '(' +
               this.esGenerator.genArrowFunction(
                  'attrsForTemplate = null; scopeForTemplate = null;'
               ) +
               ')(),';

            return (
               beforeCallFn +
               tpl +
               '.call(this, scopeForTemplate, attrsForTemplate, context, isVdom),' +
               afterCallFn
            );
         };
      }
   };
   return partialM;
});
