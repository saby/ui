import { IActionConfig, IParamsValues } from './Interfaces';
import * as DataObjectApi from './DataObjectApi';

export class JsMethod {
    _getUnresolvedParams(action: IActionConfig, optionParams: IParamsValues): string[] {
        // все параметры
        const actionParams = action.params;
        const result: string[] = [];
        Object.keys(actionParams).forEach((key) => {
            if (!optionParams.hasOwnProperty(key)) {
                result.push(key);
            }
        });
        return result;
    }
    canExecute() {
        return true;
    }
    // getParams по умолчанию условно выглядит так (если не задан иной):
    async getParams(
        action: IActionConfig,
        optionParams: IParamsValues = {}
    ): Promise<IParamsValues> {
        const unresolvedParams = this._getUnresolvedParams(action, optionParams);
        if (unresolvedParams.length) {
            // const result = await openPopup(PropertyGrid, this.defaultParams, metaParams);
            return optionParams;
        }
        return Promise.resolve(optionParams);
    }
    async execute(id: string, params: IParamsValues): Promise<unknown> {
        // запускаем DataObject.Execute - предполагаем, что внутри он запускает только бл-метод
        return DataObjectApi.execute(id, params);
    }
    afterExecute(_result: unknown) {}
}
