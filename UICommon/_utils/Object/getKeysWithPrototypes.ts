const basicPrototype: object = Object.getPrototypeOf({});

/**
 * Возвращает список ключей объекта скоупа пройдясь по всем уровням прототипов.
 * При пробрасывании скоупа мы создаём новый прототип через Object.create.
 * Нужно отслеживать изменение опций на всех уровнях.
 */
export default function getKeysWithPrototypes(obj: Object): string[] {
    if (typeof obj !== 'object') {
        return [];
    }
    const keys: string[] = [];
    let currentPrototype: object = obj;

    while (currentPrototype && currentPrototype !== basicPrototype) {
        keys.push(...Object.keys(currentPrototype));
        currentPrototype = Object.getPrototypeOf(currentPrototype);
    }

    return keys;
}
