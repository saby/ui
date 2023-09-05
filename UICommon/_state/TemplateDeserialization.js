define('UICommon/_state/TemplateDeserialization', [
   'UICommon/_state/FunctionHeaderTemplate'
], function (FunctionHeaderTemplate) {
   /**
    */
   var objectFunctionHeaderTemplate;

   /**
    * Проверить, найденное имя переменной корректное или нет.
    * @param name
    * @returns {boolean}
    */
   function isValidIdentifierName(name) {
      return /^\w+$/.test(name);
   }

   /**
    * Получить шаблон заголовка совместимости.
    * @returns {string} Шаблон заголовка совместимости.
    */
   function getObjectFunctionHeaderTemplate() {
      if (objectFunctionHeaderTemplate === undefined) {
         objectFunctionHeaderTemplate = FunctionHeaderTemplate.default;
         objectFunctionHeaderTemplate = objectFunctionHeaderTemplate
            ? objectFunctionHeaderTemplate.replace(/\r/g, '')
            : '';
      }
      return objectFunctionHeaderTemplate;
   }

   /**
    * Разобрать строковое представление функции на аргументы и тело.
    * @param template Строковое представление функции.
    */
   function splitStringFunction(template) {
      var argsStart = template.indexOf('(') + 1;
      var argsEnd = template.indexOf(')', argsStart);
      var stringArgs = template.slice(argsStart, argsEnd);
      var args = stringArgs.split(',').map(function(v) {
         return v.trim();
      });
      var bodyStart = template.indexOf('{') + 1;
      var dodyEnd = template.lastIndexOf('}');
      var body = template.slice(bodyStart, dodyEnd);
      return {
         args: args,
         stringArgs: stringArgs,
         body: body
      };
   }

   /**
    * Создать объект-хранилище всех переменных, участвующих в обработке.
    * @param args Набор параметров функции шаблона.
    */
   function createIdentifiers(args) {
      return {
         data: args[0],
         attr: args[1],
         context: args[2],
         isVdom: args[3],
         sets: args[4],
         thelpers: undefined,
         depsLocal: undefined,
         viewController: undefined
      };
   }

   /**
    * Подставить переменные из параметров функции шаблона.
    * @param compatibilityHeader Заголовок совместимости.
    * @param identifiers Объект-хранилище всех переменных, участвующих в обработке.
    * @returns {string} Модифицированный заголовок совместимости, в случае успеха обработки.
    */
   function processArguments(compatibilityHeader, identifiers) {
      // Выполним замену по параметрам функции: data, attr, context, isVdom, sets
      // В шаблоне реально используются только data и attr.
      return compatibilityHeader
         .replace(/data/g, identifiers.data)
         .replace(/attr/g, identifiers.attr);
   }

   /**
    * Подставить переменную на место thelpers.
    * @param compatibilityHeader Заголовок совместимости.
    * @param identifiers Объект-хранилище всех переменных, участвующих в обработке.
    * @param body Тело исходной функции шаблона.
    * @returns {string} Модифицированный заголовок совместимости, в случае успеха обработки.
    */
   function processTHelpersVar(compatibilityHeader, identifiers, body) {
      if (typeof identifiers.thelpers === 'string') {
         return compatibilityHeader.replace(/thelpers/g, identifiers.thelpers);
      }

      var thelpers;

      // Паттерн: thelpers.templateError("/*#FILE_NAME#*/", e, data);
      // Берем самый последний паттерн, тк имеем место быть вложенным шаблонам.
      var thelpersMatch = body.match(/\w+\.(templateError|L)\(/g);
      if (thelpersMatch) {
         thelpers = thelpersMatch.pop().split('.').shift();
         if (isValidIdentifierName(thelpers)) {
            identifiers.thelpers = thelpers;
            return compatibilityHeader.replace(/thelpers/g, thelpers);
         }
      }

      // Паттерн: thelpers.v /* validateNodeKey */(attr && attr.key)
      // Берем самый первый паттерн
      thelpersMatch = body.match(/(\w+)\.(validateNodeKey|v)[^(]*\(\w+\s*&&\s*\w+\.key\)/);
      if (thelpersMatch) {
         thelpers = thelpersMatch[1];
         if (isValidIdentifierName(thelpers)) {
            identifiers.thelpers = thelpers;
            return compatibilityHeader.replace(/thelpers/g, thelpers);
         }
      }

      // Паттерн: thelpers.v /* validateNodeKey */(attr?.key);
      // Берем самый первый паттерн
      thelpersMatch = body.match(/(\w+)\.(validateNodeKey|v)[^(]*\(\w+\?\.key\)/);
      if (thelpersMatch) {
         thelpers = thelpersMatch[1];
         if (isValidIdentifierName(thelpers)) {
            identifiers.thelpers = thelpers;
            return compatibilityHeader.replace(/thelpers/g, thelpers);
         }
      }

      return compatibilityHeader;
   }

   /**
    * Подставить переменную на место viewController.
    * @param compatibilityHeader Заголовок совместимости.
    * @param identifiers Объект-хранилище всех переменных, участвующих в обработке.
    * @param body Тело исходной функции шаблона.
    * @returns {string} Модифицированный заголовок совместимости, в случае успеха обработки.
    */
   function processViewControllerVar(compatibilityHeader, identifiers, body) {
      if (typeof identifiers.viewController === 'string') {
         return compatibilityHeader.replace(
             /viewController/g,
             identifiers.viewController
         );
      }

      var viewController;

      // Паттерн: , "viewController": viewController,
      // Берем самый последний паттерн, тк имеем место быть вложенным шаблонам.
      var viewControllerMatch = body.match(
         /,\s*['"]?viewController['"]?\s*:\s*\w+\s*,/g
      );
      if (viewControllerMatch) {
         viewController = viewControllerMatch
            .pop()
            .split(':')
            .pop()
            .replace(',', '')
            .trim();
         if (isValidIdentifierName(viewController)) {
            identifiers.viewController = viewController;
            return compatibilityHeader.replace(
               /viewController/g,
               viewController
            );
         }
      }

      // Паттерн: ], attr, defCollection, viewController, true|false) функции createTag
      // Берем самый последний паттерн, тк имеем место быть вложенным шаблонам.
      var viewControllerRegex = new RegExp(
         ']\\s*,\\s*' + identifiers.attr + '\\s*,\\s*\\w+\\s*,\\s*\\w+\\s*\\,\\s*(true|false)\\s*\\)',
         'g'
      );
      viewControllerMatch = body.match(viewControllerRegex);
      if (viewControllerMatch) {
         viewController = viewControllerMatch.pop().split(',')[3].trim();
         if (isValidIdentifierName(viewController)) {
            identifiers.viewController = viewController;
            return compatibilityHeader.replace(
               /viewController/g,
               viewController
            );
         }
      }

      // Третий паттерн -- поиск через динамическое свойство viewControllerDynamic.
      var viewControllerDynamic = body.match(/(\w+)\s*=\s+["']viewController['"][,;]/g);
      if (Array.isArray(viewControllerDynamic)) {
         // eslint-disable-next-line guard-for-in
         for (var i in viewControllerDynamic) {
            var depsLocalDynamic = viewControllerDynamic[i].split('=')[0].trim();
            viewControllerRegex = new RegExp(
                '\\[' + depsLocalDynamic + '\\]\\s*:\\s*(\\w+)',
                ''
            );

            viewControllerMatch = body.match(viewControllerRegex);
            if (viewControllerMatch) {
               viewController = viewControllerMatch[1];
               if (isValidIdentifierName(viewController)) {
                  identifiers.viewController = viewController;
                  return compatibilityHeader.replace(
                      /viewController/g,
                      viewController
                  );
               }
            }
         }
      }

      return compatibilityHeader;
   }

   /**
    * Подставить переменную на место depsLocal.
    * @param compatibilityHeader Заголовок совместимости.
    * @param identifiers Объект-хранилище всех переменных, участвующих в обработке.
    * @param body Тело исходной функции шаблона.
    * @returns {string} Модифицированный заголовок совместимости, в случае успеха обработки.
    */
   function processDepsLocal(compatibilityHeader, identifiers, body) {
      if (typeof identifiers.depsLocal === 'string') {
         return compatibilityHeader.replace(/depsLocal/g, identifiers.depsLocal);
      }

      // Паттерн: , context, depsLocal, includedTemplates, thelpers.config)
      // Берем самый последний паттерн, тк имеем место быть вложенным шаблонам.
      var depsLocal;
      // eslint-disable-next-line no-useless-escape
      var depsLocalRegex = new RegExp(
         ',\\s*' +
            identifiers.context +
            '\\s*,\\s*\\w+\\s*,\\s*\\w+\\s*,\\s*' +
            identifiers.thelpers +
            '\\.config\\s*\\)',
         'g'
      );
      var depsLocalMatch = body.match(depsLocalRegex);
      if (depsLocalMatch) {
         depsLocal = depsLocalMatch.pop().split(',')[2].trim();
         if (isValidIdentifierName(depsLocal)) {
            identifiers.depsLocal = depsLocal;
            return compatibilityHeader.replace(/depsLocal/g, depsLocal);
         }
      }

      // Второй паттерн: , depsLocal, includedTemplates, thelpers.config,
      // Берем самый последний паттерн, тк имеем место быть вложенным шаблонам.
      depsLocalRegex = new RegExp(
         ',\\s*\\w+\\s*,\\s*\\w+\\s*,\\s*' +
            identifiers.thelpers +
            '\\.config\\s*,',
         'g'
      );
      depsLocalMatch = body.match(depsLocalRegex);
      if (depsLocalMatch) {
         depsLocal = depsLocalMatch.pop().split(',')[1].trim();
         if (isValidIdentifierName(depsLocal)) {
            identifiers.depsLocal = depsLocal;
            return compatibilityHeader.replace(/depsLocal/g, depsLocal);
         }
      }

      // Третий паттерн (конфиг функции createControlNew): , depsLocal: variable,
      depsLocalRegex = new RegExp(
         ',\\s*[\'"]?depsLocal[\'"]?:\\s*(\\w+),',
         'g'
      );
      depsLocalMatch = body.match(depsLocalRegex);
      if (depsLocalMatch) {
         depsLocal = depsLocalMatch.pop().split(',')[1].split(':')[1].trim();
         if (isValidIdentifierName(depsLocal)) {
            identifiers.depsLocal = depsLocal;
            return compatibilityHeader.replace(/depsLocal/g, depsLocal);
         }
      }

      // Четвертый паттерн -- поиск через динамическое свойство depsLocalDynamic.
      var depsLocalDynamicMach = body.match(/(\w+)\s*=\s+["']depsLocal['"][,;]/g);
      if (Array.isArray(depsLocalDynamicMach)) {
         // eslint-disable-next-line guard-for-in
         for (var i in depsLocalDynamicMach) {
            var depsLocalDynamic = depsLocalDynamicMach[i].split('=')[0].trim();
            depsLocalRegex = new RegExp(
                '\\[' + depsLocalDynamic + '\\]\\s*:\\s*(\\w+)',
                ''
            );

            depsLocalMatch = body.match(depsLocalRegex);
            if (depsLocalMatch) {
               depsLocal = depsLocalMatch[1];
               if (isValidIdentifierName(depsLocal)) {
                  identifiers.depsLocal = depsLocal;
                  return compatibilityHeader.replace(
                      /depsLocal/g,
                      depsLocal
                  );
               }
            }
         }
      }

      return compatibilityHeader;
   }

   /**
    * Восстановить функцию шаблона с заголовком совместимости.
    * @param compatibilityHeader Заголовок совместимости.
    * @param func Разобранная исходная функция.
    * @returns {function|undefined} Функция шаблона в случае успеха, либо undefined.
    */
   function tryCreateFunction(compatibilityHeader, func) {
      try {
         // Если функцию построить не получится, значит это не функция и нужно вернуть строку как было
         // eslint-disable-next-line no-new-func
         var repairedFunction = new Function(
            func.stringArgs,
            compatibilityHeader + func.body
         );

         // Если эта функция - контентная опция внутри заголовка таблицы (например)
         // то там она вызывается от window и уже над Window делаем Object.create в шаблоне
         // на итог - FF ругается, что кто-то трогает объект, который как бы Window,
         // но не Window
         var wrappedFunction = (function (realFunction) {
            return function wrappedRepairedFunction() {
               if (this === window) {
                  return realFunction.apply(undefined, arguments);
               }
               return realFunction.apply(this, arguments);
            };
         })(repairedFunction);

         // Пометим функцию, как ту, что пришла с сервера
         wrappedFunction.fromSerializer = true;
         return wrappedFunction;
      } catch (e) {
         return undefined;
      }
   }

   /**
    * Поиск вызова функции registerDeserializableIdentifiers для облегченного поиска подставляемых переменных.
    */
   function findRdiFunctionCall(identifiers, template) {
      var rdiArgs = template.match(
          /\w+\.rdi([^(]+)?\(\s*(\w+)\s*,\s*(\w+)\s*,\s*(\w+)\s*\)/
      );

      if (rdiArgs) {
         identifiers.thelpers = rdiArgs[2];
         identifiers.depsLocal = rdiArgs[3];
         identifiers.viewController = rdiArgs[4];
      }
   }

   function repairTemplateFunction(template) {
      // Когда с сервера пришла функция отрежем от ее описания первый кусок и
      // создадим функцию из содержимого.
      // Это режим совместимости без легких инстансов
      var func = splitStringFunction(template);

      // Будем хранить в объекте имена всех переменных, с которыми работаем,
      // потому что они востребованны при поиске других переменных.
      var identifiers = createIdentifiers(func.args);

      // В случае, если передается шаблон новой версии, попробовать найти вызов функции
      // registerDeserializableIdentifiers для однозначной детекции необходимых переменных.
      findRdiFunctionCall(identifiers, template);

      // FIXME: Вот тут мы влезаем во внутрянку кодогенерации,
      //  шаблон ObjectFunctionHeaderTemplate (ныне head).
      var compatibilityHeader = getObjectFunctionHeaderTemplate();

      // Теперь нужно выполнить замену тех переменных, которые объявлены в заголовке,
      // но используются уже в теле пришедшей функции, которая может быть минифицированной.
      // Это переменные: thelpers, depsLocal, viewController.
      // Может быть такое, что мы не сможем найти соответствующей замены переменной, тогда это значит,
      // что в процессе генерации функции в шаблон не была включена такая инструкция,
      // которая использует такую переменную и ее следует проигнорировать.
      // Идея восстановления такая: мы не знаем точно, какое имя имеет нужная переменная теперь,
      // после минификации, но мы знаем паттерны, где используются известные нам переменные
      // (из параметров функции) рядом с неизвестными (те переменные, которые нам нужны).
      compatibilityHeader = processArguments(compatibilityHeader, identifiers);
      compatibilityHeader = processTHelpersVar(
          compatibilityHeader,
          identifiers,
          func.body
      );
      compatibilityHeader = processViewControllerVar(
          compatibilityHeader,
          identifiers,
          func.body
      );
      compatibilityHeader = processDepsLocal(
          compatibilityHeader,
          identifiers,
          func.body
      );

      return {
         compatibilityHeader: compatibilityHeader,
         identifiers: identifiers,
         func: func
      };
   }

   /**
    * Десериализовать функцию шаблона.
    * @param template Сериализованная функция шаблона.
    * @returns {function|string} Восстановленная функция шаблона, либо исходная строка.
    *
    * Сюда приходит строка "TEMPLATEFUNCTOJSON=..." с определением функции из makeFunctionSerializable.
    */
   function deserializeTemplate(template) {
      var tmpl = repairTemplateFunction(template);

      var result = tryCreateFunction(tmpl.compatibilityHeader, tmpl.func);
      if (result) {
         return result;
      }
      return template;
   }

   deserializeTemplate.findRdiFunctionCall = findRdiFunctionCall;
   deserializeTemplate.repairTemplateFunction = repairTemplateFunction;

   return deserializeTemplate;
});
