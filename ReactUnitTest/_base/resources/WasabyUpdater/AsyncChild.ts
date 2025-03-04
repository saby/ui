import { Control, IControlOptions, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/WasabyUpdater/AsyncChild';

export default class AsyncChild extends Control<IControlOptions> {
    _template: TemplateFunction = template;

    _beforeMount(): Promise<void> {
        setTimeout(() => {
            // @ts-ignore такая ситуация возможно при наличии чистых реакт-компоннетов
            // например в вебинарах https://online.sbis.ru/opendoc.html?guid=7c539537-be5a-4802-9088-da5d9df1ed35
            // сценарий:
            // 1. Создать вебинар, перейти в него.
            // 2. Открыть и сразу закрыть "Чат" (практически двойной клик).
            // 3. Ещё раз открыть и закрыть "Чат".
            // 4. Нажать "Настройки".
            // в данном случае "чат" - асинхронный и не успевает построиться,
            // он останется в очереди если ее не почистить, тем самым блокирую другие перерисовки
            this._$wasabyUpdater.registerUnmountControl(this);
        }, 0);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1);
        });
    }
}
