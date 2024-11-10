/**
 * @kaizen_zone ce2d78ce-ad75-44f2-a211-06e89b0e061a
 */
import { childrenPropsModificatorSingleton } from './ChildrenPropsModificator';

import { defaultStrategy } from './_elementCreatorStrategies/Default';
import { domElementStrategy } from './_elementCreatorStrategies/DomElement';
import { elementCreatorStrategy } from './_elementCreatorStrategies/ElementCreator';

// Стратегия по умолчанию добавляется обязательно первой, потому что должна выбраться только если остальные не подошли.
childrenPropsModificatorSingleton.pushStrategy(defaultStrategy);

// Далее пуш в любом порядке, но лучше если в конце будут стратегии с более быстрыми shouldUseIt.
childrenPropsModificatorSingleton.pushStrategy(domElementStrategy);
childrenPropsModificatorSingleton.pushStrategy(elementCreatorStrategy);

// Экспорт компонента ElementCreator.
export { default as ElementCreator } from './_elementCreatorStrategies/ElementCreator';
