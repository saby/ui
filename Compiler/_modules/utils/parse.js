define('Compiler/_modules/utils/parse', [
   'Compiler/_modules/data/utils/functionStringCreator',
   'Compiler/_modules/utils/common',
   'Compiler/_expressions/Process',
   'Compiler/_expressions/Bind',
   'Compiler/_expressions/Event',
   'Compiler/_codegen/TClosure',
   'Compiler/_utils/ErrorHandler'
], function straightFromFileLoader(
   FSC,
   utils,
   Process,
   bindExpressions,
   eventExpressions,
   TClosure,
   ErrorHandlerLib
) {
   'use strict';

   /**
    */

   /**
    * Collection of special attribute names that are always attributes.
    */
   var SPECIAL_ATTRIBUTES_COLLECTION = [
      'ws-delegates-tabfocus',
      'ws-creates-context',
      'ws-tab-cycling',
      'ws-autofocus',
      'ws-no-focus',
      'tabindex',
      'class',
      'data-access'
   ];

   var errorHandler = ErrorHandlerLib.createErrorHandler(true);

   function isAttr(string) {
      return string.startsWith('attr:');
   }
   function checkRestrictedAttributes(
      isRestricted,
      restrictedAttributes,
      curAttribute
   ) {
      if (isRestricted && isRestricted.partial) {
         restrictedAttributes.push('template');
      }
      return isRestricted
         ? restrictedAttributes.indexOf(curAttribute) === -1
         : true;
   }

   function processDataSequence(
      attributesData,
      data,
      isControl,
      configObject,
      attributeName,
      isAttribute
   ) {
      var string = '';
      var attrData = attributesData && attributesData.data;
      var i;
      if (!attrData) {
         /**
          * Если в теге нет атрибута data,
          * значит это уже преобразованная строка
          */
         return attributesData;
      }
      if (attrData.length) {
         if (attrData.length === 1) {
            Process.processExpressions(
               attrData[0],
               data,
               this.fileName,
               isControl,
               configObject,
               attributeName,
               isAttribute
            );
            return attrData[0].value;
         }
         for (i = 0; i < attrData.length; i++) {
            Process.processExpressions(
               attrData[i],
               data,
               this.fileName,
               isControl,
               configObject,
               attributeName,
               isAttribute
            );
            string += attrData[i].value;
         }
         return string;
      }
      return Process.processExpressions(
         attrData,
         data,
         this.fileName,
         isControl,
         configObject,
         attributeName,
         isAttribute
      );
   }

   /**
    * Парсим атрибуты для понимания прокидываемых данных в partial
    * @param attributes
    * @param data
    * @param propertyName
    * @param restricted
    * @returns {{}}
    */
   function parseAttributesForData(attributes, data, propertyName, restricted) {
      var attr;
      var obj = {};
      var root = 'scope';
      var attribs = 'attributes';
      var attrData;
      var attrName;
      var resolved = {};
      var tmpObj = {};
      var attrs = attributes.attribs;
      var restrictedAttributes = [
         root,
         attribs,
         'class',
         'data-access',
         '_wstemplatename'
      ];

      if (attributes.rootConfig) {
         attributes.rootConfig.esc = false;
      }
      if (attrs !== undefined) {
         if (attrs[root] && attrs[root].data) {
            attrData = attrs[root].data;
            obj = Process.processExpressions(attrData[0], data, this.fileName);
            if (typeof obj === 'string') {
               if (utils.isOptionsExpression(attrData[0])) {
                  obj = TClosure.genFilterOptions(obj);
               }
               resolved.createdscope = obj;
               resolved.obj = {};
               obj = {};
            }
         }
         for (attr in attrs) {
            if (
               attrs.hasOwnProperty(attr) &&
               checkRestrictedAttributes(
                  restricted,
                  restrictedAttributes,
                  attr
               ) &&
               attrs[attr]
            ) {
               attrName = propertyName ? propertyName + '/' + attr : attr;
               tmpObj[attr] = processDataSequence.call(
                  this,
                  attrs[attr],
                  data,
                  attributes.isControl,
                  attributes.rootConfig || tmpObj,
                  attrName
               );
            }
         }
         if (resolved.createdscope) {
            if (utils.isEmpty(tmpObj)) {
               resolved.obj = obj;
            } else {
               resolved.obj = utils.plainMergeAttrs(tmpObj, obj);
            }
            return resolved;
         }
      }
      return utils.plainMergeAttrs(tmpObj, obj);
   }

   /**
    * Разбирает выражения Expression служебной информации, заменяя их на
    * вычисленный результат
    * @param {Object} internal Объект служебной информации
    * @param {Object} data
    * @param propertyName
    * @param isControl
    * @param rootConfig
    * @returns {*}
    */
   function parseInternalForData(
      internal,
      data,
      propertyName,
      isControl,
      rootConfig
   ) {
      for (var attr in internal) {
         if (internal.hasOwnProperty(attr)) {
            var attrName = propertyName ? propertyName + '/' + attr : attr;
            internal[attr] = processDataSequence.call(
               this,
               internal[attr],
               data,
               isControl,
               rootConfig || internal,
               attrName
            );
         }
      }

      return internal;
   }

   function processAttributes(attribs, data, decor, isControl, tag) {
      var attrs;
      var mayBeToMerge = {};
      var needMerge = true;
      var result = {
         attributes: {},
         events: {},
         key: FSC.wrapAroundExec('key+"' + tag.key + '"'),
         inheritOptions: FSC.wrapAroundExec('attr?attr.inheritOptions:{}'),
         internal: FSC.wrapAroundExec('attr?attr.internal:{}'),
         context: FSC.wrapAroundExec('attr?attr.context:{}')
      };
      if (utils.checkProp(attribs, 'attributes')) {
         attrs = processDataSequence.call(
            this,
            attribs.attributes,
            data,
            undefined,
            { composite: true }
         );

         // delete attribs['attributes'];
      }
      var eventMeta = {};
      var needEventMeta = true;
      var eventObject;
      for (var attr in attribs) {
         if (bindExpressions.isBind(attr)) {
            var cleanAttributeName = bindExpressions.getBindAttributeName(attr);
            try {
               // Processing bind expression ("bind:...")
               var eventAttributeName =
                  bindExpressions.getEventAttributeName(attr);
               var eventChain = result.events[eventAttributeName.toLowerCase()];
               eventObject = bindExpressions.processBindAttribute(
                  attribs[attr],
                  attr,
                  data,
                  isControl,
                  this.fileName,
                  this.childrenStorage,
                  eventChain,
                  needEventMeta
               );
               result.events[eventAttributeName.toLowerCase()] =
                  eventObject.chain;
               if (needEventMeta) {
                  eventMeta = eventObject.eventMeta;
                  needEventMeta = false;
               }
            } catch (error) {
               errorHandler.error(
                  'На теге "' +
                     tag.originName +
                     '" значение атрибута "' +
                     attr +
                     '" некорректно "' +
                     attribs[attr].data[0].name.string +
                     '": ' +
                     error.message +
                     '. Данный атрибут будет обработан как опция. ' +
                     'Строка ' +
                     (tag.attributes[attr].position.line + 1) +
                     ', ' +
                     'столбец ' +
                     (tag.attributes[attr].position.column + 1),
                  {
                     fileName: this.fileName
                  }
               );
            } finally {
               // Create attribute object
               attribs[cleanAttributeName] = attribs[attr];
               delete attribs[attr];
            }
         } else if (eventExpressions.isEvent(attr)) {
            try {
               eventObject = eventExpressions.processEventAttribute(
                  attribs[attr],
                  attr,
                  data,
                  isControl,
                  this.fileName,
                  this.childrenStorage,
                  needEventMeta
               );
               var eventName = attr.toLowerCase();
               if (needEventMeta) {
                  eventMeta = eventObject.eventMeta;
                  needEventMeta = false;
               }
               if (result.events[eventName] === undefined) {
                  result.events[eventName] = eventObject.chain;
               } else {
                  // If event with the same name already present, add object to the array
                  result.events[eventName].push(eventObject.chain[0]);
               }
            } catch (error) {
               errorHandler.error(
                  'На теге "' +
                     tag.originName +
                     '" значение атрибута "' +
                     attr +
                     '" некорректно "' +
                     attribs[attr].data[0].name.string +
                     '": ' +
                     error.message +
                     '. Игнорирую данное выражение. ' +
                     'Строка ' +
                     (tag.attributes[attr].position.line + 1) +
                     ', ' +
                     'столбец ' +
                     (tag.attributes[attr].position.column + 1),
                  {
                     fileName: this.fileName
                  }
               );
            } finally {
               delete attribs[attr];
            }
         } else if (isAttr(attr)) {
            needMerge = false;
            var newAttr = attr.replace('attr:', '');
            result.attributes[newAttr] = processDataSequence.call(
               this,
               attribs[attr],
               data,
               isControl,
               attribs,
               attr,
               true
            );
            delete attribs[attr];
         } else if (SPECIAL_ATTRIBUTES_COLLECTION.indexOf(attr) > -1) {
            mayBeToMerge[attr] = processDataSequence.call(
               this,
               attribs[attr],
               data,
               isControl,
               attribs,
               attr,
               true
            );
         }
      }
      if (needMerge) {
         for (var one in mayBeToMerge) {
            if (mayBeToMerge.hasOwnProperty(one)) {
               result.attributes[one] = mayBeToMerge[one];
               delete attribs[one.split('attr:')[1]];
            }
         }
      }
      if (typeof attrs === 'string') {
         result.attributes = FSC.wrapAroundExec(
            TClosure.genProcessMergeAttributes(
               attrs,
               FSC.getStr(result.attributes)
            ),
            true
         );
      }
      if (!needEventMeta) {
         result.events.meta = eventMeta;
      }
      return result;
   }

   function parseAttributesForDecoration(attribs, data, decor, isControl, tag) {
      if (!attribs) {
         return undefined;
      }
      var result = processAttributes.call(
         this,
         attribs,
         data,
         decor,
         isControl,
         tag
      );
      if (Object.keys(result.events).length) {
         result.events = FSC.wrapAroundExec(
            'typeof window === "undefined"?{}:' + FSC.getStr(result.events)
         );
      }
      return result;
   }

   /**
    * Для проверки существования директивы и её модульной функции,
    *  которую можно применять в модулях, например <div if="{{true}}">...</div>
    * @param  {Object} name
    * @return {Function}
    */
   function attributeParserMatcherByName(name) {
      return name !== undefined ? this._attributeModules[name].module : false;
   }

   return {
      processAttributes: processAttributes,
      parseAttributesForData: parseAttributesForData,
      parseInternalForData: parseInternalForData,
      parseAttributesForDecoration: parseAttributesForDecoration,
      attributeParserMatcherByName: attributeParserMatcherByName
   };
});
