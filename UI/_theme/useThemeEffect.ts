import { useLayoutEffect, EffectCallback, DependencyList } from 'react';

function useClientThemeEffect(effectCallback: EffectCallback, dependencyList?: DependencyList) {
    useLayoutEffect(effectCallback, dependencyList);
}

// На сервере useLayoutEffect не работает, поэтому вызовем эффект сразу в рендере.
function useServerThemeEffect(effectCallback: EffectCallback) {
    effectCallback();
}

/**
 * Хук для вызова побочных эффектов темизации.
 * На сервере вызывает эффект сразу, на клиенте - через useLayoutEffect.
 * @private
 */
export const useThemeEffect: typeof useLayoutEffect =
    typeof window === 'undefined' ? useServerThemeEffect : useClientThemeEffect;
