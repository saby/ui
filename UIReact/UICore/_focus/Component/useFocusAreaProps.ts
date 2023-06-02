/**
 * @kaizen_zone b4be9e46-6d87-4cea-9487-4e0aad1e6f7b
 */
import { useEffect, useMemo, useContext, DependencyList } from 'react';
import { logger } from 'Application/Env';
import { ChainOfRef, CreateOriginRef } from 'UICore/Ref';
import { IFocusAreaProps, TFocusRef } from './FocusArea';
import { getFocusContext, FocusContextValue } from './FocusContext';
import { TFocusChangedCallback, IFocusChangedConfig } from './IFocusComponent';

// Генерация значения контекста ниже.
function useFocusContextValueBelow(
    factory: () => FocusContextValue,
    deps: DependencyList
): FocusContextValue {
    const focusContextValueBelow = useMemo(factory, deps);
    useEffect(() => {
        if (!focusContextValueBelow.arePropsTaken()) {
            logger.error(
                'Настройки фокусируемой области не достигли DOM элемента. Для работоспособности FocusArea внутри должен быть FocusRoot'
            );
        }
    }, deps);
    return focusContextValueBelow;
}

// Объединение onActivated/onDeactivated из пропсов и контекста, если есть оба.
function useActivityChangedCallback(
    callbackFromProps: TFocusChangedCallback,
    callbackFromContext: TFocusChangedCallback
): TFocusChangedCallback {
    const onActivityChanged = useMemo<TFocusChangedCallback>(() => {
        if (!callbackFromProps && !callbackFromContext) {
            return;
        }
        if (callbackFromProps && callbackFromContext) {
            return (cfg?: IFocusChangedConfig) => {
                callbackFromProps(cfg);
                callbackFromContext(cfg);
            };
        }
        return callbackFromProps || callbackFromContext;
    }, [callbackFromProps, callbackFromContext]);
    return onActivityChanged;
}

function useFocusRef(focusRef: TFocusRef, refFromContext: TFocusRef): TFocusRef {
    const joinedFocusRef = useMemo<TFocusRef>(() => {
        if (!focusRef && !refFromContext) {
            return;
        }
        if (focusRef && refFromContext) {
            return new ChainOfRef()
                .add(new CreateOriginRef(focusRef))
                .add(new CreateOriginRef(refFromContext))
                .execute();
        }
        return focusRef || refFromContext;
    }, [focusRef, refFromContext]);
    return joinedFocusRef;
}

export function useFocusAreaProps(
    props: IFocusAreaProps,
    forwaredeRef: TFocusRef
): FocusContextValue {
    const focusContextValue = useContext(getFocusContext());
    const focusContextProps = focusContextValue.getFocusProps();
    const onActivated = useActivityChangedCallback(
        props.onActivated,
        focusContextProps.onActivated
    );
    const onDeactivated = useActivityChangedCallback(
        props.onDeactivated,
        focusContextProps.onDeactivated
    );
    const ref = useFocusRef(forwaredeRef, focusContextProps.ref);
    const focusContextValueBelow = useFocusContextValueBelow(() => {
        return new FocusContextValue({
            onActivated,
            onDeactivated,
            tabIndex: props.tabIndex ?? focusContextProps.tabIndex,
            autofocus: props.autofocus ?? focusContextProps.autofocus,
            cycling: props.cycling ?? focusContextProps.cycling,
            unclickable: props.unclickable ?? focusContextProps.unclickable,
            ref,
        });
    }, [
        onActivated,
        onDeactivated,
        props.tabIndex ?? focusContextProps.tabIndex,
        props.autofocus ?? focusContextProps.autofocus,
        props.cycling ?? focusContextProps.cycling,
        props.unclickable ?? focusContextProps.unclickable,
        ref,
    ]);
    return focusContextValueBelow;
}
