import { useState, RefObject, useRef } from 'react';
import { loadAsync } from 'WasabyLoader/ModulesLoader';
import useEventListener from './useAddEventListener';

const DELAY = 350;
type TLoadResult<T> = (T | Error)[];
/**
 * хук для загрузки статики по ховеру
 * @param modules Массив загружаемых ресурсов
 * @param ref Ссылка на объект, ховер над которым будет вызывать загрузку
 * @param delay Задержка в мс. Сколько нужно продержать мышку над элементом, чтобы началась загрузка
 * @returns возварщает массив с результатами загрузки
 */
export function useHoverLoad<T>(
    modules: string[],
    ref: RefObject<HTMLElement>,
    delay: number = DELAY
) {
    const dateRef = useRef(0);
    const [data, setData] = useState<TLoadResult<T> | null>(null);
    let timerId: number;
    const load = useRef<TLoadResult<T>>();

    const leaveHandler = () => {
        const hoverTime = Date.now() - dateRef.current;
        if (hoverTime < delay) {
            clearInterval(timerId);
        }
    };

    const enterHandler = () => {
        dateRef.current = Date.now();
        if (load.current) {
            return;
        }
        timerId = setTimeout(() => {
            const waiters = modules.map((module) => loadAsync<T>(module));
            Promise.allSettled(waiters).then((result: PromiseSettledResult<T | Error>[]) => {
                const _data: TLoadResult<T> = result.map((item) =>
                    item.status === 'fulfilled' ? item.value : item.reason
                );
                load.current = _data;
                setData(_data);
            });
        }, delay);
    };
    useEventListener('mouseenter', enterHandler, ref);
    useEventListener('mouseleave', leaveHandler, ref);
    return { data };
}
