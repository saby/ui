/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
/**
 * При вызове пытается найти объект, внедрённый расширением. Если находит, то сообщает расширению о своём существовании.
 * @return Возвращает true если расширение найдено, false если не найдено (можно использовать в дев билдах для показа сообщения с рекламой расширения).
 */
export function injectHook(): boolean {
    if (
        typeof window === 'undefined' ||
        // @ts-ignore
        typeof window.__WASABY_DEV_HOOK_REACT__ === 'undefined'
    ) {
        return false;
    }
    // @ts-ignore
    window.__WASABY_DEV_HOOK_REACT__.init();
    return true;
}
