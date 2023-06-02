/* eslint-disable */

import { IBuilderScope, TObject, TAttributes } from './IGeneratorType';

/**
 */
export interface IBuilder {
    /**
     * Создаем контрол
     * @param cnstr
     * @param scope
     * @param decOptions
     * @returns {TObject | string}
     */
    buildForNewControl(
        scope: IBuilderScope,
        cnstr: Function,
        decOptions: TAttributes
    ): TObject | string;
}
