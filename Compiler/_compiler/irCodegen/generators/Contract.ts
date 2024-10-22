/**
 * @author Krylov M.A.
 *
 * Контракт именования свойств служебных объектов.
 */

/**
 * Поля интерфейса IElementConfiguration.
 */
export const ElementConfiguration = {
    key: 'K',
    attributes: 'A',
    events: 'E',

    // configuration properties
    isRootElementNode: 'r',
    isContainerNode: 'c'
};

export const mergeTypeDefaultValue = 'context';

/**
 * Поля интерфейса IComponentConfiguration.
 */
export const ComponentConfiguration = {
    ...ElementConfiguration,
    options: 'O',

    // configuration properties
    mergeType: 'm',
    blockOptionNames: 'b',
    compositeAttributes: 'a',
    isRootComponentNode: 'g',
    refForContainer: 'f',
    internalsMetaId: 'i'
};

/**
 * Поля интерфейса IDescription.
 */
export const Description = {
    version: 'v',
    moduleName: 'm',
    dependencies: 'd',
    templates: 't',
    reactiveProperties: 'p',
    mustacheExpressions: 'e',
    internalsMeta: 'i',
    names: 'n'
};

/**
 * Поля интерфейса IContext.
 */
export const Context = {
    data: 'd',
    viewController: 'v'
};

export default {
    ElementConfiguration,
    ComponentConfiguration,
    mergeTypeDefaultValue,
    Description,
    Context
};
