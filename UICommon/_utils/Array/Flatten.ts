/**
 */
/**
 * Модуль, в котором описана функция <b>flatten(arr)</b>.
 *
 * "Выравнивает" вложенные массивы (любого уровня вложенности), склеивая в одноуровневый массив.
 *
 * @param {Array} arr
 * @param {Boolean} skipUndefined
 * @param {Boolean} skipEmptyString
 * @returns {Array}
 * @example
 * <pre>
 * flatten([1, [2], [3, [[4]]]]) => [1, 2, 3, 4]
 * </pre>
 */
export default function flatten<T>(
    arr: T[],
    skipUndefined?: boolean,
    skipEmptyString?: boolean
): T[] {
    let result: T[] = [];
    for (const arrElem of arr) {
        if (Array.isArray(arrElem)) {
            result = result.concat(flatten<T>(arrElem, skipUndefined, skipEmptyString));
            if (isForArr(arrElem)) {
                Object.defineProperty(result, 'for', {
                    value: true,
                    enumerable: false,
                });
            }
        } else {
            if (skipUndefined && arrElem === undefined) {
                continue;
            }

            // Убираем пустые строки, чтобы не трогать кодогенерацию одинаковую для React и Inferno
            // Inferno отрисовывает пустые строки, а для React это не валидная нода
            if (skipEmptyString && arrElem === '') {
                continue;
            }
            result.push(arrElem);
        }
    }
    return result;
}

type TArrWithFor = unknown[] & {
    for: true;
};
function isForArr(arr: unknown[]): arr is TArrWithFor {
    return (arr as TArrWithFor).for;
}
