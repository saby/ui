import type { IControlOptions } from 'UICommon/Base';
import { resolveDefaultOptions } from './OptionsResolver';
import { Logger } from 'UICommon/Utils';

/**
 * Создание пропсов с учетом ранее расчитанных опций на этапе генерации
 * @param props
 * @param defaultOptions
 * @param inst
 * @returns
 */
export function fromReactProps<T extends IControlOptions>(props: T, defaultOptions, inst): T {
    // восстанавливаем ОПЦИЮ key, чтобы она попала в props
    // надо смотреть на наличие ключа, т.к. может передаваться значение null или 0,
    // на которое могут быть завязаны проверки в хуках
    const hasOptionKey = props._$key !== undefined;
    if (hasOptionKey) {
        Logger.error(
            "Обнаружено использование опции 'key' в " +
                inst._moduleName +
                '. Для оптимизации построения необходимо переименовать опцию',
            inst
        );
    }
    let newProps;
    if (props._$preparedProps && !hasOptionKey) {
        if (Object.keys(defaultOptions).length) {
            newProps = { ...props };
            resolveDefaultOptions(newProps, defaultOptions);
            return newProps;
        }
        return props;
    }

    // клон нужен для того, чтобы не мутировать реактовские опции при подкладывании readOnly и theme
    newProps = { ...props };
    newProps.readOnly = props.readOnly ?? inst.context?.readOnly;
    newProps.theme = props.theme ?? inst.context?.theme;
    newProps._registerAsyncChild = props._registerAsyncChild ?? inst.context?._registerAsyncChild;
    newProps._physicParent = props._physicParent ?? inst.context?._physicParent;
    newProps.pageData = props.pageData ?? inst.context?.pageData;
    newProps.Router = props.Router ?? inst.context?.Router;
    newProps.isAdaptive = props.isAdaptive ?? inst.context?.isAdaptive;
    if (hasOptionKey) {
        newProps.key = newProps._$key;
    }

    resolveDefaultOptions(newProps, defaultOptions);

    return newProps;
}

/**
 * Добавляем опции из контекста в опции компонента, если значение отсутсвует в скопе
 * @param config
 * @param scope
 * @returns
 */
export function extendFromViewController(config, scope: IControlOptions) {
    if (!config || !config.viewController) {
        return scope;
    }
    const wasabyContext = config.viewController;
    scope.readOnly = scope.readOnly ?? wasabyContext?.readOnly;
    scope.theme = scope.theme ?? wasabyContext?.theme;
    scope._registerAsyncChild = scope._registerAsyncChild ?? wasabyContext?._registerAsyncChild;
    scope._physicParent = scope._physicParent ?? wasabyContext?._physicParent;
    scope.pageData = scope.pageData ?? wasabyContext.context?.pageData;
    scope._$preparedProps = true;
    return scope;
}
