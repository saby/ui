/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import { useMemo, useRef, ForwardedRef } from 'react';
import { TFocusChangedCallback } from './IFocusComponent';
import { CreateFocusCallbacksRef } from './CreateFocusCallbacksRef';
import { ChainOfRef, CreateOriginRef } from 'UICore/Ref';

/**
 * Хук максимально ленивого создания рефа сохренения колбеков на элемент.
 * Создаётся только один раз (если есть хотя бы один колбек), после чего никогда не меняется.
 * @private
 */
function useCreateFocusCallbacksRef(config: {
    onActivated?: TFocusChangedCallback;
    onDeactivated?: TFocusChangedCallback;
}): CreateFocusCallbacksRef | null {
    const { onActivated, onDeactivated } = config;
    const createFocusCallbacks = useRef<CreateFocusCallbacksRef | null>(null);
    if (!createFocusCallbacks.current && (onActivated || onDeactivated)) {
        createFocusCallbacks.current = new CreateFocusCallbacksRef(onActivated, onDeactivated);
    }
    if (createFocusCallbacks.current) {
        createFocusCallbacks.current.setOnActivated(onActivated);
        createFocusCallbacks.current.setOnDeactivated(onDeactivated);
    }
    return createFocusCallbacks.current;
}

export function useFocusCallbacks(
    config: {
        onActivated?: TFocusChangedCallback;
        onDeactivated?: TFocusChangedCallback;
    },
    additionalRef?: ForwardedRef<HTMLElement> | null
): ((element: HTMLElement | null) => void) | undefined {
    //
    const createFocusCallbacksRef = useCreateFocusCallbacksRef(config);

    // А вот при изменении additionalRef результат придётся пересоздать.
    return useMemo(() => {
        if (!additionalRef) {
            return createFocusCallbacksRef?.getHandler();
        }
        const chain = new ChainOfRef();
        chain.add(new CreateOriginRef(additionalRef));
        if (createFocusCallbacksRef) {
            chain.add(createFocusCallbacksRef);
        }
        return chain.execute();
    }, [additionalRef, createFocusCallbacksRef]);
}
