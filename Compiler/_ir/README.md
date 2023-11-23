## Построение шаблона по мета-описанию

1. Процесс обработки мета-описания и построения экспорта шаблона отражен
   в модуле ``Compiler/_ir/builder/Builder.ts``.

2. Процесс создания замыкания (шаблонной функции) по телу IR шаблона отражен
   в модуле ``Compiler/_ir/builder/Closure.ts``.

3. Общие константы, доступные в любом шаблоне, размещаются
   в модуле ``Compiler/_ir/Constants.ts``.

4. Сущность построения верстки *Generator* реализована
   в директории ``Compiler/_ir/generator/impl``:
   - ``Markup.ts`` - используется в режиме построения верстки;
   - ``Internal.ts`` - используется в режиме вычисления internal выражений.

5. Сущность вычисления Mustache выражения *Methods* реализована
   в директории ``Compiler/_ir/methods/impl``.
   - ``Markup.ts`` - используется в режиме построения верстки;
   - ``Internal.ts`` - используется в режиме вычисления internal выражений.

6. Итераторы по коллекциям для конструкции ``ws:for`` размещаются
   в модуле ``Compiler/_ir/generator/flow/Iterators.ts``.