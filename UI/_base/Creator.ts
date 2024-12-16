/**
 * @kaizen_zone 7d860f70-e142-4269-a5a7-7e940b8be4da
 */
import { Control } from 'UICore/Base';

/**
 * @class UI/_base/Creator
 * @public
 */

/**
 * Создаёт корневой контрол.
 * @function UI/_base/Creator#createControl
 * @remark
 * При вызове метода инициализируется инфраструктура веб-фреймворка Wasaby.
 * Метод выполняется синхронно.
 * Для асинхронного создания контрола используйте метод {@link async}.
 * @see async
 */
/**
 * Method for creation a root control.
 * Use this method when you want to create a root control.
 * When you call this method, you create the entire
 * Wasaby infrastructure.
 * For asynchronous item creation you can use
 * {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/asynchronous-control-building/
 * UI/Base:AsyncCreator}.
 */
export default Control.createControl;

/**
 * Асинхронно создаёт элемент.
 * @remark
 * Возвращается promise, который сработает на хуке afterMount().
 * @see createControl
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function async(
    ctor: any,
    cfg: any,
    domElement: HTMLElement
): Promise<Control> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return new Promise((resolve, reject) => {
        try {
            const inst = Control.createControl(ctor, cfg, domElement);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const baseAM = inst._afterMount;

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            inst._afterMount = function (): void {
                baseAM.apply(this, arguments);
                resolve(this);
            };
        } catch (e) {
            reject(e);
        }
    });
}
