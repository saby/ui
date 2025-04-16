/**
 * @author Krylov M.A.
 */

import type { IModuleGenerator } from './module/Interface';

import AMD from './module/format/AMD';
import UMD from './module/format/UMD';

import createDependenciesController from './module/Dependencies';
import createExportsController from './module/Exports';

/**
 * Создать генератор, оформляющий скомпилированный шаблон в нужный формат.
 * @param {string} type Формат модуля. Поддерживается amd, umd форматы.
 */
export default function createModuleProcessor(type: string): IModuleGenerator {

    const dependencies = createDependenciesController();
    const exports = createExportsController();

    if (type === 'amd') {
        return new AMD(dependencies, exports);
    }

    if (type === 'umd') {
        return new UMD(dependencies, exports);
    }

    throw new Error(`Unknown module type "${type}"`);
}
