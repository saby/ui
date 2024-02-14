import {
    createElement,
    useMemo,
    PropsWithChildren,
    FunctionComponentElement,
    ProviderProps,
    useContext,
} from 'react';
import { useTheme } from './withTheme';
import { useReadonly } from './withReadonly';
import { getWasabyContext, IWasabyContextValue } from './WasabyContext';
import { Logger } from 'UICommon/Utils';

export const wasabyContextPropNames = new Set([
    'readOnly',
    'theme',
    '_physicParent',
    '_logicParent',
    '_parentKey',
    'pageData',
    'Router',
    'isAdaptive',
    'isScrollOnBody',
]);

/**
 * Контрол, управляющий контекстом совместимости. Используется для "наследования" опций theme и readOnly.
 * По умолчанию, передаёт значение из контекста вниз, но если передана опция theme или readOnly, то
 * передаётся значение из опций.
 * @param props Значения pageData, theme и readOnly, которые должны быть установлены в контекст, и элемент, который должен быть отрисован внутри.
 * @public
 * @example
 * В данном примере мы получаем тему из хранилища и устанавливаем её в контекст, чтобы дети могли её использовать:
 * <pre>
 *    render(): React.ReactNode {
 *       const theme = getUserTheme();
 *       return (<WasabyContextManager theme={theme} readOnly={readOnly}>
 *          // здесь ваш шаблон
 *       </WasabyContextManager>);
 *    }
 * </pre>
 */
export function WasabyContextManager(
    props: PropsWithChildren<Partial<IWasabyContextValueProps>>
): FunctionComponentElement<ProviderProps<IWasabyContextValue>> {
    const { Provider } = getWasabyContext();
    let wasabyContext;
    let readOnly;
    let theme;
    let _physicParent;
    let _logicParent;
    let _parentKey;
    let pageData;
    let Router;
    let isAdaptive;
    let isScrollOnBody;
    let workByKeyboard;
    try {
        wasabyContext = useContext(getWasabyContext());
        readOnly = useReadonly(props);
        theme = useTheme(props);
        _physicParent = props._physicParent ?? wasabyContext._physicParent;
        _logicParent = props._logicParent ?? wasabyContext._logicParent;
        _parentKey = props._parentKey ?? wasabyContext._parentKey ?? props.rskey;

        pageData = props.pageData ?? wasabyContext.pageData;
        Router = props.Router ?? wasabyContext.Router;
        isAdaptive = props.isAdaptive ?? wasabyContext.isAdaptive;
        isScrollOnBody = props.isScrollOnBody ?? wasabyContext.isScrollOnBody;
        workByKeyboard = props.workByKeyboard ?? wasabyContext.workByKeyboard;
    } catch (error) {
        const message = `Ошибка при построении WasabyContextManager из модуля ${props.moduleName}`;
        Logger.error(message, props, error);
        throw error;
    }

    const value = useMemo(() => {
        /*
        В контекст кладётся именно объект по такой причине: для поддержки наследуемых опций нам нужно во все старые
        контролы подключить контекст. В классовые контролы контекст мы можем подключить только через contextType,
        а туда можно положить только один контекст.
         */
        return {
            readOnly,
            theme,
            _physicParent,
            _logicParent,
            _parentKey,
            pageData,
            Router,
            isAdaptive,
            isScrollOnBody,
            workByKeyboard,
        };
    }, [
        _parentKey,
        _physicParent,
        _logicParent,
        readOnly,
        theme,
        pageData,
        Router,
        isAdaptive,
        isScrollOnBody,
        workByKeyboard,
    ]);

    /*
    Provider должен создаваться безусловно, даже если опции не переданы или они совпадают со значением из контекста.
    Если мы начнём создавать Provider только в части случаев, то произойдёт следующее: у части контролов появится новый
    родитель, реакт в таком случае удаляет старое дерево и маунтит новое, а это приведёт к тормозам и потере стейта.
     */
    return createElement(Provider, {
        value,
        children: props.children,
    });
}

interface IWasabyContextValueProps extends IWasabyContextValue {
    // Самый первый контрол Index обязан вставить WasabyContextManager передав в него все props.
    // В этом props будет rskey = "bd_", который нужно прокинуть как начальное значение ключа для receivedState
    rskey?: string;
}
