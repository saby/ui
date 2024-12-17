/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import { useMemo, useRef, MutableRefObject } from 'react';
import { IFocusCallbacksObject } from './IFocusComponent';
import { CreateFocusCallbacksRef } from './CreateFocusCallbacksRef';
import { ChainOfRef, CreateOriginRef } from 'UICore/Ref';

export function useFocusCallbacks(
    config: {
        onActivated?: IFocusCallbacksObject['onActivated'];
        onDeactivated?: IFocusCallbacksObject['onDeactivated'];
    },
    additionalRef?:
        | ((element: HTMLElement) => void)
        | MutableRefObject<HTMLElement>
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
        const chain = new ChainOfRef();
        if (additionalRef) {
            chain.add(new CreateOriginRef(additionalRef));
        }
        if (onActivated || onDeactivated) {
            chain.add(createFocusCallbacks.current);
        }
        return chain.execute();
    }, [additionalRef, !!(onActivated || onDeactivated)]);
}
