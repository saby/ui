/**
 */

import { IModuleProcessor } from './module/Base';
import ModuleAMD from './module/AMD';
import ModuleUMD from './module/UMD';

/**
 * Создать процессор, который выполняет компиляцию модуля в необходимый формат.
 * @param type {string} Формат модуля. Поддерживается amd, umd форматы.
 * @returns {IModuleProcessor} Инстанс процессора.
 */
export default function createModuleProcessor(type: string): IModuleProcessor {
    if (type === 'amd') {
        return new ModuleAMD();
    }
    if (type === 'umd') {
        return new ModuleUMD();
    }

    throw new Error(`Unknown module type "${type}"`);
}
