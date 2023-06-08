import { useMemo, useRef } from 'react';
import { IFocusCallbacksObject } from './IFocusComponent';
import { CreateFocusCallbacksRef } from './CreateFocusCallbacksRef';
import { ChainOfRef, CreateOriginRef } from 'UICore/Ref';

/**
 * @function TFocusCallback
 * @private
 * @param {UICore/Focus:IFocusChangedConfig} cfg
 */
/**
 * @function TElementRef
 * @private
 * @param {HTMLElement} node
 */
/**
 * @typedef {Object} TConfig
 * @private
 * @property {TFocusCallback=} onActivated - колбек получения активности
 * @property {TFocusCallback=} onDeactivated - колбек потери активности
 */
/**
 * @description Пользовательский хук для задания колбеков активации/деактивации.
 * @public
 * @function UICore/_focus/Component/useFocusCallbacks
 * @param {TConfig} config - колбеки смены активности
 * @param {TElementRef=} additionalRef - реф, который примешается к результату.
 * @returns {TElementRef} - реф, который отвечает за вызов событий активности.
 * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/focus/events-activity/
 * @example
 * <pre>
 *  import {createElement, delimitProps} from 'UICore/Jsx';
 *  import {FC, memo} from 'react';
 *  import {useFocusCallbacks, IFocusChangedConfig} from 'UICore/Focus';
 *  import {MyReactComponent} from './MyReactComponent';
 *  import {MyWasabyComponent} from './MyReactComponent';
 *
 *  const MyComponent: FC = (props) => {
 *      const {
 *          $wasabyRef,
 *          context
 *      } = delimitProps(props);
 *      const onRootActivated = useCallback((cfg: IFocusChangedConfig) => console.error('Root Activated'), []);
 *      const onRootDeactivated = useCallback((cfg: IFocusChangedConfig) => console.error('Root Deactivated'), []);
 *      const onReactActivated = useCallback((cfg: IFocusChangedConfig) => console.error('React Activated'), []);
 *      // Хотя в случае с Wasaby можно повесить и старое событие
 *      const onWasabyDectivated = useCallback((cfg: IFocusChangedConfig) => console.error('Wasaby Deactivated'), []);
 *
 *      // useFocusCallbacks сам примешает additionalRef к результату
 *      return <div ref={useFocusCallbacks({onActivated: onRootActivated, onDeactivated: onRootDeactivated}, $wasabyRef)}>
 *          <div ref={useFocusCallbacks({onActivated: onReactActivated})}>
 *              <MyReactComponent />
 *          </div>
 *          {createElement(
 *              MyWasabyComponent,
 *              {
 *                  $wasabyRef: useFocusCallbacks({onDeactivated: onWasabyDectivated})
 *              },
 *              undefined,
 *              undefined,
 *              context
 *          )}
 *      </div>
 *  };
 *  export default memo(MyComponent);
 * </pre>
 */
export function useFocusCallbacks(
    config: {
        onActivated?: IFocusCallbacksObject['onActivated'];
        onDeactivated?: IFocusCallbacksObject['onDeactivated'];
    },
    additionalRef?: (element: HTMLElement) => void
): (element: HTMLElement) => void {
    const { onActivated, onDeactivated } = config;
    const createFocusCallbacks = useRef<CreateFocusCallbacksRef>(undefined);
    if (!createFocusCallbacks.current) {
        createFocusCallbacks.current = new CreateFocusCallbacksRef(
            onActivated,
            onDeactivated
        );
    }
    // Простой способ не пересоздавать CreateFocusCallbacksRef из-за смены колбеков.
    if (createFocusCallbacks.current.getOnActivated() !== onActivated) {
        createFocusCallbacks.current.setOnActivated(onActivated);
    }
    if (createFocusCallbacks.current.getOnDeactivated() !== onDeactivated) {
        createFocusCallbacks.current.setOnDeactivated(onDeactivated);
    }

    // А вот при изменении additionalRef результат придётся пересоздать.
    return useMemo(() => {
        if (!additionalRef) {
            return createFocusCallbacks.current.getHandler();
        }
        return new ChainOfRef()
            .add(new CreateOriginRef(additionalRef))
            .add(createFocusCallbacks.current)
            .execute();
    }, [additionalRef]);
}
