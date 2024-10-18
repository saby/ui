/**
 * @kaizen_zone aed53143-c89f-413e-a8e4-de8b6ad43abe
 */
/**
 * Вспомогательный тип, который делает ключи K объекта O опциональными.
 */
export type Optional<O, K extends keyof O> = Omit<O, K> & Partial<Pick<O, K>>;
